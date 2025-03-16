import { defineNuxtModule, addPluginTemplate } from '@nuxt/kit';
import { resolve, join } from 'path';

// Define module options type same as Vue Scan options
export interface ModuleOptions {
  enabled?: boolean;
  overlay?: boolean;
  devtools?: boolean;
  ignore?: string[];
  trackMemory?: boolean;
  trackMountTime?: boolean;
  trackRenderFrequency?: boolean;
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-scan',
    configKey: 'vueScan',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    enabled: process.env.NODE_ENV !== 'production',
    overlay: true,
    devtools: true,
    ignore: [],
    trackMemory: false,
    trackMountTime: true,
    trackRenderFrequency: true,
  },
  setup(options, nuxt) {
    // Skip in production unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && options.enabled !== true) {
      console.log(
        'Vue Scan disabled in production. Set vueScan.enabled = true to enable.',
      );
      return;
    }

    // Add plugin template
    addPluginTemplate({
      filename: 'vue-scan.mjs',
      src: resolve(__dirname, './runtime/plugin.ts'),
      options,
    });

    // Make options available via runtimeConfig
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {};
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.vueScan = options;

    // Log info
    console.log('Vue Scan initialized in Nuxt.js');
  },
});
