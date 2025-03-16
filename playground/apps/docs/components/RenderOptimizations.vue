<script setup>
import {
  ref,
  computed,
  onMounted,
  reactive,
  markRaw,
  shallowRef,
  nextTick,
} from 'vue';

// Regular reactive variables
const counter = ref(0);
const items = reactive([
  { id: 1, name: 'Item 1', value: 10 },
  { id: 2, name: 'Item 2', value: 20 },
  { id: 3, name: 'Item 3', value: 30 },
  { id: 4, name: 'Item 4', value: 40 },
  { id: 5, name: 'Item 5', value: 50 },
]);

// Example of using markRaw to opt out of reactivity for performance
const heavyObject = markRaw({
  id: 'complex-object',
  nestedData: Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    value: `Value ${i}`,
    timestamp: new Date().toISOString(),
  })),
});

// Example of using shallowRef for large objects
const largeObjectShallow = shallowRef({
  id: 'large-object',
  items: Array.from({ length: 500 }, (_, i) => ({ id: i, name: `Item ${i}` })),
  metadata: {
    created: new Date(),
    lastUpdated: new Date(),
    version: '1.0.0',
  },
});

// Performance tracking
const renderCount = ref(0);
const lastRenderTime = ref(0);
const renderTimes = ref([]);
const maxRenderTimes = 10;

// Regular computed property - recalculated on dependency changes
const total = computed(() => {
  console.log('Computing total');
  return items.reduce((sum, item) => sum + item.value, 0);
});

// Expensive computation - should be optimized
function expensiveOperation() {
  console.log('Running expensive operation');
  const start = performance.now();

  // Simulate expensive calculation
  let result = 0;
  for (let i = 0; i < 100000; i++) {
    result += Math.sqrt(i);
  }

  const end = performance.now();
  lastRenderTime.value = end - start;
  renderTimes.value.push(end - start);

  if (renderTimes.value.length > maxRenderTimes) {
    renderTimes.value.shift();
  }

  return result;
}

// Memoized expensive function (simple implementation)
const memoizedResults = new Map();
function memoizedExpensiveOperation(id) {
  if (memoizedResults.has(id)) {
    console.log(`Using cached result for id: ${id}`);
    return memoizedResults.get(id);
  }

  console.log(`Computing new result for id: ${id}`);
  const start = performance.now();

  // Simulate expensive calculation
  let result = 0;
  for (let i = 0; i < 100000; i++) {
    result += Math.sqrt(i * id);
  }

  const end = performance.now();
  console.log(`Calculation took ${end - start}ms`);

  memoizedResults.set(id, result);
  return result;
}

// Actions
function incrementCounter() {
  counter.value++;
  renderCount.value++;
}

function addItem() {
  const newId =
    items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
  items.push({
    id: newId,
    name: `Item ${newId}`,
    value: Math.floor(Math.random() * 100),
  });
  renderCount.value++;
}

function updateShallowRef() {
  // Only triggers one re-render since we're replacing the top-level object
  largeObjectShallow.value = {
    ...largeObjectShallow.value,
    metadata: {
      ...largeObjectShallow.value.metadata,
      lastUpdated: new Date(),
    },
  };
  renderCount.value++;
}

function updateNestedItem(id) {
  const item = items.find((item) => item.id === id);
  if (item) {
    item.value += 5;
    renderCount.value++;
  }
}

function forceRerender() {
  renderCount.value++;
  nextTick(() => {
    // Measure render time on next tick
    const result = expensiveOperation();
    console.log(`Force rerender with result: ${result}`);
  });
}

// Lifecycle hooks
onMounted(() => {
  console.log('Component mounted');
  expensiveOperation();
});
</script>

<template>
  <div class="optimization-container">
    <h2>Render Optimizations Demo</h2>
    
    <div class="stats-panel">
      <div class="stat-item">
        <span class="stat-label">Counter:</span>
        <span class="stat-value">{{ counter }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Total Value:</span>
        <span class="stat-value">{{ total }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Render Count:</span>
        <span class="stat-value">{{ renderCount }}</span>
      </div>
      
      <div class="stat-item">
        <span class="stat-label">Last Render Time:</span>
        <span class="stat-value">{{ lastRenderTime.toFixed(2) }}ms</span>
      </div>
    </div>
    
    <div class="performance-chart">
      <h3>Render Times History</h3>
      <div class="chart-bars">
        <div 
          v-for="(time, index) in renderTimes" 
          :key="index"
          class="chart-bar"
          :style="{ height: `${Math.min(time / 2, 100)}px` }"
          :title="`Render #${index + 1}: ${time.toFixed(2)}ms`"
        ></div>
      </div>
    </div>
    
    <div class="controls">
      <button @click="incrementCounter" class="btn">Increment Counter</button>
      <button @click="addItem" class="btn">Add Item</button>
      <button @click="updateShallowRef" class="btn">Update Shallow Ref</button>
      <button @click="forceRerender" class="btn">Force Expensive Rerender</button>
    </div>
    
    <div class="optimization-sections">
      <div class="optimization-section">
        <h3>Regular Rendering</h3>
        <p>Counter Value: {{ counter }}</p>
        <p>Expensive calculation result: {{ expensiveOperation() }}</p>
      </div>
      
      <div class="optimization-section">
        <h3>v-once Optimization</h3>
        <p v-once>This text renders only once: {{ new Date().toLocaleTimeString() }}</p>
        <p>Compare with regular time update: {{ new Date().toLocaleTimeString() }}</p>
      </div>
      
      <div class="optimization-section">
        <h3>Memo Optimization</h3>
        <div v-for="id in 3" :key="`memo-${id}`" class="memo-item">
          <p>Memoized result for ID {{ id }}: {{ memoizedExpensiveOperation(id) }}</p>
        </div>
      </div>
    </div>
    
    <div class="items-section">
      <h3>Items List</h3>
      <ul>
        <li 
          v-for="item in items" 
          :key="item.id" 
          class="item"
        >
          <span class="item-name">{{ item.name }}</span>
          <span class="item-value">Value: {{ item.value }}</span>
          <button @click="updateNestedItem(item.id)" class="btn-small">+5</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.optimization-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2, h3 {
  margin-top: 0;
}

.stats-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-item {
  padding: 5px 10px;
}

.stat-label {
  font-weight: bold;
  margin-right: 5px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn:hover {
  opacity: 0.9;
}

.btn-small {
  padding: 2px 6px;
  font-size: 12px;
}

.optimization-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.optimization-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.items-section {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.items-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: bold;
}

.memo-item {
  margin-bottom: 10px;
  padding: 5px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.performance-chart {
  margin-bottom: 20px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 120px;
  gap: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chart-bar {
  flex: 1;
  background-color: #4caf50;
  min-width: 20px;
  border-radius: 2px 2px 0 0;
}
</style> 