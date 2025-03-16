import {
  defineNuxtModule,
  createResolver,
  addServerHandler,
  addImports,
  addPlugin,
} from '@nuxt/kit';
import { addCustomTab } from '@nuxt/devtools-kit';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { ModuleOptions } from './types.js';

// Get package information
const currentDir = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(currentDir, '../package.json');
const pkg = JSON.parse(
  await import('node:fs/promises').then((fs) => fs.readFile(pkgPath, 'utf-8')),
) as { name: string; version: string };

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: pkg.name,
    version: pkg.version,
    configKey: 'scan',
    compatibility: {
      nuxt: '^3.0.0',
    },
  },
  defaults: {
    enabled: true,
    devtools: true,
  },
  setup(options, nuxt) {
    if (!options.enabled) {
      return;
    }

    const resolver = createResolver(import.meta.url);

    // Add vue-scan runtime directory to Nuxt
    nuxt.options.build.transpile.push(resolver.resolve('./runtime'));

    // Add the vue-scan client plugin
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client',
    });

    // Add the vue-scan server route for API communication
    addServerHandler({
      route: '/api/vue-scan',
      handler: resolver.resolve('./runtime/server/api'),
    });

    // Register the composables
    addImports([
      {
        name: 'useScan',
        as: 'useScan',
        from: resolver.resolve('./runtime/composables/useScan'),
      },
    ]);

    // Register Nuxt DevTools integration
    if (options.devtools) {
      addCustomTab({
        name: 'scan',
        title: 'Scan',
        icon: 'mdi:speedometer',
        view: {
          type: 'iframe',
          src: '/@scan/client',
        },
      });

      // Add the devtools client
      addServerHandler({
        route: '/api/scan-devtools',
        handler: resolver.resolve('./runtime/server/devtools-api'),
      });

      // Serve the devtools client
      addServerHandler({
        route: '/@scan/client',
        handler: resolver.resolve('./runtime/server/devtools-client'),
      });
    }

    console.log(`🔍 Vue Scan module initialized`);
  },
});
