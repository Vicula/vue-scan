import type { VueDevtoolsHook } from '../types/vue-devtools';

interface CustomPanelOptions {
  id: string;
  label: string;
  icon: string;
  component: any;
  props?: Record<string, any>;
}

/**
 * Defines a custom panel in Vue DevTools
 */
export function defineCustomPanel(options: CustomPanelOptions): void {
  if (typeof window === 'undefined') {
    return;
  }

  const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ as VueDevtoolsHook;
  if (!hook) {
    return;
  }

  // Register the custom panel
  hook.emit('register-panel', {
    id: options.id,
    label: options.label,
    icon: options.icon,
    component: options.component,
    props: options.props || {},
  });
}
