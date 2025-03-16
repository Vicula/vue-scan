import {
  defineNuxtModule,
  addPluginTemplate,
  addServerHandler,
  createResolver,
} from '@nuxt/kit';
import { addCustomTab } from '@nuxt/devtools-kit';
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
    after: ['@nuxt/devtools-module'],
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

    // Add debug plugin for development
    if (process.env.NODE_ENV !== 'production') {
      addPluginTemplate({
        filename: 'vue-scan-devtools-debug.mjs',
        src: resolve(__dirname, './runtime/plugins/devtools-debug.ts'),
      });
    }

    // Make options available via runtimeConfig
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {};
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {};
    nuxt.options.runtimeConfig.public.vueScan = options;

    // Register server routes for memory panel
    addServerHandler({
      route: '/api/__nuxt-scan/devtools/ui',
      handler: resolve(__dirname, './runtime/server/routes/memory-ui'),
    });

    // Simple test tab for debugging
    addServerHandler({
      route: '/api/__nuxt-scan/devtools/simple-test',
      handler: resolve(__dirname, './runtime/server/routes/simple-test-tab'),
    });

    // Backwards compatibility - keep the old route too
    addServerHandler({
      route: '/api/__nuxt-scan/devtools/client/memory-panel',
      handler: resolve(
        __dirname,
        './runtime/server/routes/memory-panel-client',
      ),
    });

    // Register API endpoints for memory panel
    addServerHandler({
      route: '/api/__nuxt-scan/api/memory-stats',
      handler: resolve(__dirname, './runtime/server/api/memory-stats'),
    });

    addServerHandler({
      route: '/api/__nuxt-scan/api/memory-start',
      handler: resolve(__dirname, './runtime/server/api/memory-start'),
    });

    addServerHandler({
      route: '/api/__nuxt-scan/api/memory-stop',
      handler: resolve(__dirname, './runtime/server/api/memory-stop'),
    });

    addServerHandler({
      route: '/api/__nuxt-scan/api/memory-clear',
      handler: resolve(__dirname, './runtime/server/api/memory-clear'),
    });

    addServerHandler({
      route: '/api/__nuxt-scan/api/memory-status',
      handler: resolve(__dirname, './runtime/server/api/memory-status'),
    });

    // Add additional dependencies for the module
    const dependencies = {
      express: '^4.18.2',
    };

    // Register devtools panel
    if (options.devtools !== false) {
      // Use directly imported setupDevtoolsPanel function
      // This avoids TypeScript errors with Nuxt hooks
      const { setupDevtoolsPanel } = require('./runtime/devtools/index.js');
      setupDevtoolsPanel();

      // Also register directly here as a fallback
      addCustomTab({
        name: 'nuxt-scan-memory',
        title: 'Memory Profiler',
        icon: 'carbon:chart-evaluation',
        view: {
          type: 'iframe',
          src: '/api/__nuxt-scan/devtools/ui',
        },
      });

      // Register the simple test tab
      const {
        setupSimpleTestTab,
      } = require('./runtime/devtools/simple-tab.js');
      setupSimpleTestTab();

      // Start standalone server for debugging
      try {
        const {
          createStandaloneServer,
        } = require('./runtime/server/standalone-server.js');
        const standaloneServer = createStandaloneServer();

        // Register an additional tab that points to the standalone server
        addCustomTab({
          name: 'nuxt-scan-standalone',
          title: 'Standalone Test',
          icon: 'carbon:server',
          view: {
            type: 'iframe',
            src: 'http://localhost:3333/simple-test',
          },
        });

        console.log(`Standalone server started at ${standaloneServer.url}`);
      } catch (error) {
        console.error('Failed to start standalone server:', error);
      }

      // Log success
      console.log('Nuxt Scan Devtools integration initialized');
    }

    // Log info
    console.log('Vue Scan initialized in Nuxt.js');

    // Add a test middleware
    addServerHandler({
      route: '/test-middleware-works',
      handler: resolve(
        __dirname,
        './runtime/server/middleware/test-middleware',
      ),
    });
  },
});
