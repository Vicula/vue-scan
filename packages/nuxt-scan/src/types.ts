// Module types
export interface ModuleOptions {
  /**
   * Enable or disable the module
   * @default true
   */
  enabled: boolean;

  /**
   * Enable or disable the devtools panel
   * @default true
   */
  devtools: boolean;
}

// Vue Scan types
// These should match the actual types from vue-scan
// but we're defining them here to avoid import issues
export interface VueScanOptions {
  /**
   * Enable devtools integration
   * @default true in development
   */
  devtools?: boolean;

  /**
   * Enable performance marking
   * @default true
   */
  enablePerformanceMarking?: boolean;

  /**
   * Enable component tracking
   * @default true
   */
  enableComponentTracking?: boolean;

  /**
   * Enable profiler
   * @default true
   */
  enableProfiler?: boolean;

  /**
   * Application name
   * @default 'Vue App'
   */
  appName?: string;

  /**
   * Application version
   * @default '1.0.0'
   */
  appVersion?: string;
}

export interface VueScanPerformanceMarker {
  name: string;
  timestamp: number;
  duration?: number;
}

export interface VueScanComponentMetrics {
  componentName: string;
  renderCount: number;
  renderTime: number;
  mountTime?: number;
  updateTime?: number;
}

export interface VueScanInstance {
  /**
   * Mark a performance event
   */
  markPerformance: (name: string) => void;

  /**
   * Get all performance markers
   */
  getPerformanceMarkers: () => VueScanPerformanceMarker[];

  /**
   * Get component metrics
   */
  getComponentMetrics: () => VueScanComponentMetrics[];

  /**
   * Clear all data
   */
  clear: () => void;

  /**
   * Get the current configuration
   */
  getConfig: () => VueScanOptions;

  /**
   * Update the configuration
   */
  updateConfig: (options: Partial<VueScanOptions>) => void;
}
