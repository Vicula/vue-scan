<script setup>
import { ref } from 'vue';
import ChildLevel3 from './ChildLevel3.vue';

const props = defineProps({
  ancestorCounter: Number,
});

// Child level 2 component state
const level2Counter = ref(0);

function incrementLevel2() {
  level2Counter.value++;
}
</script>

<template>
  <div class="child level-2">
    <h4>Child Level 2</h4>
    <p>Local Counter: {{ level2Counter }}</p>
    <p>Ancestor Counter (prop drilling): {{ props.ancestorCounter }}</p>
    <button @click="incrementLevel2" class="btn">Increment Level 2</button>
    
    <ChildLevel3 />
  </div>
</template>

<style scoped>
.child {
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.level-2 {
  border: 2px solid #e74c3c;
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