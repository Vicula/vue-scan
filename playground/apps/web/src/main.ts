import { createApp } from 'vue';
import App from './app.vue';
import { createVueScan } from 'vue-scan';

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
  }),
);

app.mount('#app');
