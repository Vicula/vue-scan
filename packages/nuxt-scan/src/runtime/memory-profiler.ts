import type { Component, ComponentInternalInstance } from 'vue';

interface MemorySnapshot {
  timestamp: number;
  component: string;
  heapUsed: number;
  instanceCount: number;
}

type ComponentMemoryStats = {
  component: string;
  averageHeapUsed: number;
  maxHeapUsed: number;
  minHeapUsed: number;
  lastHeapUsed: number;
  instanceCount: number;
  snapshots: MemorySnapshot[];
};

// We'll define these types when imported in client/server entry
let ref: any;
let onBeforeUnmount: any;
let nextTick: any;

// Initialize these functions when the module is installed
function initializeImports(vueInstance: any) {
  ref = vueInstance.ref;
  onBeforeUnmount = vueInstance.onBeforeUnmount;
  nextTick = vueInstance.nextTick;
}

const memoryStats: { value: Record<string, ComponentMemoryStats> } = {
  value: {},
};
const instanceCountMap = new Map<string, number>();
let isTracking = false;
let trackerInterval: NodeJS.Timeout | null = null;

/**
 * Takes a memory snapshot for a specific component
 */
function takeMemorySnapshot(componentName: string) {
  // Get memory usage from Node.js process if available (SSR)
  // or estimate using performance API in browser
  const memoryInfo = process?.memoryUsage
    ? process.memoryUsage()
    : (performance as any).memory
      ? (performance as any).memory
      : null;

  const heapUsed = memoryInfo?.heapUsed || memoryInfo?.usedJSHeapSize || 0;
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
export function startMemoryTracking(intervalMs = 5000) {
  if (isTracking) {
    return;
  }

  isTracking = true;
  trackerInterval = setInterval(() => {
    for (const componentName of instanceCountMap.keys()) {
      takeMemorySnapshot(componentName);
    }
  }, intervalMs);

  return () => stopMemoryTracking();
}

/**
 * Stops the memory tracking
 */
export function stopMemoryTracking() {
  if (trackerInterval) {
    clearInterval(trackerInterval);
    trackerInterval = null;
  }
  isTracking = false;
}

/**
 * Returns all memory statistics
 */
export function getMemoryStats() {
  return memoryStats.value;
}

/**
 * Clears all memory statistics
 */
export function clearMemoryStats() {
  memoryStats.value = {};
  instanceCountMap.clear();
}

/**
 * Composable to profile a component's memory usage
 */
export function useMemoryProfile(componentName: string) {
  // Increment instance count
  const currentCount = instanceCountMap.get(componentName) || 0;
  instanceCountMap.set(componentName, currentCount + 1);

  // Take initial snapshot after the component is mounted
  if (nextTick) {
    nextTick(() => {
      takeMemorySnapshot(componentName);
    });
  }

  // Cleanup when component is unmounted
  if (onBeforeUnmount) {
    onBeforeUnmount(() => {
      const count = instanceCountMap.get(componentName) || 0;
      if (count > 0) {
        instanceCountMap.set(componentName, count - 1);
      }
      takeMemorySnapshot(componentName);
    });
  }

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
    el.__memoryProfile = {
      componentName,
      cleanup: useMemoryProfile(componentName),
    };
  },
  unmounted(el: HTMLElement) {
    if (el.__memoryProfile) {
      // Cleanup handled by onBeforeUnmount in useMemoryProfile
      delete el.__memoryProfile;
    }
  },
};

// Extend existing types to support the __memoryProfile property
declare global {
  interface HTMLElement {
    __memoryProfile?: {
      componentName: string;
      cleanup: {
        takeSnapshot: () => MemorySnapshot;
        getStats: () => ComponentMemoryStats | undefined;
      };
    };
  }
}

// Export a plugin object with all methods attached
const plugin = {
  install(app: any) {
    // Get Vue from the app instance
    const vue = app.config.globalProperties.$nuxt?.$vue || app;
    initializeImports(vue);

    app.directive('memory-profile', vMemoryProfile);
    startMemoryTracking();
  },
  startMemoryTracking,
  stopMemoryTracking,
  getMemoryStats,
  clearMemoryStats,
  useMemoryProfile,
  vMemoryProfile,
};

export default plugin;
