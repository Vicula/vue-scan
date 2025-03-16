import type { App, Component, ComponentInternalInstance } from 'vue';
import { getCurrentInstance, onMounted, onUpdated, onUnmounted } from 'vue';
import type { VueScanOptions } from '../index';
import memoryProfiler, {
  startMemoryTracking,
  stopMemoryTracking,
  getMemoryStats,
  clearMemoryStats,
  useMemoryProfile,
} from './memory-profiler';

// Performance metrics for a component
export interface ComponentMetrics {
  // Component identification
  id: string;
  name: string;
  file?: string;

  // Render metrics
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;

  // Lifecycle metrics
  mountTime?: number;
  unmountTime?: number;

  // Memory metrics (if enabled)
  memoryUsage?: number;

  // Element reference for highlighting
  el?: HTMLElement;

  // Custom events triggered by this component
  events: {
    name: string;
    timestamp: number;
    data?: any;
  }[];
}

export interface PerformanceMonitor {
  // All tracked components
  components: Map<string, ComponentMetrics>;

  // Active renders (components currently rendering)
  activeRenders: Set<string>;

  // Options from plugin initialization
  options: VueScanOptions;

  // Methods
  trackComponent: (
    instance: ComponentInternalInstance,
  ) => ComponentMetrics | undefined;
  getComponentById: (id: string) => ComponentMetrics | undefined;
  getComponentsByName: (name: string) => ComponentMetrics[];
  highlightComponent: (id: string, color?: string) => void;
  clearHighlights: () => void;

  // Event tracking
  trackEvent: (componentId: string, eventName: string, data?: any) => void;

  // Memory tracking
  startMemoryTracking: () => void;
  stopMemoryTracking: () => void;
  getMemoryStats: () => Record<string, any>;
  clearMemoryStats: () => void;

  // Testing utility
  triggerHighlightAll: () => void;
}

/**
 * Create a new performance monitor instance
 */
