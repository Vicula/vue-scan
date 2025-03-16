// Type declarations for Vue DevTools global hook
export interface VueDevtoolsHook {
  emit: (event: string, ...payload: any[]) => void;
  on: (event: string, callback: (payload: any) => void) => void;
  once: (event: string, callback: (payload: any) => void) => void;
  off: (event: string, callback?: (payload: any) => void) => void;
  Vue?: any;
  // Add other properties as needed
}

// Extend the global Window interface
declare global {
  interface Window {
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: VueDevtoolsHook;
  }
}
