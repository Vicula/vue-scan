import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin({
  name: 'nuxt-scan-devtools-debug',
  enforce: 'pre',
  setup() {
    console.log('[Nuxt-Scan] Plugin loaded, registering devtools debug');

    if (process.client) {
      // Make debugging info available globally
      window.__NUXT_SCAN_DEBUG = {
        timestamp: Date.now(),
        devtoolsAvailable: false,
      };

      // Check if DevTools is available
      const checkDevTools = () => {
        const devtoolsAvailable = !!(
          window.__NUXT_DEVTOOLS__ || window.__VUE_DEVTOOLS_GLOBAL_HOOK__
        );
        window.__NUXT_SCAN_DEBUG.devtoolsAvailable = devtoolsAvailable;
        console.log(`[Nuxt-Scan] DevTools available: ${devtoolsAvailable}`);
      };

      // Initial check and periodic checks
      setTimeout(checkDevTools, 1000);
      setInterval(checkDevTools, 5000);
    }
  },
});

// Add types
declare global {
  interface Window {
    __NUXT_SCAN_DEBUG: {
      timestamp: number;
      devtoolsAvailable: boolean;
    };
  }
}
