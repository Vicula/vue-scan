import {
  defineNuxtModule,
  addPluginTemplate,
  addServerHandler,
} from '@nuxt/kit';
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
  memoryProfiling?: {
    enabled?: boolean;
    autoStart?: boolean;
    sampleInterval?: number;
  };
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
    memoryProfiling: {
      enabled: true,
      autoStart: true,
      sampleInterval: 5000,
    },
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

    // Register server routes for memory panel
    addServerHandler({
      route: '/__nuxt-scan/memory-panel',
      handler: resolve(__dirname, './runtime/server/routes/memory-panel'),
    });

    // Register API endpoints for memory panel
    addServerHandler({
      route: '/__nuxt-scan/api/memory-stats',
      handler: resolve(__dirname, './runtime/server/api/memory-stats'),
    });

    addServerHandler({
      route: '/__nuxt-scan/api/memory-start',
      handler: resolve(__dirname, './runtime/server/api/memory-start'),
    });

    addServerHandler({
      route: '/__nuxt-scan/api/memory-stop',
      handler: resolve(__dirname, './runtime/server/api/memory-stop'),
    });

    addServerHandler({
      route: '/__nuxt-scan/api/memory-clear',
      handler: resolve(__dirname, './runtime/server/api/memory-clear'),
    });

    addServerHandler({
      route: '/__nuxt-scan/api/memory-status',
      handler: resolve(__dirname, './runtime/server/api/memory-status'),
    });

    // Register devtools panel
    nuxt.hook('devtools:customTabs', async () => {
      const { setupDevtoolsPanel } = await import(
        './runtime/devtools/index.js'
      );
      setupDevtoolsPanel();
    });

    // Log info
    console.log('Vue Scan initialized in Nuxt.js');
  },
});
