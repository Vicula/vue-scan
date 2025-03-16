import { useNuxtApp } from '#app';
import type { VueScanInstance } from '../../types.js';

/**
 * Access the Vue Scan instance.
 *
 * @example
 * ```vue
 * <script setup>
 * const scan = useScan()
 *
 * // Mark a custom performance event
 * scan.markPerformance('custom-event-start')
 *
 * // Later
 * scan.markPerformance('custom-event-end')
 * </script>
 * ```
 */
export function useScan(): VueScanInstance | null {
  const nuxtApp = useNuxtApp();

  if (!nuxtApp.$scan) {
    console.warn(
      '[nuxt-scan] Vue Scan is not initialized. Make sure the module is properly configured.',
    );
    return null;
  }

  return nuxtApp.$scan as VueScanInstance;
}
