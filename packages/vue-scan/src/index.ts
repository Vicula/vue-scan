/**
 * Vue Scan - A performance monitoring plugin for Vue.js applications
 * This plugin helps identify performance bottlenecks by highlighting components
 * when they rerender, tracking render time, memory usage, and other metrics.
 */

import type { App } from 'vue';
import { createPerformanceMonitor } from './core/monitor';
import { setupOverlay } from './overlay';
import { setupDevtools } from './devtools';
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
   * Track component mount time
   * @default true
   */
  trackMountTime?: boolean;

  /**
   * Track component render frequency
   * @default true
   */
  trackRenderFrequency?: boolean;
};

const defaultOptions: VueScanOptions = {
  enabled: process.env.NODE_ENV !== 'production',
  overlay: true,
  devtools: true,
  ignore: [],
  trackMemory: false,
  trackMountTime: true,
  trackRenderFrequency: true,
};

export function createVueScan(options: VueScanOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };

  // Don't include plugin in production unless explicitly enabled
  if (!mergedOptions.enabled) {
    return {
      install() {
        //
      }, // No-op
    };
  }

  return {
    install(app: App) {
      const monitor = createPerformanceMonitor(app, mergedOptions);

      if (mergedOptions.overlay) {
        setupOverlay(app, monitor);
      }

      if (mergedOptions.devtools) {
        setupDevtools(app, monitor);
      }

      // Expose the monitor on the Vue instance for debugging
      if (process.env.NODE_ENV !== 'production') {
        app.config.globalProperties.$vueScan = monitor;
      }

      console.log(`🔍 Vue Scan v${version} initialized`);
    },
  };
}

export { version };
