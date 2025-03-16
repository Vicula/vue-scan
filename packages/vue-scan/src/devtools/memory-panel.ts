import { getPluginApi } from './utils';
import type { ComponentMemoryStats } from '../core/memory-profiler';
import memoryProfiler from '../core/memory-profiler';
// Import the MemoryProfilerPanel component
import MemoryProfilerPanel from './components/MemoryProfilerPanel.vue';
import { defineCustomPanel } from './utils';

/**
 * Sets up memory profiler panel in Vue DevTools
 */
export function setupMemoryProfilerPanel() {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Get the DevTools API
  const api = getPluginApi();
  if (!api) {
    console.debug(
      '[Vue Scan] DevTools API not available, skipping memory panel setup',
    );
    return;
  }

  // Make memory profiler available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).$memoryProfiler = {
      getStats: memoryProfiler.getMemoryStats,
      clearStats: memoryProfiler.clearMemoryStats,
      startTracking: memoryProfiler.startMemoryTracking,
      stopTracking: memoryProfiler.stopMemoryTracking,
    };
  }

  // Define the custom memory profiler panel
  defineCustomPanel({
    id: 'vue-scan-memory-panel',
    label: 'Memory Profiler',
    icon: 'memory',
    component: MemoryProfilerPanel,
  });

  // Register the memory panel inspector
  api.addInspector({
    id: 'vue-scan-memory',
    label: 'Memory Profiler',
    icon: 'memory',
    treeFilterPlaceholder: 'Search components...',
    actions: [
      {
        icon: 'refresh',
        tooltip: 'Refresh memory stats',
        action: () => {
          sendMemoryStatsToDevtools();
        },
      },
      {
        icon: 'delete',
        tooltip: 'Clear memory stats',
        action: () => {
          memoryProfiler.clearMemoryStats();
          sendMemoryStatsToDevtools();
        },
      },
    ],
  });

  // Set up custom timeline event
  api.addTimelineLayer({
    id: 'vue-scan-memory-timeline',
    label: 'Memory Usage',
    color: 0x8c6fef,
  });

  // Start memory tracking
  memoryProfiler.startMemoryTracking(2000);

  // Start periodic updates
  const intervalId = setInterval(() => {
    sendMemoryStatsToDevtools();
  }, 2000);

  // Clean up on app unmount
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      clearInterval(intervalId);
    });
  }

  // Send initial data
  setTimeout(() => {
    sendMemoryStatsToDevtools();
  }, 500);

  /**
   * Sends memory stats to DevTools
   */
  function sendMemoryStatsToDevtools() {
    if (!api) {
      return;
    }

    const stats = memoryProfiler.getMemoryStats();
    const formattedStats = formatMemoryStatsForDevtools(stats);

    // Send to inspector
    api.sendInspectorState('vue-scan-memory', formattedStats);

    // Group components by name
    const componentMap = new Map<string, ComponentMemoryStats>();
    Object.entries(stats).forEach(([name, stat]) => {
      componentMap.set(name, stat);
    });

    // Build inspector tree
    const nodes = Array.from(componentMap.entries()).map(([name, stat]) => ({
      id: name,
      label: name,
      tags: [
        {
          label: `${stat.instanceCount} instances`,
          color: 0x42b883,
        },
        {
          label: `${(stat.averageHeapUsed / (1024 * 1024)).toFixed(2)} MB`,
          color: getMemoryColor(stat.averageHeapUsed),
        },
      ],
    }));

    // Send tree to inspector
    api.sendInspectorTree('vue-scan-memory', nodes);

    // Also record in timeline if available
    if (api.addTimelineEvent) {
      const totalMemory = Object.values(stats).reduce(
        (total, stat) => total + stat.lastHeapUsed,
        0,
      );

      api.addTimelineEvent({
        layerId: 'vue-scan-memory-timeline',
        event: {
          time: Date.now(),
          data: {
            total: (totalMemory / (1024 * 1024)).toFixed(2) + ' MB',
            components: Object.keys(stats).length,
          },
          title: 'Memory Usage',
          groupId: 'vue-scan-memory',
        },
      });
    }
  }
}

/**
 * Formats memory stats for DevTools display
 */
function formatMemoryStatsForDevtools(
  stats: Record<string, ComponentMemoryStats>,
): Record<string, any> {
  const sections: Record<string, any> = {
    summary: {
      'Total Components': Object.keys(stats).length,
      'Total Instances': Object.values(stats).reduce(
        (sum, stat) => sum + stat.instanceCount,
        0,
      ),
      'Average Heap Per Component': formatByteSize(
        Object.values(stats).reduce(
          (sum, stat) => sum + stat.averageHeapUsed,
          0,
        ) / Math.max(Object.keys(stats).length, 1),
      ),
    },
  };

  // Add component-specific sections
  Object.entries(stats).forEach(([componentName, stat]) => {
    sections[componentName] = {
      'Component Name': componentName,
      'Instance Count': stat.instanceCount,
      'Current Heap': formatByteSize(stat.lastHeapUsed),
      'Average Heap': formatByteSize(stat.averageHeapUsed),
      'Maximum Heap': formatByteSize(stat.maxHeapUsed),
      'Minimum Heap': formatByteSize(stat.minHeapUsed),
      'Snapshot Count': stat.snapshots.length,
    };
  });

  return sections;
}

/**
 * Formats bytes to MB with 2 decimal places
 */
function formatByteSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Returns a color based on memory usage
 */
function getMemoryColor(bytes: number): number {
  const mb = bytes / (1024 * 1024);

  if (mb < 1) {
    return 0x42b883; // Green for < 1MB
  }
  if (mb < 5) {
    return 0xe6c029; // Yellow for < 5MB
  }
  if (mb < 20) {
    return 0xf1662a; // Orange for < 20MB
  }
  return 0xd71d1d; // Red for >= 20MB
}
