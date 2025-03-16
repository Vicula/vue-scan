import { createApp } from 'vue';
import App from './app.vue';
// @ts-ignore - vue-scan is defined in vite.config.ts aliases
import { createVueScan } from 'vue-scan';
// Import our local memory profiler
// @ts-ignore - No type definitions for local memory profiler
import memoryProfiler from './memory-profiler';

// Import Vue Devtools
import { devtools } from '@vue/devtools';

// Initialize Vue Devtools in development mode
if (import.meta.env.DEV) {
  // Connect to Vue Devtools
  // Use the simple connect method as the DevTools API may have changed
  devtools.connect();
  console.log('Vue Devtools initialized');
}

const app = createApp(App);

// Add the Vue Scan plugin for performance monitoring
app.use(
  createVueScan({
    // Enable the plugin
    enabled: true,

    // Enable visual overlay
    overlay: true,

    // Enable DevTools integration
    devtools: true,

    // Track memory usage
    trackMemory: true,

    // Enable memory profiling
    memoryProfiling: {
      enabled: true,
      autoStart: true,
      sampleInterval: 2000,
    },
  }),
);

// Register the memory profiler
app.use(memoryProfiler);

// Make memory profiler available globally for development
if (import.meta.env.DEV) {
  // @ts-ignore - Global property
  window.$memoryProfiler = memoryProfiler;
}

// Add memory profiler to app's global properties
app.config.globalProperties.$memoryProfiler = memoryProfiler;

// Provide memoryProfiler for components to inject
app.provide('memoryProfiler', memoryProfiler);

app.mount('#app');
