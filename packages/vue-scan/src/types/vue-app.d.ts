import { App } from 'vue';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $vueScanOverlay?: {
      toggle: () => void;
      show: () => void;
      hide: () => void;
      [key: string]: any;
    };
  }
}
