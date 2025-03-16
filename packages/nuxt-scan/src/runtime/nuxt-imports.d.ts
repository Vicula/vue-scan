declare module '#app' {
  import type { App } from 'vue';

  export function defineNuxtPlugin(
    plugin: (nuxtApp: {
      vueApp: App;
      $scan: any;
      [key: string]: any;
    }) => any,
  ): any;

  export function useNuxtApp(): {
    vueApp: App;
    $scan: any;
    [key: string]: any;
  };
}
