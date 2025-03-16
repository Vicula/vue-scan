import { defineEventHandler } from 'h3';
import { stopMemoryTracking } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  stopMemoryTracking();
  return { success: true };
});
