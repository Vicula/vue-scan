import { defineEventHandler } from 'h3';
import { getMemoryStats } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  return getMemoryStats();
});
