import type { App } from 'vue';
import { setupVueScanDevtoolsPlugin } from './utils';
import { setupMemoryProfilerPanel } from './memory-panel';

/**
 * Registers custom panels and views in Vue DevTools using the official API
 */
export function registerCustomPanels(app: App): void {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    // Set up the Vue Scan DevTools plugin with the official API
    setupVueScanDevtoolsPlugin(app);

    // Set up memory profiler panel
    setupMemoryProfilerPanel();

    console.log('[Vue Scan] Custom panels registered with DevTools');
  } catch (err) {
    console.error('[Vue Scan] Error registering DevTools panels:', err);
  }
}
