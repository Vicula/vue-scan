declare module 'vue-scan' {
  import type { App, Directive } from 'vue';
  import { ComponentInternalInstance } from 'vue';

  export interface VueScanOptions {
    enabled?: boolean;
    overlay?: boolean;
    devtools?: boolean;
    ignore?: string[];
    trackMemory?: boolean;
    detailedMemoryTracking?: boolean;
    memoryTrackingInterval?: number;
    trackMountTime?: boolean;
    trackRenderFrequency?: boolean;
  }

  export interface MemorySnapshot {
    timestamp: number;
    component: string;
    heapUsed: number;
    instanceCount: number;
  }

  export interface ComponentMemoryStats {
    component: string;
    averageHeapUsed: number;
    maxHeapUsed: number;
    minHeapUsed: number;
    lastHeapUsed: number;
    instanceCount: number;
    snapshots: MemorySnapshot[];
  }

  export function createVueScan(options?: VueScanOptions): {
    install(app: App): void;
  };

  export function useMemoryProfile(componentName: string): {
    takeSnapshot: () => MemorySnapshot;
    getStats: () => ComponentMemoryStats | undefined;
  };

  export const vMemoryProfile: Directive;

  export const version: string;
}

// Augment Vue
declare module 'vue' {
  interface ComponentCustomProperties {
    $vueScan?: {
      options: VueScanOptions;
    };
    $memoryProfiler?: {
      getStats: () => Record<string, ComponentMemoryStats>;
      clearStats: () => void;
      startTracking: (intervalMs?: number) => void;
      stopTracking: () => void;
      useMemoryProfile: (componentName: string) => {
        takeSnapshot: () => MemorySnapshot;
        getStats: () => ComponentMemoryStats | undefined;
      };
      directive: Directive;
    };
  }
}
