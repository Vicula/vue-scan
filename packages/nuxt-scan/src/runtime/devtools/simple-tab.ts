import { addCustomTab } from '@nuxt/devtools-kit';

export function setupSimpleTestTab() {
  // Basic DevTools tab with no complex dependencies
  addCustomTab({
    name: 'nuxt-scan-simple-test',
    title: 'Simple Test',
    icon: 'carbon:document',
    view: {
      type: 'iframe',
      src: '/api/__nuxt-scan/devtools/simple-test',
    },
  });

  console.log('Nuxt Scan: Simple test tab registered');
}
