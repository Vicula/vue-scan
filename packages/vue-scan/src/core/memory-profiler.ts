/**
 * Memory profiler for Vue.js components
 * Tracks memory usage over time and provides statistics for each component
 */

import { nextTick, onBeforeUnmount } from 'vue';

// Types
export interface MemorySnapshot {
  timestamp: number;
  component: string;
  heapUsed: number;
  instanceCount: number;
}

export interface ComponentMemoryStats {
  component: string;
  averageHeapUsed: number;
  maxHeapUsed: number;
  minHeapUsed: number;
  lastHeapUsed: number;
  instanceCount: number;
  snapshots: MemorySnapshot[];
}

// State
const memoryStats: { value: Record<string, ComponentMemoryStats> } = {
  value: {},
};
const instanceCountMap = new Map<string, number>();
let isTracking = false;
let trackerInterval: number | null = null;

/**
 * Takes a memory snapshot for a specific component
 */
function takeMemorySnapshot(componentName: string): MemorySnapshot {
  // Get memory usage from performance API in browser
  const memoryInfo = (performance as any).memory
    ? (performance as any).memory
    : null;

  const heapUsed = memoryInfo?.usedJSHeapSize || 0;
  const instanceCount = instanceCountMap.get(componentName) || 0;

  const snapshot: MemorySnapshot = {
    timestamp: Date.now(),
    component: componentName,
    heapUsed,
    instanceCount,
  };

  if (!memoryStats.value[componentName]) {
    memoryStats.value[componentName] = {
      component: componentName,
      averageHeapUsed: heapUsed,
      maxHeapUsed: heapUsed,
      minHeapUsed: heapUsed,
      lastHeapUsed: heapUsed,
      instanceCount,
      snapshots: [snapshot],
    };
  } else {
    const stats = memoryStats.value[componentName];
    stats.snapshots.push(snapshot);
    stats.lastHeapUsed = heapUsed;
    stats.maxHeapUsed = Math.max(stats.maxHeapUsed, heapUsed);
    stats.minHeapUsed = Math.min(stats.minHeapUsed, heapUsed);
    stats.instanceCount = instanceCount;

    // Calculate average
    const total = stats.snapshots.reduce(
      (sum: number, s: MemorySnapshot) => sum + s.heapUsed,
      0,
    );
    stats.averageHeapUsed = total / stats.snapshots.length;
  }

  return snapshot;
}

/**
 * Starts tracking memory usage of all profiled components
 */
export function startMemoryTracking(intervalMs = 5000): () => void {
  if (isTracking) {
    return () => stopMemoryTracking();
  }

  isTracking = true;
  trackerInterval = window.setInterval(() => {
    for (const componentName of instanceCountMap.keys()) {
      takeMemorySnapshot(componentName);
    }
  }, intervalMs) as unknown as number;

  return () => stopMemoryTracking();
}

/**
 * Stops tracking memory usage
 */
export function stopMemoryTracking(): void {
  if (trackerInterval !== null) {
    clearInterval(trackerInterval);
    trackerInterval = null;
  }
  isTracking = false;
}

/**
 * Clears all memory statistics
 */
export function clearMemoryStats(): void {
  memoryStats.value = {};
}

/**
 * Returns all memory statistics
 */
export function getMemoryStats(): Record<string, ComponentMemoryStats> {
  return memoryStats.value;
}

/**
 * Composable to profile a component's memory usage
 */
export function useMemoryProfile(componentName: string) {
  // Increment instance count
  const currentCount = instanceCountMap.get(componentName) || 0;
  instanceCountMap.set(componentName, currentCount + 1);

  // Take initial snapshot after the component is mounted
  nextTick(() => {
    takeMemorySnapshot(componentName);
  });

  // Cleanup when component is unmounted
  onBeforeUnmount(() => {
    const count = instanceCountMap.get(componentName) || 0;
    if (count > 0) {
      instanceCountMap.set(componentName, count - 1);
    }
    takeMemorySnapshot(componentName);
  });

  return {
    takeSnapshot: () => takeMemorySnapshot(componentName),
    getStats: () => memoryStats.value[componentName],
  };
}

/**
 * Vue directive to automatically profile memory usage
 */
export const vMemoryProfile = {
  mounted(el: HTMLElement, binding: { value?: string }) {
    const componentName = binding.value || 'unnamed-component';
    (el as any).__memoryProfile = {
      componentName,
      cleanup: useMemoryProfile(componentName),
    };
  },
  unmounted(el: HTMLElement) {
    if ((el as any).__memoryProfile) {
      // Cleanup handled by onBeforeUnmount in useMemoryProfile
      delete (el as any).__memoryProfile;
    }
  },
};

// Export a plugin object with all methods attached
export default {
  install(app: any) {
    app.directive('memory-profile', vMemoryProfile);
    startMemoryTracking();
  },
  startMemoryTracking,
  stopMemoryTracking,
  getMemoryStats,
  clearMemoryStats,
  useMemoryProfile,
  vMemoryProfile,
  takeMemorySnapshot,
};
