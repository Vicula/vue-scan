<script setup>
import { ref, inject } from 'vue';

// Child level 3 component state
const level3Counter = ref(0);
// Inject shared state from ancestor
const injectedState = inject('sharedState', ref('Default Value'));

function incrementLevel3() {
  level3Counter.value++;
}
</script>

<template>
  <div class="child level-3">
    <h4>Child Level 3</h4>
    <p>Local Counter: {{ level3Counter }}</p>
    <p>Injected State: {{ injectedState }}</p>
    <button @click="incrementLevel3" class="btn">Increment Level 3</button>
  </div>
</template>

<style scoped>
.child {
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.level-3 {
  border: 2px solid #f39c12;
  margin-left: 20px;
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
</style> 