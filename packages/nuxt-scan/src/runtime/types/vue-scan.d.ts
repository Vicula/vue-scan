declare module 'vue-scan' {
  import type { App } from 'vue';

  export interface VueScanOptions {
    enabled?: boolean;
    overlay?: boolean;
    devtools?: boolean;
    ignore?: string[];
    trackMemory?: boolean;
    trackMountTime?: boolean;
    trackRenderFrequency?: boolean;
  }

  export function createVueScan(options?: VueScanOptions): {
    install(app: App): void;
  };

  export const version: string;
}
