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

// WeakMap to store label elements for components
const componentLabels = new WeakMap<HTMLElement, HTMLElement>();

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

  // DOM component scanning
  scanDOMForComponents: () => number;
  startPeriodicDOMScan: (intervalMs?: number) => void;
  stopPeriodicDOMScan: () => void;

  // Private properties
  _domScanInterval?: number | null;
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

      // Try to get the DOM element
      let el: HTMLElement | undefined;

      // First check if the instance.vnode.el exists and is an HTMLElement
      if (instance.vnode.el instanceof HTMLElement) {
        el = instance.vnode.el;
      }
      // If not, try to get the DOM element from the component's $el property
      else if (
        instance.proxy &&
        (instance.proxy as any).$el instanceof HTMLElement
      ) {
        el = (instance.proxy as any).$el;
      }
      // For functional components or those with fragment roots
      else if (instance.subTree?.el instanceof HTMLElement) {
        el = instance.subTree.el;
      }

      // Get first HTMLElement child if we have a comment node or fragment
      if (el && el.nodeType === Node.COMMENT_NODE && el.nextElementSibling) {
        el = el.nextElementSibling as HTMLElement;
      }

      if (!components.has(id)) {
        // Add new component to tracking
        console.log(
          `Registering new component: ${componentName} (${id}), has element: ${!!el}`,
        );

        components.set(id, {
          id,
          name: componentName,
          file,
          renderCount: 0,
          lastRenderTime: 0,
          averageRenderTime: 0,
          totalRenderTime: 0,
          events: [],
          el: el,
        });
      }

      // Update element reference if it changed or we didn't have one before
      const metrics = components.get(id)!;
      if (el && (!metrics.el || el !== metrics.el)) {
        console.log(`Updating element reference for ${componentName} (${id})`);
        metrics.el = el;
      }

      // Apply permanent overlay to the component if enabled
      if (options.permanentComponentOverlays && metrics.el) {
        // Add a persistent outline to the element - make it more visible
        const overlayColor =
          options.overlayBorderColor || 'rgba(255, 0, 0, 0.5)';
        metrics.el.style.outline = `2px solid ${overlayColor}`;
        metrics.el.style.outlineOffset = '-2px';

        // Add a subtle background color
        metrics.el.style.backgroundColor =
          options.overlayBackgroundColor || 'rgba(255, 200, 200, 0.1)';

        // Ensure the element has position for the label
        if (metrics.el.style.position === 'static') {
          metrics.el.style.position = 'relative';
        }

        // Add component name as a data attribute for debugging
        metrics.el.setAttribute('data-vue-scan-component', componentName);

        // Add component ID as a data attribute
        metrics.el.setAttribute('data-vue-scan-id', id);

        // Add a permanent label showing the component name if enabled
        if (options.showComponentLabels !== false) {
          // First, check if we already have a label
          const existingLabel = componentLabels.get(metrics.el);
          if (!existingLabel) {
            const labelElement = document.createElement('div');
            labelElement.className =
              'vue-scan-component-label vue-scan-permanent-label';
            labelElement.textContent = componentName;
            labelElement.style.position = 'absolute';
            labelElement.style.top = '0';
            labelElement.style.left = '0';
            labelElement.style.background =
              options.labelBackgroundColor || 'rgba(0, 0, 0, 0.6)';
            labelElement.style.color = options.labelTextColor || 'white';
            labelElement.style.padding = '2px 6px';
            labelElement.style.fontSize = '10px';
            labelElement.style.fontFamily = 'monospace';
            labelElement.style.borderRadius = '0 0 4px 0';
            labelElement.style.zIndex = '9999';
            labelElement.style.pointerEvents = 'none'; // Don't interfere with clicks

            // Store the label element reference
            componentLabels.set(metrics.el, labelElement);
            metrics.el.appendChild(labelElement);
          }
        }

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
        zIndex: component.el.style.zIndex,
      };

      // Get colors from options or use defaults
      const moreVisibleColor =
        options.overlayBorderColor || 'rgba(255, 0, 0, 0.5)';
      const bgColor =
        options.overlayBackgroundColor || 'rgba(255, 200, 200, 0.2)';

      // Apply highlight with transition
      component.el.style.transition = 'all 0.3s ease';
      component.el.style.outline = `3px solid ${moreVisibleColor}`;
      component.el.style.outlineOffset = '-3px';
      component.el.style.backgroundColor = bgColor;

      if (component.el.style.position === 'static') {
        component.el.style.position = 'relative';
      }

      // Ensure label is above other content
      if (!component.el.style.zIndex) {
        component.el.style.zIndex = '1';
      }

      // Add a data attribute to indicate it's highlighted
      component.el.setAttribute('data-vue-scan-highlighted', 'true');

      // Create and add a label element showing the component name
      if (options.showComponentLabels !== false) {
        const labelElement = document.createElement('div');
        labelElement.className = 'vue-scan-component-label';
        labelElement.textContent = component.name;
        labelElement.style.position = 'absolute';
        labelElement.style.top = '0';
        labelElement.style.left = '0';
        labelElement.style.background =
          options.labelBackgroundColor || 'rgba(0, 0, 0, 0.7)';
        labelElement.style.color = options.labelTextColor || 'white';
        labelElement.style.padding = '2px 6px';
        labelElement.style.fontSize = '10px';
        labelElement.style.fontFamily = 'monospace';
        labelElement.style.borderRadius = '0 0 4px 0';
        labelElement.style.zIndex = '9999';
        labelElement.style.pointerEvents = 'none'; // Don't interfere with clicks

        // Store the label element reference for cleanup using WeakMap
        componentLabels.set(component.el, labelElement);
        component.el.appendChild(labelElement);
      }

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
          component.el.style.zIndex = originalStyles.zIndex;
          component.el.removeAttribute('data-vue-scan-highlighted');

          // Remove the label element
          const labelElement = componentLabels.get(component.el);
          if (labelElement && component.el.contains(labelElement)) {
            component.el.removeChild(labelElement);
          }
          componentLabels.delete(component.el);
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

    // Add a method to scan the DOM for Vue components
    scanDOMForComponents() {
      // Collect all potential Vue component elements using different selectors
      // Vue 3 often adds data-v-* attributes for scoped styles
      const dataVElements = Array.from(document.querySelectorAll('[data-v-]'));

      // Vue also often adds __vue_ attribute
      const vueInternalElements = Array.from(
        document.querySelectorAll('[__vue_]'),
      );

      // Many Vue libraries add specific classes
      const vueClasses = Array.from(document.querySelectorAll('.v-*, .vue-*'));

      // Components with v-* directives
      const vDirectives = Array.from(document.querySelectorAll('[v-*]'));

      // Nuxt-specific elements
      const nuxtElements = Array.from(
        document.querySelectorAll('[nuxt], [data-nuxt], .nuxt-*'),
      );

      // Combine all sets and remove duplicates
      const allElements = [
        ...new Set([
          ...dataVElements,
          ...vueInternalElements,
          ...vueClasses,
          ...vDirectives,
          ...nuxtElements,
        ]),
      ];

      let newComponentsCount = 0;

      console.log(
        `Found ${allElements.length} potential Vue component elements in DOM`,
      );

      // Try to register any components we missed
      allElements.forEach((el) => {
        // Skip if element is already tracked by a component
        const isAlreadyTracked = Array.from(components.values()).some(
          (comp) => {
            if (!comp.el) {
              return false;
            }
            return (
              comp.el === el ||
              comp.el.contains(el as Node) ||
              el.contains(comp.el)
            );
          },
        );

        if (!isAlreadyTracked && el instanceof HTMLElement) {
          // Generate a unique ID for this element
          const domId = `dom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Try to get a meaningful name for the component
          let componentName = el.tagName.toLowerCase();

          // Check for component name in various attributes
          const dataComponent =
            el.getAttribute('data-component') ||
            el.getAttribute('data-vue-component') ||
            el.getAttribute('data-nuxt-component');

          if (dataComponent) {
            componentName = dataComponent;
          } else {
            // Try to extract component name from classes
            const classes = Array.from(el.classList);
            const vueClass = classes.find(
              (cls) => cls.startsWith('v-') || cls.startsWith('vue-'),
            );
            if (vueClass) {
              componentName = vueClass;
            } else {
              // Use tag name with classes as fallback
              const elClasses = classes.join(' ');
              componentName = `${componentName}${elClasses ? '.' + elClasses.replace(/\s+/g, '.') : ''}`;
            }
          }

          // Register as a new component
          components.set(domId, {
            id: domId,
            name: componentName,
            file: undefined,
            renderCount: 0,
            lastRenderTime: 0,
            averageRenderTime: 0,
            totalRenderTime: 0,
            events: [],
            el: el,
            mountTime: performance.now(),
          });

          // Apply overlay if enabled
          if (options.permanentComponentOverlays) {
            const overlayColor =
              options.overlayBorderColor || 'rgba(255, 0, 0, 0.5)';
            el.style.outline = `2px solid ${overlayColor}`;
            el.style.outlineOffset = '-2px';
            el.setAttribute('data-vue-scan-component', componentName);
            el.setAttribute('data-vue-scan-id', domId);

            // Add a subtle background color
            el.style.backgroundColor =
              options.overlayBackgroundColor || 'rgba(255, 200, 200, 0.1)';

            // Ensure the element has position for the label
            if (el.style.position === 'static') {
              el.style.position = 'relative';
            }

            // Add a permanent label showing the component name
            if (options.showComponentLabels !== false) {
              const labelElement = document.createElement('div');
              labelElement.className =
                'vue-scan-component-label vue-scan-permanent-label';
              labelElement.textContent = componentName;
              labelElement.style.position = 'absolute';
              labelElement.style.top = '0';
              labelElement.style.left = '0';
              labelElement.style.background =
                options.labelBackgroundColor || 'rgba(0, 0, 0, 0.6)';
              labelElement.style.color = options.labelTextColor || 'white';
              labelElement.style.padding = '2px 6px';
              labelElement.style.fontSize = '10px';
              labelElement.style.fontFamily = 'monospace';
              labelElement.style.borderRadius = '0 0 4px 0';
              labelElement.style.zIndex = '9999';
              labelElement.style.pointerEvents = 'none'; // Don't interfere with clicks

              // Store the label element reference
              componentLabels.set(el, labelElement);
              el.appendChild(labelElement);
            }
          }

          newComponentsCount++;
        }
      });

      console.log(`Added ${newComponentsCount} new components from DOM scan`);
      return newComponentsCount;
    },

    // Periodic scan interval reference
    _domScanInterval: null as number | null,

    // Start periodic DOM scanning
    startPeriodicDOMScan(intervalMs = 5000) {
      // Clear any existing interval
      this.stopPeriodicDOMScan();

      // Start a new interval
      this._domScanInterval = window.setInterval(() => {
        this.scanDOMForComponents();
      }, intervalMs);

      console.log(`Started periodic DOM scan every ${intervalMs}ms`);
    },

    // Stop periodic DOM scanning
    stopPeriodicDOMScan() {
      if (this._domScanInterval) {
        window.clearInterval(this._domScanInterval);
        this._domScanInterval = null;
        console.log('Stopped periodic DOM scan');
      }
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

      // Set up the lifecycle hooks in beforeCreate
      // Track mount time
      if (options.trackMountTime) {
        onMounted(() => {
          // Get the instance again in the mounted hook to ensure it's still valid
          const instance = getCurrentInstance();
          if (!instance) {
            return;
          }

          // Track the component after it's mounted so we have the DOM element
          const componentMetrics = monitor.trackComponent(instance);
          if (!componentMetrics) {
            return;
          }

          componentMetrics.mountTime = performance.now();

          // Debug message to verify mounting is happening
          console.log(
            `Component mounted: ${componentMetrics.name} (${componentMetrics.id})`,
          );

          // Apply memory profiling if needed
          if (options.trackMemory) {
            const componentName = componentMetrics.name;
            useMemoryProfile(componentName);
          }

          // Trigger measurement on mount
          if (options.trackRenderFrequency) {
            const startTime = performance.now();
            activeRenders.add(componentMetrics.id);

            // Use microtask to measure render duration
            queueMicrotask(() => {
              if (!componentMetrics) {
                console.log('componentMetrics is undefined in mount microtask');
                return;
              }

              const endTime = performance.now();
              const renderTime = endTime - startTime;

              componentMetrics.renderCount++;
              componentMetrics.lastRenderTime = renderTime;
              componentMetrics.totalRenderTime += renderTime;
              componentMetrics.averageRenderTime =
                componentMetrics.totalRenderTime / componentMetrics.renderCount;

              activeRenders.delete(componentMetrics.id);

              // Flash the component in the UI on mount
              console.log(
                `Highlighting component on mount: ${componentMetrics.name}`,
              );
              monitor.highlightComponent(componentMetrics.id);
            });
          }
        });
      }

      // Track render time and frequency
      if (options.trackRenderFrequency) {
        onUpdated(() => {
          const instance = getCurrentInstance();
          if (!instance) {
            return;
          }

          // Get metrics - this will register the component if it's not yet registered
          const componentMetrics = monitor.trackComponent(instance);
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
        const instance = getCurrentInstance();
        if (!instance) {
          return;
        }

        // We may not have tracked this component yet if it was unmounted before tracking
        const id = instance.uid.toString();
        const componentMetrics = components.get(id);

        if (componentMetrics) {
          componentMetrics.unmountTime = performance.now();
        }
      });
    },
  });

  return monitor;
}
