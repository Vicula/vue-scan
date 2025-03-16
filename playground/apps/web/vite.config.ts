import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'vue-scan': resolve(
        __dirname,
        '../../../packages/vue-scan/dist/index.es.js',
      ),
      'memory-profiler': resolve(
        __dirname,
        '../../../packages/nuxt-scan/dist/runtime/memory-profiler.js',
      ),
    },
  },
});
