import { addCustomTab } from '@nuxt/devtools-kit';
import type { ComponentMemoryStats } from '../memory-profiler.js';
import {
  getMemoryStats,
  clearMemoryStats,
  startMemoryTracking,
  stopMemoryTracking,
} from '../memory-profiler.js';

export function setupDevtoolsPanel() {
  const memoryStatsState = {
    stats: {} as Record<string, ComponentMemoryStats>,
    isTracking: false,
    refreshInterval: null as NodeJS.Timeout | null,
  };

  // Computed properties for the panel
  const getComponentCount = () => Object.keys(memoryStatsState.stats).length;
  const getInstanceCount = () => {
    return Object.values(memoryStatsState.stats).reduce(
      (sum, stat) => sum + (stat as ComponentMemoryStats).instanceCount,
      0,
    );
  };
  const getTotalMemory = () => {
    return Object.values(memoryStatsState.stats).reduce(
      (sum, stat) => sum + (stat as ComponentMemoryStats).lastHeapUsed,
      0,
    );
  };

  // Format bytes to MB
  function formatByteSize(bytes: number) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  // Define actions for the panel
  const startTracking = () => {
    startMemoryTracking(2000); // Update every 2 seconds
    memoryStatsState.isTracking = true;

    // Setup refresh interval
    memoryStatsState.refreshInterval = setInterval(() => {
      memoryStatsState.stats = getMemoryStats();
    }, 2000);
  };

  const stopTracking = () => {
    stopMemoryTracking();
    memoryStatsState.isTracking = false;

    if (memoryStatsState.refreshInterval) {
      clearInterval(memoryStatsState.refreshInterval);
      memoryStatsState.refreshInterval = null;
    }
  };

  const refreshStats = () => {
    memoryStatsState.stats = getMemoryStats();
  };

  const clearStats = () => {
    clearMemoryStats();
    memoryStatsState.stats = {};
  };

  // Initial stats fetch
  refreshStats();

  // Colors based on memory usage
  function getMemoryColor(bytes: number): string {
    const mb = bytes / (1024 * 1024);

    if (mb < 1) {
      return 'var(--color-success)';
    } // Green for < 1MB
    if (mb < 5) {
      return 'var(--color-warning)';
    } // Yellow for < 5MB
    if (mb < 20) {
      return 'var(--color-orange)';
    } // Orange for < 20MB
    return 'var(--color-error)'; // Red for >= 20MB
  }

  // Define the panel using addCustomTab instead of defineNuxtDevtoolsPanel
  addCustomTab({
    name: 'nuxt-scan-memory',
    icon: 'carbon:chart-evaluation',
    title: 'Memory Profiler',
    view: {
      type: 'iframe',
      src: '/__nuxt-scan/memory-panel',
    },
  });

  // Start tracking automatically if enabled in options
  // We could get this from the module options
  const shouldAutoStart = true;
  if (shouldAutoStart) {
    startTracking();
  }
}