export function createPerformanceMonitor(
  app: App,
  options: VueScanOptions,
): PerformanceMonitor {
  const components = new Map<string, ComponentMetrics>();
  const activeRenders = new Set<string>();
  const memoryTrackingInterval: number | null = null;

  // Debug logging
  console.log('Vue Scan monitor created with options:', options);

  // Register a debug function to check component registration
  const logComponentStats = () => {
    setTimeout(() => {
      const totalComponents = components.size;
      const componentsWithElements = Array.from(components.values()).filter(
        (c) => !!c.el,
      ).length;

      console.log(
        `Vue Scan Stats: ${totalComponents} components registered, ${componentsWithElements} with DOM elements`,
      );

      if (options.permanentComponentOverlays) {
        console.log(
          'Component outlines should be visible. If not, check for CSS conflicts or z-index issues.',
        );
      }

      // Log the first few components for debugging
      const componentList = Array.from(components.values()).slice(0, 5);
      console.log(
        'Sample components:',
        componentList.map((c) => `${c.name} (has element: ${!!c.el})`),
      );
    }, 2000);
  };

  // Run debug logging after a short delay
  logComponentStats();

  // Create the monitor instance
  const monitor: PerformanceMonitor = {
    components,
    activeRenders,
    options,

    trackComponent(
      instance: ComponentInternalInstance,
    ): ComponentMetrics | undefined {
      // Skip if in ignore list
      const componentName = instance.type.__name || 'Anonymous';
      if (options.ignore?.includes(componentName)) {
        return undefined;
      }

      const id = instance.uid.toString();
      const file = (instance.type as any).__file;

      if (!components.has(id)) {
        // Add new component to tracking
        components.set(id, {
          id,
          name: componentName,
          file,
          renderCount: 0,
          lastRenderTime: 0,
          averageRenderTime: 0,
          totalRenderTime: 0,
          events: [],
          el: (instance.vnode.el as HTMLElement) || undefined,
        });
      }

      // Update element reference if it changed
      const metrics = components.get(id)!;
      if (instance.vnode.el && instance.vnode.el !== metrics.el) {
        metrics.el = instance.vnode.el as HTMLElement;
      }

      // Apply permanent overlay to the component if enabled
      if (options.permanentComponentOverlays && metrics.el) {
        // Add a persistent outline to the element - make it more visible
        const overlayColor = 'rgba(255, 0, 0, 0.5)'; // Bright red with higher opacity
        metrics.el.style.outline = `2px solid ${overlayColor}`;
        metrics.el.style.outlineOffset = '-2px';

        // Add component name as a data attribute for debugging
        metrics.el.setAttribute('data-vue-scan-component', componentName);

        // Add component ID as a data attribute
        metrics.el.setAttribute('data-vue-scan-id', id);

        // Log to verify this code is being executed
        console.log(`Applied outline to component: ${componentName} (${id})`);
      }

      return metrics;
    },

    getComponentById(id: string) {
      return components.get(id);
    },

    getComponentsByName(name: string) {
      return Array.from(components.values()).filter((c) => c.name === name);
    },

    highlightComponent(id: string, color = 'rgba(255, 0, 0, 0.3)') {
      const component = components.get(id);
      if (!component || !component.el) {
        console.log(
          `Failed to highlight component ${id}: ${component ? 'No element reference' : 'Component not found'}`,
        );
        return;
      }

      console.log(`Highlighting component: ${component.name} (${id})`);

      // Store original styles
      const originalStyles = {
        outline: component.el.style.outline,
        outlineOffset: component.el.style.outlineOffset,
        position: component.el.style.position,
        backgroundColor: component.el.style.backgroundColor,
        transition: component.el.style.transition,
      };

      // Make the highlight more noticeable
      const moreVisibleColor = 'rgba(255, 0, 0, 0.5)'; // Brighter red with higher opacity

      // Apply highlight with transition
      component.el.style.transition = 'all 0.3s ease';
      component.el.style.outline = `3px solid ${moreVisibleColor}`;
      component.el.style.outlineOffset = '-3px';
      component.el.style.backgroundColor = 'rgba(255, 200, 200, 0.2)'; // Light red background

      if (component.el.style.position === 'static') {
        component.el.style.position = 'relative';
      }

      // Add a data attribute to indicate it's highlighted
      component.el.setAttribute('data-vue-scan-highlighted', 'true');

      // Log element dimensions to help debug visibility issues
      const rect = component.el.getBoundingClientRect();
      console.log(
        `Element dimensions: width=${rect.width}, height=${rect.height}, visible in viewport: ${
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.left < window.innerWidth &&
          rect.right > 0
        }`,
      );

      // Restore after a short delay
      setTimeout(() => {
        if (component.el) {
          component.el.style.outline = originalStyles.outline;
          component.el.style.outlineOffset = originalStyles.outlineOffset;
          component.el.style.position = originalStyles.position;
          component.el.style.backgroundColor = originalStyles.backgroundColor;
          component.el.style.transition = originalStyles.transition;
          component.el.removeAttribute('data-vue-scan-highlighted');
        }
      }, 1000);
    },

    clearHighlights() {
      components.forEach((component) => {
        if (component.el) {
          component.el.style.outline = '';
        }
      });
    },

    trackEvent(componentId: string, eventName: string, data?: any) {
      const component = components.get(componentId);
      if (!component) {
        return;
      }

      component.events.push({
        name: eventName,
        timestamp: performance.now(),
        data,
      });
    },

    startMemoryTracking() {
      // Use the enhanced memory profiler instead of the basic implementation
      if (!options.trackMemory) {
        return;
      }

      startMemoryTracking(1000);
    },

    stopMemoryTracking() {
      stopMemoryTracking();
    },

    // Add access to memory stats from the profiler
    getMemoryStats() {
      return getMemoryStats();
    },

    // Add ability to clear memory stats
    clearMemoryStats() {
      clearMemoryStats();
    },

    // Add a testing utility to manually trigger highlights
    triggerHighlightAll() {
      console.log('Manually triggering highlight for all components');

      // Highlight each component in sequence with a slight delay
      Array.from(components.entries()).forEach(([id, component], index) => {
        setTimeout(() => {
          // Only highlight if the component has an element reference
          if (component.el) {
            console.log(
              `Manually highlighting component: ${component.name} (${id})`,
            );
            monitor.highlightComponent(id, 'rgba(0, 128, 255, 0.5)'); // Use a different color for manual highlights
          } else {
            console.log(
              `Component has no element reference: ${component.name} (${id})`,
            );
          }
        }, index * 500); // Stagger the highlights
      });
    },
  };

  // Start memory tracking if enabled
  if (options.trackMemory) {
    monitor.startMemoryTracking();

    // Register the memory profiler directive
    app.directive('memory-profile', memoryProfiler.vMemoryProfile);
  }

  // Create a Vue directive to track all components
  app.mixin({
    beforeCreate() {
      const instance = getCurrentInstance();
      if (!instance) {
        return;
      }

      const componentMetrics = monitor.trackComponent(instance);
      // Return early if component metrics aren't available (e.g., in ignore list)
      if (!componentMetrics) {
        return;
      }

      // Apply memory profiling to all tracked components if memory tracking is enabled
      if (options.trackMemory) {
        const componentName = componentMetrics.name;
        useMemoryProfile(componentName);
      }

      // Track mount time
      if (options.trackMountTime) {
        onMounted(() => {
          if (componentMetrics) {
            componentMetrics.mountTime = performance.now();

            // Add this debug message to verify mounting is happening
            console.log(
              `Component mounted: ${componentMetrics.name} (${componentMetrics.id})`,
            );

            // Also trigger the measurement on mount to ensure we get at least one measurement
            if (options.trackRenderFrequency) {
              const startTime = performance.now();
              activeRenders.add(componentMetrics.id);

              // Use microtask to measure render duration
              queueMicrotask(() => {
                if (!componentMetrics) {
                  console.log(
                    'componentMetrics is undefined in mount microtask',
                  );
                  return;
                }

                const endTime = performance.now();
                const renderTime = endTime - startTime;

                componentMetrics.renderCount++;
                componentMetrics.lastRenderTime = renderTime;
                componentMetrics.totalRenderTime += renderTime;
                componentMetrics.averageRenderTime =
                  componentMetrics.totalRenderTime /
                  componentMetrics.renderCount;

                activeRenders.delete(componentMetrics.id);

                // Flash the component in the UI on mount
                console.log(
                  `Highlighting component on mount: ${componentMetrics.name}`,
                );
                monitor.highlightComponent(componentMetrics.id);
              });
            }
          }
        });
      }

      // Track render time and frequency
      if (options.trackRenderFrequency) {
        onUpdated(() => {
          if (!componentMetrics) {
            console.log('componentMetrics is undefined in onUpdated hook');
            return;
          }

          console.log(
            `Component updated: ${componentMetrics.name} (${componentMetrics.id})`,
          );
          const startTime = performance.now();
          activeRenders.add(componentMetrics.id);

          // Use microtask to measure render duration
          queueMicrotask(() => {
            if (!componentMetrics) {
              console.log('componentMetrics is undefined');
              return;
            }
            console.log('componentMetrics is defined');

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            componentMetrics.renderCount++;
            componentMetrics.lastRenderTime = renderTime;
            componentMetrics.totalRenderTime += renderTime;
            componentMetrics.averageRenderTime =
              componentMetrics.totalRenderTime / componentMetrics.renderCount;

            activeRenders.delete(componentMetrics.id);

            // Flash the component in the UI
            monitor.highlightComponent(componentMetrics.id);
          });
        });
      }

      // Clean up on unmount
      onUnmounted(() => {
        if (componentMetrics) {
          componentMetrics.unmountTime = performance.now();
        }
      });
    },
  });

  return monitor;
}
