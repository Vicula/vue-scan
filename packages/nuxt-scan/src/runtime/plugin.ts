import { defineNuxtPlugin } from '#app';
import { createVueScan } from 'vue-scan';
import type { ModuleOptions } from '../module';

export default defineNuxtPlugin((nuxtApp) => {
  // Initialize Vue Scan with the options from the module
  const options = JSON.parse('<%= JSON.stringify(options) %>') as ModuleOptions;

  // Only run on client-side
  if (process.client) {
    // Register the plugin
    nuxtApp.vueApp.use(createVueScan(options));

    console.log(`🔍 Vue Scan initialized for Nuxt.js`);
  }

  return {
    provide: {
      vueScan: {
        options,
      },
    },
  };
});
