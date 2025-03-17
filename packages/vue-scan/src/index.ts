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

  /**
   * Enable DOM scanning to find components not captured through lifecycle hooks
   * @default true
   */
  enableDOMScanning?: boolean;

  /**
   * Interval for DOM scanning in milliseconds
   * @default 5000
   */
  domScanningInterval?: number;

  /**
   * Show component name labels on overlays
   * @default true
   */
  showComponentLabels?: boolean;

  /**
   * Background color for component overlays
   * @default 'rgba(255, 200, 200, 0.1)'
   */
  overlayBackgroundColor?: string;

  /**
   * Border color for component overlays
   * @default 'rgba(255, 0, 0, 0.5)'
   */
  overlayBorderColor?: string;

  /**
   * Label background color
   * @default 'rgba(0, 0, 0, 0.6)'
   */
  labelBackgroundColor?: string;

  /**
   * Label text color
   * @default 'white'
   */
  labelTextColor?: string;
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
  enableDOMScanning: true,
  domScanningInterval: 5000,
  showComponentLabels: true,
  overlayBackgroundColor: 'rgba(255, 200, 200, 0.1)',
  overlayBorderColor: 'rgba(255, 0, 0, 0.5)',
  labelBackgroundColor: 'rgba(0, 0, 0, 0.6)',
  labelTextColor: 'white',
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

      // Expose the monitor instance to components
      app.config.globalProperties.$vueScan = monitor;

      // Create a global function to trigger component highlights for testing
      (window as any).__vueScanTriggerHighlights = () => {
        console.log('Triggering component highlights manually');
        monitor.triggerHighlightAll();
      };

      // Debug log to verify the plugin is installed correctly
      console.log(
        'Vue Scan plugin installed successfully. Use window.__vueScanTriggerHighlights() to test component highlights.',
      );

      // Apply permanent overlays if enabled
      if (mergedOptions.permanentComponentOverlays) {
        // Use setTimeout to ensure this runs after components have been mounted
        setTimeout(() => {
          console.log(
            'Applying permanent overlays to all components on initialization',
          );
          if (monitor && monitor.components) {
            monitor.components.forEach((component) => {
              if (component.el) {
                const overlayColor =
                  mergedOptions.overlayBorderColor || 'rgba(255, 0, 0, 0.5)';
                component.el.style.outline = `2px solid ${overlayColor}`;
                component.el.style.outlineOffset = '-2px';

                // Add a subtle background color
                component.el.style.backgroundColor =
                  mergedOptions.overlayBackgroundColor ||
                  'rgba(255, 200, 200, 0.1)';

                // Ensure the element has position for the label
                if (component.el.style.position === 'static') {
                  component.el.style.position = 'relative';
                }

                component.el.setAttribute(
                  'data-vue-scan-component',
                  component.name,
                );
                component.el.setAttribute('data-vue-scan-id', component.id);

                // Make sure we have a visible label
                if (mergedOptions.showComponentLabels !== false) {
                  const labelSelector =
                    '.vue-scan-component-label.vue-scan-permanent-label';
                  if (!component.el.querySelector(labelSelector)) {
                    // Create and add a label
                    const labelElement = document.createElement('div');
                    labelElement.className =
                      'vue-scan-component-label vue-scan-permanent-label';
                    labelElement.textContent = component.name;
                    labelElement.style.position = 'absolute';
                    labelElement.style.top = '0';
                    labelElement.style.left = '0';
                    labelElement.style.background =
                      mergedOptions.labelBackgroundColor ||
                      'rgba(0, 0, 0, 0.6)';
                    labelElement.style.color =
                      mergedOptions.labelTextColor || 'white';
                    labelElement.style.padding = '2px 6px';
                    labelElement.style.fontSize = '10px';
                    labelElement.style.fontFamily = 'monospace';
                    labelElement.style.borderRadius = '0 0 4px 0';
                    labelElement.style.zIndex = '9999';
                    labelElement.style.pointerEvents = 'none'; // Don't interfere with clicks

                    component.el.appendChild(labelElement);
                  }
                }

                console.log(
                  `Applied initial outline to component: ${component.name}`,
                );
              }
            });
          }
        }, 1000); // Wait 1 second for components to render
      }

      // Run an initial DOM scan after components are mounted
      if (mergedOptions.enableDOMScanning) {
        setTimeout(() => {
          console.log('Running initial DOM scan for components');
          monitor.scanDOMForComponents();

          // Start periodic DOM scanning
          monitor.startPeriodicDOMScan(
            mergedOptions.domScanningInterval || 5000,
          );
        }, 2000); // Wait 2 seconds to allow initial components to mount
      }

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
