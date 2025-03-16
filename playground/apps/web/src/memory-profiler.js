// Simple memory profiler for the web app
// This is a simplified version of the memory profiler in packages/nuxt-scan/src/runtime/memory-profiler.ts

import { ref, onBeforeUnmount, nextTick } from 'vue';

// Memory snapshot interface
const memoryStats = ref({});
const instanceCountMap = new Map();
let isTracking = false;
let trackerInterval = null;

/**
 * Takes a memory snapshot for a specific component
 */
function takeMemorySnapshot(componentName) {
  // Get memory usage from performance API in browser
  const memoryInfo = performance.memory ? performance.memory : null;

  const heapUsed = memoryInfo?.usedJSHeapSize || 0;
  const instanceCount = instanceCountMap.get(componentName) || 0;

  const snapshot = {
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
    const total = stats.snapshots.reduce((sum, s) => sum + s.heapUsed, 0);
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
export function useMemoryProfile(componentName) {
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
  mounted(el, binding) {
    const componentName = binding.value || 'unnamed-component';
    el.__memoryProfile = {
      componentName,
      cleanup: useMemoryProfile(componentName),
    };
  },
  unmounted(el) {
    if (el.__memoryProfile) {
      // Cleanup handled by onBeforeUnmount in useMemoryProfile
      delete el.__memoryProfile;
    }
  },
};

// Export a plugin object with all methods attached
const plugin = {
  install(app) {
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
