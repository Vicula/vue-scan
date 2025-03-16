import type { VueDevtoolsHook } from '../types/vue-devtools';
import type { ComponentMemoryStats } from '../core/memory-profiler';
import memoryProfiler from '../core/memory-profiler';

/**
 * Sets up memory profiler panel in Vue DevTools
 */
export function setupMemoryProfilerPanel() {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Check if DevTools is available
  if (
    typeof window === 'undefined' ||
    typeof (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ === 'undefined'
  ) {
    console.debug(
      '[Vue Scan] DevTools not detected, skipping memory panel setup',
    );
    return;
  }

  const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ as VueDevtoolsHook;
  if (!hook) {
    return;
  }

  // Make memory profiler available globally for devtools
  (window as any).$memoryProfiler = {
    getStats: memoryProfiler.getMemoryStats,
    clearStats: memoryProfiler.clearMemoryStats,
    startTracking: memoryProfiler.startMemoryTracking,
    stopTracking: memoryProfiler.stopMemoryTracking,
  };

  // Set up custom panel for memory profiler
  hook.on('app:init', () => {
    // Register panel action
    hook.emit('register-command', {
      id: 'vue-scan:memory-profiler',
      title: 'Open Memory Profiler',
      icon: 'memory',
      action: () => {
        // Open memory profiler panel
        sendMemoryStatsToDevtools(hook);
      },
    });
  });

  // Start periodic updates
  let memoryStatsIntervalId: number | null = null;
  memoryStatsIntervalId = window.setInterval(() => {
    sendMemoryStatsToDevtools(hook);
  }, 2000) as unknown as number;

  // Start memory tracking
  memoryProfiler.startMemoryTracking(2000);
}

/**
 * Sends memory stats to DevTools
 */
function sendMemoryStatsToDevtools(hook: VueDevtoolsHook) {
  const stats = memoryProfiler.getMemoryStats();

  hook.emit('custom-inspect-state', {
    type: 'memory-stats',
    data: formatMemoryStatsForDevtools(stats),
  });
}

/**
 * Formats memory stats for DevTools display
 */
function formatMemoryStatsForDevtools(
  stats: Record<string, ComponentMemoryStats>,
): Record<string, any> {
  const formattedStats: Record<string, any> = {};

  for (const [componentName, stat] of Object.entries(stats)) {
    formattedStats[componentName] = {
      'Component Name': componentName,
      'Instance Count': stat.instanceCount,
      'Current Heap (MB)': formatByteSize(stat.lastHeapUsed),
      'Average Heap (MB)': formatByteSize(stat.averageHeapUsed),
      'Maximum Heap (MB)': formatByteSize(stat.maxHeapUsed),
      'Minimum Heap (MB)': formatByteSize(stat.minHeapUsed),
      'Snapshot Count': stat.snapshots.length,
    };
  }

  return formattedStats;
}

/**
 * Formats bytes to MB with 2 decimal places
 */
function formatByteSize(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
