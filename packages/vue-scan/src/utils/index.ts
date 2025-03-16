/**
 * Utility functions for Vue Scan
 */

/**
 * Format a time in milliseconds to a human-readable string
 */
export function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Format a memory size to a human-readable string
 */
export function formatMemory(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return function (...args: Parameters<T>): void {
    const now = Date.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Check if we're running in a browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Try to get component display name
 */
export function getComponentName(component: any): string {
  // Try different ways to get component name
  return (
    component.name ||
    component.displayName ||
    component.__name ||
    component.__file?.split('/').pop()?.split('.').shift() ||
    'Unknown'
  );
}

/**
 * Get a color for visualizing rendering time
 */
export function getColorForRenderTime(renderTime: number): string {
  // Green (good): < 8ms
  // Yellow (warning): 8-16ms
  // Orange (slow): 16-33ms
  // Red (very slow): > 33ms
  if (renderTime < 8) {
    return 'rgba(66, 184, 131, 0.7)'; // Green
  } else if (renderTime < 16) {
    return 'rgba(230, 192, 41, 0.7)'; // Yellow
  } else if (renderTime < 33) {
    return 'rgba(241, 102, 42, 0.7)'; // Orange
  } else {
    return 'rgba(215, 29, 29, 0.7)'; // Red
  }
}

/**
 * Safe parse JSON
 */
export function safeJsonParse(str: string, fallback: any = null): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Performance measurement utilities
 */
export const performance = {
  /**
   * Start measuring performance
   */
  start(label: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${label}:start`);
    }
  },

  /**
   * End measuring performance and get result
   */
  end(label: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${label}:end`);
      window.performance.measure(label, `${label}:start`, `${label}:end`);

      const entries = window.performance.getEntriesByName(label);
      const lastEntry = entries[entries.length - 1];

      return lastEntry?.duration || 0;
    }

    return 0;
  },

  /**
   * Clear performance markers
   */
  clear(label?: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      if (label) {
        // Clear specific markers
        window.performance.clearMarks(`${label}:start`);
        window.performance.clearMarks(`${label}:end`);
        window.performance.clearMeasures(label);
      } else {
        // Clear all
        window.performance.clearMarks();
        window.performance.clearMeasures();
      }
    }
  },
};
