import { defineEventHandler } from 'h3';

// DevTools client entry point
export default defineEventHandler((event) => {
  // Set content type as HTML
  event.res.setHeader('Content-Type', 'text/html');

  // Create a simple HTML app with Vue DevTools styling for the iframe
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vue Scan DevTools</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nuxt/ui-pro@1.0.1/dist/style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@nuxt/ui@2.13.1/dist/style.css">
  <script src="https://cdn.jsdelivr.net/npm/vue@3.3.0/dist/vue.global.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.0.0/dist/chart.umd.min.js"></script>
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0F172A;
      color: #E2E8F0;
      margin: 0;
      min-height: 100vh;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1rem;
    }
    .content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    .card {
      background-color: rgba(30, 41, 59, 0.7);
      border-radius: 0.5rem;
      padding: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .tabs {
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1rem;
    }
    .tab {
      padding: 0.5rem 1rem;
      cursor: pointer;
      opacity: 0.7;
    }
    .tab.active {
      opacity: 1;
      border-bottom: 2px solid #3B82F6;
    }
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
    /* Client-side code will be injected later */
    const { createApp, ref, onMounted } = Vue;

    const App = {
      setup() {
        const activeTab = ref('performance');
        const perfData = ref([]);
        const componentData = ref([]);
        const isLoading = ref(true);

        onMounted(async () => {
          try {
            // Fetch initial data
            const response = await fetch('/api/scan-devtools?action=getPerfData');
            const data = await response.json();
            
            if (data.success) {
              perfData.value = data.data;
            }
            
            // Fetch component data
            const compResponse = await fetch('/api/scan-devtools?action=getComponentData');
            const compData = await compResponse.json();
            
            if (compData.success) {
              componentData.value = compData.data;
            }
          } catch (error) {
            console.error('Failed to fetch data:', error);
          } finally {
            isLoading.value = false;
          }
        });

        const setActiveTab = (tab) => {
          activeTab.value = tab;
        };

        return {
          activeTab,
          perfData,
          componentData,
          isLoading,
          setActiveTab
        };
      },
      template: \`
      <div class="container">
        <div class="header">
          <h1>Vue Scan DevTools</h1>
          <div>
            <button class="btn btn-primary" @click="refreshData">Refresh</button>
          </div>
        </div>
        
        <div class="tabs">
          <div 
            class="tab" 
            :class="{ active: activeTab === 'performance' }" 
            @click="setActiveTab('performance')"
          >
            Performance
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'components' }" 
            @click="setActiveTab('components')"
          >
            Components
          </div>
          <div 
            class="tab" 
            :class="{ active: activeTab === 'settings' }" 
            @click="setActiveTab('settings')"
          >
            Settings
          </div>
        </div>
        
        <div v-if="isLoading" class="loading">
          Loading data...
        </div>
        
        <div v-else class="content">
          <div v-if="activeTab === 'performance'">
            <div class="card">
              <h2>Performance Metrics</h2>
              <p>Detailed performance data will be displayed here</p>
            </div>
          </div>
          
          <div v-if="activeTab === 'components'">
            <div class="card">
              <h2>Component Analysis</h2>
              <p>Component rendering metrics will be displayed here</p>
            </div>
          </div>
          
          <div v-if="activeTab === 'settings'">
            <div class="card">
              <h2>Settings</h2>
              <p>Configuration options for Vue Scan</p>
            </div>
          </div>
        </div>
      </div>
      \`
    };

    const app = createApp(App);
    app.mount('#app');
  </script>
</body>
</html>
  `.trim();

  return html;
});
