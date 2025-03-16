import { defineEventHandler } from 'h3';
import { clearMemoryStats } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  clearMemoryStats();
  return { success: true };
});
