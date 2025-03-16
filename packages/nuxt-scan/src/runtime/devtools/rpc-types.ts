import type { ComponentMemoryStats } from '../memory-profiler.js';

export interface MemoryServerFunctions {
  getMemoryStats: () => Record<string, ComponentMemoryStats>;
  startMemoryTracking: () => boolean;
  stopMemoryTracking: () => boolean;
  clearMemoryStats: () => boolean;
  isMemoryTracking: () => boolean;
}

export interface MemoryClientFunctions {
  // No client functions needed for now
}
