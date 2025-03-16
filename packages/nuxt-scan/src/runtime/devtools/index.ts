import { addCustomTab, extendServerRpc } from '@nuxt/devtools-kit';
import {
  getMemoryStats,
  clearMemoryStats,
  startMemoryTracking,
  stopMemoryTracking,
  isMemoryTracking,
} from '../memory-profiler.js';
import type { MemoryServerFunctions } from './rpc-types.js';

// Define RPC namespace
const RPC_NAMESPACE = 'nuxt-scan-memory';

export function setupDevtoolsPanel() {
  // Setup RPC methods using the extendServerRpc method with type
  const rpc = extendServerRpc<{}, MemoryServerFunctions>(RPC_NAMESPACE, {
    // Memory operations
    getMemoryStats() {
      return getMemoryStats();
    },

    startMemoryTracking() {
      startMemoryTracking(2000); // Update every 2 seconds
      return true;
    },

    stopMemoryTracking() {
      stopMemoryTracking();
      return true;
    },

    clearMemoryStats() {
      clearMemoryStats();
      return true;
    },

    isMemoryTracking() {
      return isMemoryTracking();
    },
  });

  // Register the custom tab
  addCustomTab({
    name: 'nuxt-scan-memory',
    title: 'Memory Profiler',
    icon: 'carbon:chart-evaluation',
    view: {
      type: 'iframe',
      src: '/api/__nuxt-scan/devtools/ui',
    },
  });

  // Start tracking automatically if enabled in options (could get from module options)
  const shouldAutoStart = true;
  if (shouldAutoStart) {
    startMemoryTracking();
  }
}
