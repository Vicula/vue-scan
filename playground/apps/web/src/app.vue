<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';

// Import components
const Demo = defineAsyncComponent(() => import('./components/demo.vue'));
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

const appName = 'Vue Scan Demo';
const activeTab = ref('demo');

// Define tabs
const tabs = [
  { id: 'demo', label: 'Basic Demo' },
  { id: 'nested', label: 'Nested Components' },
  { id: 'api', label: 'API Component' },
  { id: 'form', label: 'Form Component' },
  { id: 'render', label: 'Render Optimizations' },
];

function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}
</script>

<template>
  <div class="app">
    <header>
      <h1>{{ appName }}</h1>
      <p class="description">
        A demonstration of the Vue Scan performance monitoring plugin.
        This app intentionally includes components with various performance patterns to showcase the plugin's capabilities.
      </p>
    </header>
    
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
      <Demo v-if="activeTab === 'demo'" />
      <NestedParent v-else-if="activeTab === 'nested'" />
      <ApiComponent v-else-if="activeTab === 'api'" />
      <FormComponent v-else-if="activeTab === 'form'" />
      <RenderOptimizations v-else-if="activeTab === 'render'" />
    </main>
    
    <footer>
      <p>Open Vue DevTools to see more detailed performance metrics</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

h1 {
  color: #42b883;
  margin-bottom: 10px;
}

.description {
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
}

.tab-button {
  padding: 8px 16px;
  margin: 0 5px;
  border: none;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.tab-button:hover {
  background-color: #e0e0e0;
}

.tab-button.active {
  background-color: #42b883;
  color: white;
}

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 0.9em;
  color: #888;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
</style>
