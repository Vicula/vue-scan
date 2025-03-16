<script setup>
import { ref, provide } from 'vue';
import ChildLevel1 from './ChildLevel1.vue';

// Parent component state
const parentCounter = ref(0);
const sharedState = ref('Shared Value');

// Provide state to deep child components
provide('sharedState', sharedState);

function incrementParent() {
  parentCounter.value++;
}

function updateSharedState(newValue) {
  sharedState.value = newValue;
}
</script>

<template>
  <div class="nested-container">
    <h2>Nested Components Demo</h2>
    
    <div class="parent">
      <h3>Parent Component</h3>
      <p>Parent Counter: {{ parentCounter }}</p>
      <button @click="incrementParent" class="btn">Increment Parent</button>
      <input 
        v-model="sharedState" 
        class="input"
        placeholder="Update shared state"
      />
      
      <ChildLevel1 
        :parent-counter="parentCounter"
        @update:parent-counter="incrementParent"
      />
    </div>
  </div>
</template>

<style scoped>
.nested-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2, h3, h4 {
  margin-top: 0;
}

.parent {
  border: 2px solid #3498db;
  padding: 15px;
  border-radius: 8px;
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

.input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 200px;
  margin-bottom: 10px;
}
</style> 