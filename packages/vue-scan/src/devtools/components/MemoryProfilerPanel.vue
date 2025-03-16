<template>
  <div class="memory-profiler-panel">
    <div class="controls">
      <button @click="toggleTracking" :class="{ active: isTracking }">
        {{ isTracking ? 'Stop Tracking' : 'Start Tracking' }}
      </button>
      <button @click="takeSnapshot" :disabled="!isTracking">
        Take Snapshot
      </button>
      <button @click="clearStats">
        Clear Stats
      </button>
    </div>

    <div class="stats-table" v-if="Object.keys(memoryStats).length > 0">
      <h3>Memory Statistics</h3>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Instances</th>
            <th>Current (MB)</th>
            <th>Average (MB)</th>
            <th>Max (MB)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(stat, name) in memoryStats" :key="name">
            <td>{{ name }}</td>
            <td>{{ stat.instanceCount }}</td>
            <td>{{ formatBytes(stat.lastHeapUsed) }}</td>
            <td>{{ formatBytes(stat.averageHeapUsed) }}</td>
            <td>{{ formatBytes(stat.maxHeapUsed) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="no-data" v-else>
      <p>No memory data collected yet. Start tracking to collect data.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue';

/**
 * The memory profiler panel connects to the memory profiler service
 * to display memory usage statistics for Vue components.
 */
const isTracking = ref(false);
const memoryStats = ref({});
let memoryProfiler: any = null;

// Check if Vue app has memory profiler available
onMounted(() => {
  // First try to get the memory profiler from the window object (global instance)
  if ((window as any).$memoryProfiler) {
    memoryProfiler = (window as any).$memoryProfiler;
    updateStats();
    return;
  }

  // Next try to get from the Vue DevTools hook
  const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__;
  if (hook?.Vue?.config?.globalProperties?.$memoryProfiler) {
    memoryProfiler = hook.Vue.config.globalProperties.$memoryProfiler;
    updateStats();
    return;
  }

  // Finally, check if we can get it from the parent app instance
  const app = hook?.apps?.[0];
  if (app?.config?.globalProperties?.$memoryProfiler) {
    memoryProfiler = app.config.globalProperties.$memoryProfiler;
    updateStats();
    return;
  }

  console.warn('Memory profiler not found, panel will not function properly');
});

// Cleanup on unmount
onUnmounted(() => {
  if (isTracking.value) {
    stopTracking();
  }
});

// Toggle memory tracking
function toggleTracking() {
  if (isTracking.value) {
    stopTracking();
  } else {
    startTracking();
  }
}

// Start tracking memory
function startTracking() {
  if (!memoryProfiler) {
    return;
  }

  memoryProfiler.startTracking(1000); // Update every second for DevTools
  isTracking.value = true;

  // Setup periodic updates
  startPeriodicUpdates();
}

// Stop tracking memory
function stopTracking() {
  if (!memoryProfiler) {
    return;
  }

  memoryProfiler.stopTracking();
  isTracking.value = false;

  // Stop periodic updates
  stopPeriodicUpdates();
}

// Take a memory snapshot
function takeSnapshot() {
  if (!memoryProfiler) {
    return;
  }

  updateStats();
}

// Clear statistics
function clearStats() {
  if (!memoryProfiler) {
    return;
  }

  memoryProfiler.clearStats();
  updateStats();
}

// Update stats display
function updateStats() {
  if (!memoryProfiler) {
    return;
  }

  memoryStats.value = memoryProfiler.getStats();
}

// Format bytes to MB
function formatBytes(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

// Periodic updates
let updateInterval: number | null = null;

function startPeriodicUpdates() {
  updateInterval = window.setInterval(() => {
    updateStats();
  }, 1000) as unknown as number;
}

function stopPeriodicUpdates() {
  if (updateInterval !== null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}
</script>

<style scoped>
.memory-profiler-panel {
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.controls {
  margin-bottom: 16px;
}

button {
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 12px;
  margin-right: 8px;
  cursor: pointer;
}

button:hover {
  background-color: #e0e0e0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button.active {
  background-color: #e1f5fe;
  border-color: #03a9f4;
}

.stats-table {
  margin-top: 20px;
}

h3 {
  margin-bottom: 12px;
  font-size: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 8px;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f5f5f5;
  font-weight: 500;
}

.no-data {
  margin-top: 20px;
  color: #666;
  font-style: italic;
}
</style> 