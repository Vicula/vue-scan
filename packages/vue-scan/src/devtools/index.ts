import type { App } from 'vue';
import type { PerformanceMonitor, ComponentMetrics } from '../core/monitor';

// Custom DevTools events
const DEVTOOLS_EVENTS = {
  COMPONENT_RENDER: 'scan:component-render',
  HIGHLIGHT_COMPONENT: 'scan:highlight-component',
  CLEAR_HIGHLIGHTS: 'scan:clear-highlights',
  GET_METRICS: 'scan:get-metrics',
  GET_COMPONENT_METRICS: 'scan:get-component-metrics',
  TOGGLE_OVERLAY: 'scan:toggle-overlay',
};

export interface DevtoolsLayer {
  setup: () => void;
  sendRender: (componentMetrics: ComponentMetrics) => void;
  dispose: () => void;
}

/**
 * Sets up integration with Vue DevTools
 */
export function setupDevtools(
  app: App,
  monitor: PerformanceMonitor,
): DevtoolsLayer {
  // Track whether DevTools is available
  let devtoolsAvailable = false;

  // Reference to overlay controller
  let overlayController: any = null;

  // Check if DevTools is available
  function checkDevToolsAvailability() {
    // @ts-ignore
    return window.__VUE_DEVTOOLS_GLOBAL_HOOK__ !== undefined;
  }

  function setup() {
    devtoolsAvailable = checkDevToolsAvailability();

    if (!devtoolsAvailable) {
      console.debug('[Vue Scan] DevTools not detected, skipping integration');
      return;
    }

    // @ts-ignore - Access the DevTools hook
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

    if (!hook) return;

    // Register custom inspector
    hook.on('init', () => {
      hook.emit('register-inspector', {
        id: 'vue-scan',
        label: 'Vue Scan',
        icon: 'speed',
        treeFilterPlaceholder: 'Search for component',
        noSelectionText: 'Select a component to view performance metrics',
        actions: [
          {
            icon: 'visibility',
            title: 'Toggle Overlay',
            action: () => {
              if (overlayController) {
                overlayController.toggle();
              }
            },
            actionType: 'icon',
          },
          {
            icon: 'flash_on',
            title: 'Highlight Slow Components',
            action: () => {
              highlightSlowComponents();
            },
            actionType: 'icon',
          },
          {
            icon: 'clear',
            title: 'Clear Highlights',
            action: () => {
              monitor.clearHighlights();
            },
            actionType: 'icon',
          },
        ],
      });
    });

    // Handle component selection in DevTools
    hook.on('inspector:select-node', async (nodeId: string) => {
      if (typeof nodeId === 'string') {
        // Check if any of our components match this ID
        const componentId = nodeId.toString();
        const component = monitor.getComponentById(componentId);

        if (component) {
          // Highlight the component in the page
          monitor.highlightComponent(componentId);

          // Send component metrics to DevTools
          hook.emit('inspector:state', {
            inspectorId: 'vue-scan',
            nodeId: componentId,
            state: {
              performance: formatComponentForDevtools(component),
            },
          });
        }
      }
    });

    // Set up custom events
    hook.on(DEVTOOLS_EVENTS.HIGHLIGHT_COMPONENT, (id: string) => {
      monitor.highlightComponent(id);
    });

    hook.on(DEVTOOLS_EVENTS.CLEAR_HIGHLIGHTS, () => {
      monitor.clearHighlights();
    });

    hook.on(DEVTOOLS_EVENTS.GET_METRICS, () => {
      // Return all metrics for all components
      const metrics = Array.from(monitor.components.values()).map(
        formatComponentForDevtools,
      );
      hook.emit('custom-inspector-state', {
        inspectorId: 'vue-scan',
        state: { components: metrics },
      });
    });

    hook.on(DEVTOOLS_EVENTS.GET_COMPONENT_METRICS, (id: string) => {
      const component = monitor.getComponentById(id);
      if (component) {
        hook.emit('custom-inspector-state', {
          inspectorId: 'vue-scan',
          state: { component: formatComponentForDevtools(component) },
        });
      }
    });

    hook.on(DEVTOOLS_EVENTS.TOGGLE_OVERLAY, () => {
      if (overlayController) {
        overlayController.toggle();
      }
    });

    // Initial data for DevTools
    updateAllComponentsForDevtools();
  }

  function sendRender(componentMetrics: ComponentMetrics) {
    if (!devtoolsAvailable) return;

    // @ts-ignore
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return;

    // Send render event to DevTools
    hook.emit(DEVTOOLS_EVENTS.COMPONENT_RENDER, {
      id: componentMetrics.id,
      name: componentMetrics.name,
      renderTime: componentMetrics.lastRenderTime,
      renderCount: componentMetrics.renderCount,
      timestamp: Date.now(),
    });

    // Update inspector data
    updateAllComponentsForDevtools();
  }

  function updateAllComponentsForDevtools() {
    if (!devtoolsAvailable) return;

    // @ts-ignore
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return;

    // Generate tree structure for inspector
    const tree = generateComponentTree();

    // Update the inspector tree
    hook.emit('inspector:tree', {
      inspectorId: 'vue-scan',
      rootNodes: tree,
    });
  }

  function generateComponentTree() {
    // Organize components by name for a more organized tree
    const componentsByName = new Map<string, ComponentMetrics[]>();

    monitor.components.forEach((component) => {
      if (!componentsByName.has(component.name)) {
        componentsByName.set(component.name, []);
      }
      componentsByName.get(component.name)!.push(component);
    });

    // Generate tree nodes
    return Array.from(componentsByName.entries()).map(([name, components]) => {
      // Sort by render count (most active first)
      components.sort((a, b) => b.renderCount - a.renderCount);

      if (components.length === 1) {
        // Single component, create leaf node
        return createComponentNode(components[0]);
      } else {
        // Multiple components with the same name, create grouping node
        return {
          id: `group:${name}`,
          label: `${name} (${components.length})`,
          tags: [
            {
              label: `${components.reduce((sum, c) => sum + c.renderCount, 0)} renders`,
              textColor: 0xffffff,
              backgroundColor: 0x42b883,
            },
          ],
          children: components.map(createComponentNode),
        };
      }
    });
  }

  function createComponentNode(component: ComponentMetrics) {
    // Get color based on render performance
    const color = getColorForRenderTime(component.averageRenderTime);

    return {
      id: component.id,
      label: component.name,
      tags: [
        {
          label: `${component.renderCount} renders`,
          textColor: 0xffffff,
          backgroundColor: 0x42b883,
        },
        {
          label: `${component.lastRenderTime.toFixed(2)}ms`,
          textColor: 0xffffff,
          backgroundColor: color,
        },
      ],
    };
  }

  function getColorForRenderTime(time: number): number {
    // Performance thresholds (in ms)
    // Green (good): < 8ms
    // Yellow (warning): 8ms - 16ms
    // Orange (slow): 16ms - 33ms
    // Red (very slow): > 33ms
    if (time < 8) {
      return 0x42b883; // Green
    } else if (time < 16) {
      return 0xe6c029; // Yellow
    } else if (time < 33) {
      return 0xf1662a; // Orange
    } else {
      return 0xd71d1d; // Red
    }
  }

  function highlightSlowComponents() {
    // Find components that render slower than 16ms (60fps threshold)
    const slowComponents = Array.from(monitor.components.values()).filter(
      (component) => component.averageRenderTime > 16,
    );

    slowComponents.forEach((component) => {
      // Use different colors based on severity
      const color =
        component.averageRenderTime > 33
          ? 'rgba(255, 0, 0, 0.4)'
          : 'rgba(255, 165, 0, 0.4)';

      monitor.highlightComponent(component.id, color);
    });

    if (slowComponents.length === 0) {
      console.log('[Vue Scan] No slow components found');
    } else {
      console.log(
        `[Vue Scan] Highlighted ${slowComponents.length} slow components`,
      );
    }
  }

  function formatComponentForDevtools(component: ComponentMetrics) {
    return {
      id: component.id,
      name: component.name,
      file: component.file || 'Unknown file',
      renderCount: component.renderCount,
      lastRenderTime: `${component.lastRenderTime.toFixed(2)}ms`,
      averageRenderTime: `${component.averageRenderTime.toFixed(2)}ms`,
      totalRenderTime: `${component.totalRenderTime.toFixed(2)}ms`,
      mountTime: component.mountTime
        ? new Date(component.mountTime).toISOString()
        : 'Not mounted',
      unmountTime: component.unmountTime
        ? new Date(component.unmountTime).toISOString()
        : 'Not unmounted',
      memoryUsage: component.memoryUsage
        ? `${Math.round(component.memoryUsage / 1024 / 1024)} MB`
        : 'Not tracked',
      events: component.events.length,
    };
  }

  function dispose() {
    if (!devtoolsAvailable) return;

    // @ts-ignore
    const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    if (!hook) return;

    // Clean up listeners
    const events = Object.values(DEVTOOLS_EVENTS);
    events.forEach((event) => {
      hook.off(event);
    });
  }

  // Create the DevTools layer
  const devtoolsLayer: DevtoolsLayer = {
    setup,
    sendRender,
    dispose,
  };

  // Run setup
  setup();

  // Store reference to overlay controller if created
  if (app.config.globalProperties.$vueScanOverlay) {
    overlayController = app.config.globalProperties.$vueScanOverlay;
  }

  return devtoolsLayer;
}
