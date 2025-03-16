import { defineEventHandler } from 'h3';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory path for the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Path to the client component
const clientComponentPath = resolve(
  __dirname,
  '../../devtools/client/memory-panel.vue',
);

export default defineEventHandler(() => {
  // Read the client component file
  const componentContent = fs.readFileSync(clientComponentPath, 'utf-8');

  // Create a basic HTML page that includes the component
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Memory Profiler</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --background-color: #f9f9f9;
      --text-color: #333;
      --card-background: white;
      --text-secondary: #666;
      --primary-color: #00dc82;
      --success-color: #00c853;
      --warning-color: #f1a71e;
      --warning-dark-color: #ff8800;
      --error-color: #ff4d4d;
      --border-color: #eee;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --background-color: #111;
        --text-color: #f0f0f0;
        --card-background: #222;
        --text-secondary: #aaa;
        --border-color: #333;
      }
    }

    .debug-info {
      margin-top: 20px;
      padding: 10px;
      background-color: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  </style>
  <!-- Import the DevTools iframe client script -->
  <script src="https://cdn.jsdelivr.net/npm/@nuxt/devtools-kit/iframe-client"></script>
</head>
<body>
  <div id="app"></div>
  
  <div class="debug-info">
    <h3>DevTools Client Debug Info:</h3>
    <pre id="debug-output">Loading...</pre>
  </div>
  
  <script type="module">
    // Import Vue
    import { createApp, ref, computed, onMounted, onUnmounted, defineComponent } from 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.esm-browser.js'
    
    // Make Vue accessible to the component
    window.Vue = { ref, computed, onMounted, onUnmounted }
    
    // Debug output element
    const debugOutput = document.getElementById('debug-output')
    
    // Check for DevTools client
    const updateDebugInfo = () => {
      let debugInfo = 'Debug Information:\\n'
      
      // Check for __NUXT_DEVTOOLS__
      if (window.__NUXT_DEVTOOLS__) {
        debugInfo += '✅ __NUXT_DEVTOOLS__ is available\\n'
      } else {
        debugInfo += '❌ __NUXT_DEVTOOLS__ is NOT available\\n'
      }
      
      // Check for onDevtoolsClientConnected
      if (typeof window.onDevtoolsClientConnected === 'function') {
        debugInfo += '✅ onDevtoolsClientConnected is available\\n'
      } else {
        debugInfo += '❌ onDevtoolsClientConnected is NOT available\\n'
      }
      
      // Check if we're in an iframe
      debugInfo += '\\nFrame info:\\n'
      debugInfo += 'Is iframe: ' + (window.self !== window.top) + '\\n'
      
      debugOutput.textContent = debugInfo
    }
    
    // Update debug info periodically
    setInterval(updateDebugInfo, 1000)
    
    // Define the component
    const Component = defineComponent({
      template: \`${componentContent.replace(/`/g, '\\`')}\`,
    })
    
    // Create and mount the app
    const app = createApp(Component)
    app.mount('#app')
    
    // Log that the app is mounted
    console.log('Memory profiler client app mounted')
  </script>
</body>
</html>
  `;
});
