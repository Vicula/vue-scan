import { setupDevtoolsPlugin } from '@vue/devtools-api';
import type { App } from 'vue';

// Interface for custom panel options
export interface CustomPanelOptions {
  id: string;
  label: string;
  icon: string;
  component: any;
  props?: Record<string, any>;
}

// Store shared plugin API reference
let pluginApi: any = null;

/**
 * Gets the plugin API instance
 */
export function getPluginApi(): any {
  return pluginApi;
}

/**
 * Sets up the Vue Scan DevTools plugin
 */
export function setupVueScanDevtoolsPlugin(app: App, appConfig: any = {}) {
  // Only run in development mode
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    // Setup DevTools plugin using the official API
    setupDevtoolsPlugin(
      {
        id: 'vue-scan-devtools',
        label: 'Vue Scan',
        packageName: 'vue-scan',
        homepage: 'https://github.com/Vicula/vue-scan',
        logo: 'https://raw.githubusercontent.com/Vicula/vue-scan/main/docs/public/logo.png',
        app,
      },
      (api) => {
        // Store API reference for reuse
        pluginApi = api;

        console.log('[Vue Scan] DevTools plugin registered successfully');

        // Add the Vue Scan application to settings
        api.addInspector({
          id: 'vue-scan',
          label: 'Vue Scan',
          icon: 'assessment',
          treeFilterPlaceholder: 'Search components...',
        });

        return api;
      },
    );
  } catch (err) {
    console.error('[Vue Scan] Failed to set up DevTools plugin:', err);
  }
}

/**
 * Defines a custom panel in Vue DevTools
 */
export function defineCustomPanel(options: CustomPanelOptions): void {
  if (typeof window === 'undefined' || !pluginApi) {
    console.warn(
      '[Vue Scan] DevTools API not available, cannot register panel',
    );
    return;
  }

  try {
    // Use the official API to register the panel
    pluginApi.addTimelineLayer({
      id: options.id,
      label: options.label,
      color: 0x42b883,
    });

    console.log(`[Vue Scan] Registered custom panel: ${options.label}`);
  } catch (e) {
    console.error(`[Vue Scan] Failed to register panel ${options.id}:`, e);
  }
}
