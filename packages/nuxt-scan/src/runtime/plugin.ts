import { defineNuxtPlugin, useRuntimeConfig, NuxtApp } from '#app';
import { createVueScan } from 'vue-scan';
import memoryProfiler from './memory-profiler.js';

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
    // Register the scan plugin
    nuxtApp.vueApp.use(createVueScan(mergedOptions));

    // Register the memory profiler
    nuxtApp.vueApp.use(memoryProfiler);

    console.log(`🔍 Vue Scan initialized for Nuxt.js (with memory profiling)`);
  }

  // Add memory profiler functions to the API
  const {
    startMemoryTracking,
    stopMemoryTracking,
    getMemoryStats,
    clearMemoryStats,
    useMemoryProfile,
    vMemoryProfile,
  } = memoryProfiler;

  return {
    provide: {
      vueScan: {
        options: mergedOptions,
      },
      memoryProfiler: {
        startTracking: startMemoryTracking,
        stopTracking: stopMemoryTracking,
        getStats: getMemoryStats,
        clearStats: clearMemoryStats,
        useMemoryProfile,
        directive: vMemoryProfile,
      },
    },
  };
});
