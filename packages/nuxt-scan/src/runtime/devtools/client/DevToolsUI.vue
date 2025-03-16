<template>
  <div class="h-full">
    <NuxtDevToolsPanel>
      <MemoryPanel />
    </NuxtDevToolsPanel>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';
const MemoryPanel = defineAsyncComponent(() => import('./memory-panel.vue'));
</script> 