import { defineEventHandler } from 'h3';
import { startMemoryTracking } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  startMemoryTracking(2000); // Track every 2 seconds
  return { success: true };
});
