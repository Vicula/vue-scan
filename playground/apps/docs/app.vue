<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { Page } from 'ui';
import { name } from './package.json';

// Import components lazily for better performance
const NestedParent = defineAsyncComponent(
  () => import('./components/NestedParent.vue'),
);
const ApiComponent = defineAsyncComponent(
  () => import('./components/ApiComponent.vue'),
);
const FormComponent = defineAsyncComponent(
  () => import('./components/FormComponent.vue'),
);
const RenderOptimizations = defineAsyncComponent(
  () => import('./components/RenderOptimizations.vue'),
);

// Tab management
const activeTab = ref('default');
const tabs = [
  { id: 'default', label: 'Default Page' },
  { id: 'nested', label: 'Nested Components' },
  { id: 'api', label: 'API Component' },
  { id: 'form', label: 'Form Component' },
  { id: 'render', label: 'Render Optimizations' },
];

function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}

// Set the page metadata - TypeScript error ignored since useHead is provided by Nuxt
// @ts-ignore
useHead({
  title: 'Nuxt Scan Demo',
  meta: [{ name: 'description', content: 'Nuxt playground for nuxt-scan' }],
});

defineExpose({
  name,
});
</script>

<template>
  <div class="app">
    <div class="app-header">
      <h1>{{ name }} - Demo Components</h1>
      <p class="description">
        A demonstration of the Nuxt Scan performance monitoring plugin.
        This app intentionally includes components with various performance patterns to showcase the plugin's capabilities.
      </p>
    </div>
    
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="{ 'active': activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
        class="tab-button"
      >
        {{ tab.label }}
      </button>
    </div>
    
    <main>
      <Page v-if="activeTab === 'default'" :app-name="name" />
      <NestedParent v-else-if="activeTab === 'nested'" />
      <ApiComponent v-else-if="activeTab === 'api'" />
      <FormComponent v-else-if="activeTab === 'form'" />
      <RenderOptimizations v-else-if="activeTab === 'render'" />
    </main>
    
    <footer>
      <p>Open Nuxt DevTools to see more detailed performance metrics</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #0f1129;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #41b883;
  margin-bottom: 10px;
}

.description {
  color: #ccc;
  max-width: 600px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #2d2d3a;
  padding-bottom: 10px;
}

.tab-button {
  padding: 8px 16px;
  margin: 0 5px;
  border: none;
  background-color: #1e1e2d;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #2a2a3d;
}

.tab-button.active {
  background-color: #41b883;
  color: #0f1129;
}

main {
  min-height: 500px;
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 0.9em;
  color: #888;
  border-top: 1px solid #2d2d3a;
  padding-top: 20px;
}
</style>
