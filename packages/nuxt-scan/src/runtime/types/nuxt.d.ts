// Type declarations for Nuxt's #app imports
declare module '#app' {
  import type { App } from 'vue';

  export interface NuxtApp {
    vueApp: App;
    // Add other properties as needed
  }

  export function defineNuxtPlugin<T = any>(
    plugin: (nuxtApp: NuxtApp) => T,
  ): any;

  export interface RuntimeConfig {
    public: {
      vueScan?: Record<string, any>;
      [key: string]: any;
    };
    [key: string]: any;
  }

  export function useRuntimeConfig(): RuntimeConfig;
  export function useNuxtApp(): NuxtApp;
}
