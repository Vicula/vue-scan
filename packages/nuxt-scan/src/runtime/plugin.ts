import { defineNuxtPlugin } from '#app';
import type { VueScanInstance, VueScanOptions } from '../types.js';

// We need to use dynamic import here to avoid TypeScript issues
// since we don't control the vue-scan package structure
export default defineNuxtPlugin(async (nuxtApp: any) => {
  // Dynamically import vue-scan to avoid TypeScript issues
  const VueScan = await import('vue-scan');

  // Set up options for Vue Scan
  const options: VueScanOptions = {
    // Initialize with default options
    devtools: process.env.NODE_ENV === 'development',
    enablePerformanceMarking: true,
    enableComponentTracking: true,
    enableProfiler: true,
    // We can use Nuxt API to determine these
    appName: 'Nuxt App',
    appVersion: '1.0.0',
  };

  // Initialize Vue Scan with whatever API the package actually provides
  // This is a simplified example - you'll need to adapt to the actual vue-scan API
  const vueScan = (VueScan as any).default || VueScan;
  const scanInstance =
    typeof vueScan === 'function'
      ? vueScan(nuxtApp.vueApp, options)
      : vueScan.init?.(nuxtApp.vueApp, options);

  // Cast to our interface for type safety
  const typedScanInstance = scanInstance as unknown as VueScanInstance;

  // Expose the scan instance to the Nuxt app
  return {
    provide: {
      scan: typedScanInstance,
    },
  };
});
