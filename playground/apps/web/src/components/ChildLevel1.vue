<script setup>
import { ref } from 'vue';
import ChildLevel2 from './ChildLevel2.vue';

const props = defineProps({
  parentCounter: Number,
});

const emit = defineEmits(['update:parent-counter']);

// Child component state
const childCounter = ref(0);

function incrementChild() {
  childCounter.value++;
}

function requestParentIncrement() {
  emit('update:parent-counter');
}
</script>

<template>
  <div class="child level-1">
    <h4>Child Level 1</h4>
    <p>Local Counter: {{ childCounter }}</p>
    <p>Parent Counter (prop): {{ props.parentCounter }}</p>
    <div class="controls">
      <button @click="incrementChild" class="btn">Increment Child</button>
      <button @click="requestParentIncrement" class="btn">Request Parent Increment</button>
    </div>
    
    <ChildLevel2 :ancestor-counter="props.parentCounter" />
  </div>
</template>

<style scoped>
.child {
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
}

.level-1 {
  border: 2px solid #2ecc71;
  margin-left: 20px;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 10px 0;
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