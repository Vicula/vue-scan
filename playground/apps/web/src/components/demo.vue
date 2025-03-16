<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

// Component state
const count = ref(0);
const items = ref(
  Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    completed: false,
  })),
);
const showCompleted = ref(true);
const filterText = ref('');
const heavyComputation = ref(0);

// Expensive computed property
const computeHeavyValue = computed(() => {
  let result = 0;
  for (let i = 0; i < 10000; i++) {
    result += Math.sqrt(i);
  }
  return result;
});

const filteredItems = computed(() => {
  // Filter items
  return items.value
    .filter((item) => {
      const matchesFilter = item.name
        .toLowerCase()
        .includes(filterText.value.toLowerCase());
      const matchesCompletion = showCompleted.value ? true : !item.completed;
      return matchesFilter && matchesCompletion;
    })
    .slice(0, 20); // Only show 20 items at a time for performance
});

// Watch the heavy computation value
watch(computeHeavyValue, (newValue) => {
  heavyComputation.value = newValue;
});

// Actions
function incrementCounter() {
  count.value++;
}

function toggleItemCompletion(id: number) {
  const item = items.value.find((item) => item.id === id);
  if (item) {
    item.completed = !item.completed;
  }
}

function addRandomItem() {
  const id = Math.max(0, ...items.value.map((item) => item.id)) + 1;
  items.value.push({
    id,
    name: `New Item ${id}`,
    completed: false,
  });
}

function causeHeavyRender() {
  // Force component update with an expensive operation
  const start = performance.now();
  let result = 0;

  // Really expensive operation
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i);
  }

  heavyComputation.value = result;
  console.log(`Heavy render took ${performance.now() - start}ms`);
}

function clearItems() {
  items.value = [];
}

// Demonstrate unnecessary renders with a watcher
watch(count, () => {
  console.log('Count changed:', count.value);
  // This causes an extra render for demonstration
  if (count.value % 5 === 0) {
    setTimeout(() => {
      addRandomItem();
    }, 100);
  }
});

// Component lifecycle hooks
onMounted(() => {
  console.log('Demo component mounted');
});
</script>

<template>
  <div class="demo-container">
    <h2>Vue Scan Demo Component</h2>
    
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">Counter:</span>
        <span class="stat-value">{{ count }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Items:</span>
        <span class="stat-value">{{ items.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Filtered:</span>
        <span class="stat-value">{{ filteredItems.length }}</span>
      </div>
    </div>
    
    <div class="controls">
      <button @click="incrementCounter" class="btn">Increment Counter</button>
      <button @click="addRandomItem" class="btn">Add Item</button>
      <button @click="causeHeavyRender" class="btn btn-warning">Cause Heavy Render</button>
      <button @click="clearItems" class="btn btn-danger">Clear Items</button>
    </div>
    
    <div class="filters">
      <div class="filter-group">
        <label for="filter">Filter:</label>
        <input 
          id="filter" 
          v-model="filterText" 
          type="text" 
          placeholder="Filter items..." 
          class="filter-input"
        />
      </div>
      
      <div class="filter-group">
        <label for="show-completed">
          <input 
            id="show-completed" 
            v-model="showCompleted" 
            type="checkbox"
          />
          Show Completed
        </label>
      </div>
    </div>
    
    <div class="items-list">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="item"
        :class="{ 'item-completed': item.completed }"
      >
        <label>
          <input 
            type="checkbox" 
            :checked="item.completed" 
            @change="toggleItemCompletion(item.id)" 
          />
          {{ item.name }}
        </label>
      </div>
      
      <div v-if="filteredItems.length === 0" class="no-items">
        No items match your filter
      </div>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.stats {
  display: flex;
  justify-content: space-around;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-weight: bold;
  margin-right: 5px;
}

.stat-value {
  font-size: 1.2em;
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

.btn-warning {
  background-color: #ff9800;
}

.btn-danger {
  background-color: #f44336;
}

.filters {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
}

.items-list {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
}

.item:last-child {
  border-bottom: none;
}

.item-completed {
  text-decoration: line-through;
  color: #888;
}

.no-items {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style> 