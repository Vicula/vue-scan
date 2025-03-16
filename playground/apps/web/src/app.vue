<script setup lang="ts">
import { ref } from 'vue';
import Demo from './components/demo.vue';

const appName = 'Vue Scan Demo';
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
    
    <main>
      <Demo />
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

footer {
  margin-top: 40px;
  text-align: center;
  font-size: 0.9em;
  color: #888;
  border-top: 1px solid #eee;
  padding-top: 20px;
}
</style>
