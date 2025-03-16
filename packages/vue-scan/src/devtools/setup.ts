import type { VueDevtoolsHook } from '../types/vue-devtools';
import { defineCustomPanel } from './utils';
import MemoryProfilerPanel from './components/MemoryProfilerPanel.vue';

/**
 * Registers custom panels in Vue DevTools
 */
export function registerCustomPanels(app: any): void {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  // Check if DevTools is available
  if (
    typeof window === 'undefined' ||
    typeof (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ === 'undefined'
  ) {
    console.debug(
      '[Vue Scan] DevTools not detected, skipping custom panels registration',
    );
    return;
  }

  const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ as VueDevtoolsHook;
  if (!hook) {
    return;
  }

  // Register memory profiler panel
  hook.on('app:init', (app) => {
    // Register memory profiler panel
    defineCustomPanel({
      id: 'vue-scan-memory-profiler',
      label: 'Memory Profiler',
      icon: 'memory',
      component: MemoryProfilerPanel,
      // This will be available as props in the component
      props: {
        // Add any props you want to pass to the panel
      },
    });
  });
}
