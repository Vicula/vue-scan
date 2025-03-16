import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

    // Create resolver to locate plugin file
    const { resolve } = createResolver(import.meta.url);
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url));

    // Add the plugin
    addPlugin({
      src: resolve(runtimeDir, 'plugin'),
      mode: 'client',
      options,
    });

    // Log info
    console.log('Vue Scan initialized in Nuxt.js');
  },
});
