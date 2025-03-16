/**
 * Vue Scan - A performance monitoring plugin for Vue.js applications
 * This plugin helps identify performance bottlenecks by highlighting components
 * when they rerender, tracking render time, memory usage, and other metrics.
 */

import type { App } from 'vue';
import { createPerformanceMonitor } from './core/monitor';
import { setupOverlay } from './overlay';
import { setupDevtools } from './devtools';
import memoryProfiler, {
  type ComponentMemoryStats,
  vMemoryProfile,
  useMemoryProfile,
} from './core/memory-profiler';
import { version } from '../package.json';

export type VueScanOptions = {
  /**
   * Enable or disable the plugin entirely
   * @default true in development, false in production
   */
  enabled?: boolean;

  /**
   * Enable or disable the visual overlay
   * @default true
   */
  overlay?: boolean;

  /**
   * Enable or disable DevTools integration
   * @default true
   */
  devtools?: boolean;

  /**
   * Ignore certain components by name
   * @default []
   */
  ignore?: string[];

  /**
   * Track memory usage (may affect performance)
   * @default false
   */
  trackMemory?: boolean;

  /**
   * Track detailed memory usage with component-specific statistics
   * @default false
   */
  detailedMemoryTracking?: boolean;

  /**
   * Interval for memory tracking in milliseconds
   * @default 5000
   */
  memoryTrackingInterval?: number;

  /**
   * Track component mount time
   * @default true
   */
  trackMountTime?: boolean;

  /**
   * Track component render frequency
   * @default true
   */
  trackRenderFrequency?: boolean;

  /**
   * Show permanent overlay on all registered components
   * @default false
   */
  permanentComponentOverlays?: boolean;
};

const defaultOptions: VueScanOptions = {
  enabled: process.env.NODE_ENV !== 'production',
  overlay: true,
  devtools: true,
  ignore: [],
  trackMemory: true,
  detailedMemoryTracking: true,
  memoryTrackingInterval: 5000,
  trackMountTime: true,
  trackRenderFrequency: true,
  permanentComponentOverlays: false,
};

export function createVueScan(options: VueScanOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };

  // Don't include plugin in production unless explicitly enabled
  if (!mergedOptions.enabled) {
    return {
      install() {
        // No-op
      },
    };
  }

  return {
    install(app: App) {
      const monitor = createPerformanceMonitor(app, mergedOptions);

      if (mergedOptions.overlay) {
        setupOverlay(app, monitor);
      }

      // Force memory tracking to be enabled
      mergedOptions.trackMemory = true;
      mergedOptions.detailedMemoryTracking = true;

      if (mergedOptions.devtools) {
        setupDevtools(app, monitor);

        // Memory profiler needs to be initialized regardless of options
        memoryProfiler.startMemoryTracking(
          mergedOptions.memoryTrackingInterval || 5000,
        );
      }

      // Register the memory profile directive
      app.directive('memory-profile', vMemoryProfile);

      // Expose the monitor on the Vue instance for debugging
      if (process.env.NODE_ENV !== 'production') {
        app.config.globalProperties.$vueScan = monitor;

        // Also expose memory profiler when enabled
        if (mergedOptions.trackMemory || mergedOptions.detailedMemoryTracking) {
          app.config.globalProperties.$memoryProfiler = {
            getStats: memoryProfiler.getMemoryStats,
            clearStats: memoryProfiler.clearMemoryStats,
            startTracking: memoryProfiler.startMemoryTracking,
            stopTracking: memoryProfiler.stopMemoryTracking,
            useMemoryProfile: useMemoryProfile,
            directive: vMemoryProfile,
          };

          // Make memory profiler globally available for DevTools
          if (typeof window !== 'undefined') {
            (window as any).$memoryProfiler =
              app.config.globalProperties.$memoryProfiler;
          }
        }
      }

      console.log(`🔍 Vue Scan v${version} initialized`);
    },
  };
}

// Export memory profiler utilities for direct use
export { useMemoryProfile, vMemoryProfile };

export type { ComponentMemoryStats };
export { version };
