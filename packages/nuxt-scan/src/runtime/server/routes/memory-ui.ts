import { defineEventHandler } from 'h3';
import { renderDevToolsUI } from '@nuxt/devtools-ui-kit/server';

export default defineEventHandler(async (event) => {
  // Serve the DevTools UI
  return await renderDevToolsUI(event, {
    // This is the component that will be rendered
    entryPath: '@runtime/devtools/client/DevToolsUI.vue',

    title: 'Memory Profiler',

    modules: [
      // Import needed UI components
      {
        name: '@nuxt/devtools-ui-kit',
        as: 'devtools-ui',
      },
      {
        name: '@nuxt/devtools-kit/iframe-client',
        as: 'devtools-kit-client',
      },
    ],
  });
});
