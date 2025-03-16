<template>
  <div class="memory-profile-demo">
    <h2>Memory Profiling Demo</h2>
    
    <div class="controls">
      <button @click="addComponents(5)" class="btn">Add 5 Components</button>
      <button @click="removeComponents(5)" class="btn" :disabled="componentCount < 5">Remove 5 Components</button>
      <button @click="clearAll" class="btn">Clear All</button>
      <button @click="takeSnapshot" class="btn">Take Snapshot</button>
      <button @click="showStats = !showStats" class="btn">{{ showStats ? 'Hide' : 'Show' }} Stats</button>
    </div>
    
    <div class="components-container">
      <div v-for="i in componentCount" :key="i" class="component-wrapper">
        <!-- Apply memory profiling directive -->
        <div v-memory-profile="`DemoComponent-${i}`" class="demo-component">
          <h3>Component {{ i }}</h3>
          <p>This component is being memory profiled.</p>
          <div class="data-container">
            <!-- Create some data to consume memory -->
            <span v-for="j in dataSize" :key="j" class="data-item">{{ j }}</span>
          </div>
          <button @click="increaseDataSize(i)" class="btn small">Add Data</button>
        </div>
      </div>
    </div>
    
    <div v-if="showStats" class="stats-panel">
      <h3>Memory Statistics</h3>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Instance Count</th>
            <th>Current Heap (MB)</th>
            <th>Average Heap (MB)</th>
            <th>Max Heap (MB)</th>
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
      
      <div class="chart-container" ref="chartContainer">
        <!-- Memory usage chart could be added here -->
        <p>Memory usage over time</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';

// Get memory profiler from app instance via provide/inject
const memoryProfiler = inject('memoryProfiler');

// Component state
const componentCount = ref(0);
const dataSize = ref(10);
const showStats = ref(false);
const memoryStats = ref({});
const chartContainer = ref(null);

// Add components
function addComponents(count) {
  componentCount.value += count;
}

// Remove components
function removeComponents(count) {
  componentCount.value = Math.max(0, componentCount.value - count);
}

// Clear all components
function clearAll() {
  componentCount.value = 0;
  memoryProfiler.clearStats();
  updateStats();
}

// Increase data size for all components to simulate memory growth
function increaseDataSize() {
  dataSize.value += 10;
}

// Take a memory snapshot
function takeSnapshot() {
  updateStats();
}

// Format bytes to MB
function formatBytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

// Update stats display
function updateStats() {
  memoryStats.value = memoryProfiler.getStats();
}

// Set up automatic stats update
let statsInterval;
onMounted(() => {
  // Start memory tracking
  memoryProfiler.startMemoryTracking(2000);

  // Update stats regularly
  statsInterval = setInterval(() => {
    if (showStats.value) {
      updateStats();
    }
  }, 2000);
});

onUnmounted(() => {
  // Clean up
  clearInterval(statsInterval);
});
</script>

<style scoped>
.memory-profile-demo {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin: 20px 0;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.btn {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn.small {
  padding: 5px 10px;
  font-size: 0.8em;
}

.components-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.component-wrapper {
  flex: 0 0 calc(33.33% - 15px);
  min-width: 250px;
}

.demo-component {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f9f9f9;
}

.data-container {
  height: 100px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
  margin: 10px 0;
  background-color: white;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.data-item {
  display: inline-block;
  padding: 3px 6px;
  background-color: #e9e9e9;
  border-radius: 3px;
  font-size: 0.8em;
}

.stats-panel {
  margin-top: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #f5f5f5;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.chart-container {
  height: 300px;
  border: 1px solid #ddd;
  background-color: white;
  padding: 10px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 