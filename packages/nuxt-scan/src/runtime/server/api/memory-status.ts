import { defineEventHandler } from 'h3';
import { isMemoryTracking } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  return { isTracking: isMemoryTracking() };
});
