import type { App, Component, ComponentInternalInstance } from 'vue';
import { getCurrentInstance, onMounted, onUpdated, onUnmounted } from 'vue';
import type { VueScanOptions } from '../index';

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
  trackComponent: (instance: ComponentInternalInstance) => void;
  getComponentById: (id: string) => ComponentMetrics | undefined;
  getComponentsByName: (name: string) => ComponentMetrics[];
  highlightComponent: (id: string, color?: string) => void;
  clearHighlights: () => void;

  // Event tracking
  trackEvent: (componentId: string, eventName: string, data?: any) => void;

  // Memory tracking
  startMemoryTracking: () => void;
  stopMemoryTracking: () => void;
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
  let memoryTrackingInterval: number | null = null;

  // Create the monitor instance
  const monitor: PerformanceMonitor = {
    components,
    activeRenders,
    options,

    trackComponent(instance: ComponentInternalInstance) {
      // Skip if in ignore list
      const componentName = instance.type.__name || 'Anonymous';
      if (options.ignore?.includes(componentName)) {
        return;
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
      if (!component?.el) return;

      // Store original styles
      const originalStyles = {
        outline: component.el.style.outline,
        outlineOffset: component.el.style.outlineOffset,
        position: component.el.style.position,
      };

      // Apply highlight
      component.el.style.outline = `2px solid ${color}`;
      component.el.style.outlineOffset = '-2px';
      if (component.el.style.position === 'static') {
        component.el.style.position = 'relative';
      }

      // Restore after a short delay
      setTimeout(() => {
        component.el.style.outline = originalStyles.outline;
        component.el.style.outlineOffset = originalStyles.outlineOffset;
        component.el.style.position = originalStyles.position;
      }, 1000);
    },

    clearHighlights() {
      components.forEach((component) => {
        if (component.el) {
          component.el.style.outline = '';
          component.el.style.outlineOffset = '';
        }
      });
    },

    trackEvent(componentId: string, eventName: string, data?: any) {
      const component = components.get(componentId);
      if (!component) return;

      component.events.push({
        name: eventName,
        timestamp: performance.now(),
        data,
      });
    },

    startMemoryTracking() {
      if (!options.trackMemory || !window.performance?.memory) return;

      memoryTrackingInterval = window.setInterval(() => {
        const memory = (window.performance as any).memory;
        if (memory) {
          components.forEach((component) => {
            component.memoryUsage = memory.usedJSHeapSize;
          });
        }
      }, 1000) as unknown as number;
    },

    stopMemoryTracking() {
      if (memoryTrackingInterval !== null) {
        clearInterval(memoryTrackingInterval);
        memoryTrackingInterval = null;
      }
    },
  };

  // Start memory tracking if enabled
  if (options.trackMemory) {
    monitor.startMemoryTracking();
  }

  // Create a Vue directive to track all components
  app.mixin({
    beforeCreate() {
      const instance = getCurrentInstance();
      if (!instance) return;

      const componentMetrics = monitor.trackComponent(instance);
      if (!componentMetrics) return;

      // Track mount time
      if (options.trackMountTime) {
        onMounted(() => {
          componentMetrics.mountTime = performance.now();
        });
      }

      // Track render time and frequency
      if (options.trackRenderFrequency) {
        onUpdated(() => {
          const startTime = performance.now();
          activeRenders.add(componentMetrics.id);

          // Use microtask to measure render duration
          queueMicrotask(() => {
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
