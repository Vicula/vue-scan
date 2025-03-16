import { defineNuxtPlugin, useRuntimeConfig, NuxtApp } from '#app';
import { createVueScan } from 'vue-scan';

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  // Get options from template or runtime config
  const pluginOptions = '<%= JSON.stringify(options) %>';
  const options = JSON.parse(pluginOptions || '{}');
  const runtimeOptions = useRuntimeConfig().public.vueScan || {};

  // Merge options, with runtime config taking precedence
  const mergedOptions = { ...options, ...runtimeOptions };

  // Only run on client-side - using Nuxt's built-in detection
  const isClient = process.client || typeof window !== 'undefined';
  if (isClient) {
    // Register the plugin
    nuxtApp.vueApp.use(createVueScan(mergedOptions));
    console.log(`🔍 Vue Scan initialized for Nuxt.js`);
  }

  return {
    provide: {
      vueScan: {
        options: mergedOptions,
      },
    },
  };
});
