import type { App } from 'vue';
import type { PerformanceMonitor, ComponentMetrics } from '../core/monitor';

interface OverlayOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  theme?: 'light' | 'dark';
  showComponentList?: boolean;
  highlightRerenders?: boolean;
  highlightDuration?: number; // in milliseconds
  highlightColor?: string;
}

const defaultOverlayOptions: OverlayOptions = {
  position: 'bottom-right',
  theme: 'dark',
  showComponentList: true,
  highlightRerenders: true,
  highlightDuration: 500, // 500ms highlight duration by default
  highlightColor: 'rgba(255, 105, 180, 0.3)', // semi-transparent hot pink by default
};

/**
 * Creates and injects the visual overlay into the page
 */
export function setupOverlay(
  app: App,
  monitor: PerformanceMonitor,
  options: OverlayOptions = {},
) {
  const mergedOptions = { ...defaultOverlayOptions, ...options };
  let overlayContainer: HTMLElement | null = null;
  let isVisible = true;

  // Override the highlightComponent method to use our custom duration and color
  // This affects components that are already being highlighted during updates
  const originalHighlightComponent = monitor.highlightComponent;
  monitor.highlightComponent = function (
    id: string,
    color = mergedOptions.highlightColor,
  ) {
    // If highlighting is disabled, don't do anything
    if (!mergedOptions.highlightRerenders) {
      return;
    }

    const component = monitor.getComponentById(id);
    if (!component || !component.el) {
      return;
    }

    // Store original styles
    const originalStyles = {
      outline: component.el.style.outline,
      outlineOffset: component.el.style.outlineOffset,
      position: component.el.style.position,
    };

    // Apply highlight with our custom color
    component.el.style.outline = `2px solid ${color || 'rgba(255, 105, 180, 0.3)'}`;
    component.el.style.outlineOffset = '-2px';
    if (component.el.style.position === 'static') {
      component.el.style.position = 'relative';
    }

    // Restore after our custom duration
    setTimeout(() => {
      if (component.el) {
        component.el.style.outline = originalStyles.outline;
        component.el.style.outlineOffset = originalStyles.outlineOffset;
        component.el.style.position = originalStyles.position;
      }
    }, mergedOptions.highlightDuration || 500);
  };

  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'vue-scan-overlay';
    overlay.style.position = 'fixed';
    overlay.style.zIndex = '9999';
    overlay.style.backgroundColor =
      mergedOptions.theme === 'dark'
        ? 'rgba(0, 0, 0, 0.85)'
        : 'rgba(255, 255, 255, 0.85)';
    overlay.style.color = mergedOptions.theme === 'dark' ? '#fff' : '#333';
    overlay.style.padding = '10px';
    overlay.style.borderRadius = '4px';
    overlay.style.maxHeight = '400px';
    overlay.style.maxWidth = '350px';
    overlay.style.overflowY = 'auto';
    overlay.style.fontSize = '12px';
    overlay.style.fontFamily = 'monospace';
    overlay.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';

    // Position based on option
    switch (mergedOptions.position) {
      case 'top-right':
        overlay.style.top = '10px';
        overlay.style.right = '10px';
        break;
      case 'top-left':
        overlay.style.top = '10px';
        overlay.style.left = '10px';
        break;
      case 'bottom-left':
        overlay.style.bottom = '10px';
        overlay.style.left = '10px';
        break;
      case 'bottom-right':
      default:
        overlay.style.bottom = '10px';
        overlay.style.right = '10px';
    }

    // Add the header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';
    header.style.paddingBottom = '8px';
    header.style.borderBottom =
      '1px solid ' + (mergedOptions.theme === 'dark' ? '#555' : '#ddd');

    const title = document.createElement('div');
    title.textContent = '🔍 Vue Scan';
    title.style.fontWeight = 'bold';

    const controls = document.createElement('div');

    // Toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Hide';
    toggleBtn.style.marginRight = '5px';
    toggleBtn.style.padding = '3px 6px';
    toggleBtn.style.backgroundColor =
      mergedOptions.theme === 'dark' ? '#555' : '#eee';
    toggleBtn.style.border = 'none';
    toggleBtn.style.borderRadius = '3px';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.color = 'inherit';

    toggleBtn.addEventListener('click', () => {
      const content: HTMLElement | null =
        overlay.querySelector('.vue-scan-content');
      if (content) {
        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
        isVisible = isHidden;
      }
    });

    // Add permanent overlays toggle button
    const permanentOverlaysBtn = document.createElement('button');
    permanentOverlaysBtn.textContent = monitor.options
      .permanentComponentOverlays
      ? 'Hide Overlays'
      : 'Show Overlays';
    permanentOverlaysBtn.style.marginRight = '5px';
    permanentOverlaysBtn.style.padding = '3px 6px';
    permanentOverlaysBtn.style.backgroundColor =
      mergedOptions.theme === 'dark' ? '#555' : '#eee';
    permanentOverlaysBtn.style.border = 'none';
    permanentOverlaysBtn.style.borderRadius = '3px';
    permanentOverlaysBtn.style.cursor = 'pointer';
    permanentOverlaysBtn.style.color = 'inherit';

    permanentOverlaysBtn.addEventListener('click', () => {
      // Toggle the permanent overlays option
      monitor.options.permanentComponentOverlays =
        !monitor.options.permanentComponentOverlays;

      // Update button text
      permanentOverlaysBtn.textContent = monitor.options
        .permanentComponentOverlays
        ? 'Hide Overlays'
        : 'Show Overlays';

      // Apply or remove overlays from all existing components
      monitor.components.forEach((component) => {
        if (component.el) {
          if (monitor.options.permanentComponentOverlays) {
            // Add overlay
            const overlayColor = 'rgba(0, 128, 255, 0.3)'; // Light blue semi-transparent
            component.el.style.outline = `1px dashed ${overlayColor}`;
            component.el.style.outlineOffset = '-1px';
            component.el.setAttribute(
              'data-vue-scan-component',
              component.name,
            );
            component.el.setAttribute('data-vue-scan-id', component.id);
          } else if (component.el.style.outline.includes('dashed')) {
            // Remove overlay (only if it's our outline - don't remove highlight outlines)
            component.el.style.outline = '';
            component.el.style.outlineOffset = '';
            component.el.removeAttribute('data-vue-scan-component');
            component.el.removeAttribute('data-vue-scan-id');
          }
        }
      });
    });

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.padding = '3px 6px';
    closeBtn.style.backgroundColor =
      mergedOptions.theme === 'dark' ? '#555' : '#eee';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '3px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.color = 'inherit';

    closeBtn.addEventListener('click', () => {
      overlay.remove();
      overlayContainer = null;
    });

    controls.appendChild(toggleBtn);
    controls.appendChild(permanentOverlaysBtn);
    controls.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(controls);
    overlay.appendChild(header);

    // Content container
    const content = document.createElement('div');
    content.className = 'vue-scan-content';
    overlay.appendChild(content);

    document.body.appendChild(overlay);
    return overlay;
  }

  function updateOverlay() {
    if (!overlayContainer) {
      overlayContainer = createOverlay();
    }

    // Skip updates if overlay is hidden
    if (!isVisible) {
      return;
    }

    const content = overlayContainer.querySelector('.vue-scan-content');
    if (!content) {
      return;
    }

    // Clear the current content
    content.innerHTML = '';

    // Add summary information
    const summary = document.createElement('div');
    summary.style.marginBottom = '10px';

    const totalComponents = monitor.components.size;
    const activeRenders = monitor.activeRenders.size;

    summary.innerHTML = `
      <div style="margin-bottom: 5px;"><b>Components:</b> ${totalComponents}</div>
      <div style="margin-bottom: 5px;"><b>Currently Rendering:</b> ${activeRenders}</div>
    `;

    content.appendChild(summary);

    // Add component list if enabled
    if (mergedOptions.showComponentList) {
      const componentsList = document.createElement('div');
      componentsList.innerHTML =
        '<div style="font-weight: bold; margin-bottom: 5px;">Recent Renders:</div>';

      // Convert map to array, sort by last render time (most recent first)
      const sortedComponents = Array.from(monitor.components.values())
        .filter((c) => c.renderCount > 0)
        .sort((a, b) => b.lastRenderTime - a.lastRenderTime)
        .slice(0, 10); // Show only the 10 most recent

      if (sortedComponents.length === 0) {
        componentsList.innerHTML +=
          '<div style="color: #888; font-style: italic;">No components rendered yet</div>';
      } else {
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '11px';

        // Table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
          <tr>
            <th style="text-align: left; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#555' : '#ddd'}">Component</th>
            <th style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#555' : '#ddd'}">Renders</th>
            <th style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#555' : '#ddd'}">Last (ms)</th>
            <th style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#555' : '#ddd'}">Avg (ms)</th>
          </tr>
        `;
        table.appendChild(thead);

        // Table body
        const tbody = document.createElement('tbody');
        sortedComponents.forEach((component) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td style="padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#333' : '#eee'}">${component.name}</td>
            <td style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#333' : '#eee'}">${component.renderCount}</td>
            <td style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#333' : '#eee'}">${component.lastRenderTime.toFixed(2)}</td>
            <td style="text-align: right; padding: 3px; border-bottom: 1px solid ${mergedOptions.theme === 'dark' ? '#333' : '#eee'}">${component.averageRenderTime.toFixed(2)}</td>
          `;

          // Highlight slow renders
          if (component.lastRenderTime > 16) {
            // 16ms = 60fps threshold
            row.style.color = '#ff5f5f';
          }

          // Add click handler to highlight the component in the page
          row.style.cursor = 'pointer';
          row.addEventListener('click', () => {
            monitor.highlightComponent(component.id, 'rgba(255, 200, 0, 0.5)');
          });

          tbody.appendChild(row);
        });

        table.appendChild(tbody);
        componentsList.appendChild(table);
      }

      content.appendChild(componentsList);
    }
  }

  // Update overlay periodically
  const updateInterval = setInterval(() => {
    if (document.body && !overlayContainer) {
      overlayContainer = createOverlay();
    }

    if (overlayContainer) {
      updateOverlay();
    }
  }, 1000);

  // Clean up when the app is unmounted
  app.config.globalProperties.$vueScanCleanup = () => {
    clearInterval(updateInterval);
    if (overlayContainer) {
      overlayContainer.remove();
      overlayContainer = null;
    }
  };

  // Return controls for external manipulation
  return {
    show: () => {
      if (overlayContainer) {
        overlayContainer.style.display = 'block';
        isVisible = true;
      }
    },
    hide: () => {
      if (overlayContainer) {
        overlayContainer.style.display = 'none';
        isVisible = false;
      }
    },
    toggle: () => {
      if (overlayContainer) {
        const newVisibility = !isVisible;
        overlayContainer.style.display = newVisibility ? 'block' : 'none';
        isVisible = newVisibility;
      }
    },
    destroy: () => {
      clearInterval(updateInterval);
      if (overlayContainer) {
        overlayContainer.remove();
        overlayContainer = null;
      }
    },
  };
}
