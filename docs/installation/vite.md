# Installing Vue Scan in a Vite Project

This guide will help you install and set up Vue Scan in a Vite-powered Vue.js application.

## Installation

Install Vue Scan using your preferred package manager:

```bash
# npm
npm install vue-scan --save-dev

# yarn
yarn add vue-scan --dev

# pnpm
pnpm add vue-scan -D
```

## Basic Setup

In your main entry file (usually `main.js` or `main.ts`), add the Vue Scan plugin to your Vue application:

```js
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

// Add the Vue Scan plugin
app.use(createVueScan({
  // Vue Scan options
}))

app.mount('#app')
```

## Environment-Specific Configuration

You can use Vite's environment variables to conditionally configure Vue Scan:

```js
// main.js or main.ts
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

app.use(createVueScan({
  // Enable only in development by default,
  // or when explicitly set to true in .env files
  enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_VUE_SCAN === 'true',
  
  // Other options...
  overlay: true,
  devtools: true
}))

app.mount('#app')
```

## Environment Variables

You can control Vue Scan settings via environment variables in a `.env` file:

```
# .env.development
VITE_ENABLE_VUE_SCAN=true
VITE_VUE_SCAN_TRACK_MEMORY=false

# .env.production
VITE_ENABLE_VUE_SCAN=false
```

Then use these variables in your configuration:

```js
app.use(createVueScan({
  enabled: import.meta.env.VITE_ENABLE_VUE_SCAN === 'true',
  trackMemory: import.meta.env.VITE_VUE_SCAN_TRACK_MEMORY === 'true',
}))
```

## Vite Plugin Integration (Optional)

For deeper integration with Vite, you can create a simple Vite plugin:

```js
// vite.config.js or vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Simple Vite plugin for Vue Scan
const vueScanPlugin = () => {
  return {
    name: 'vite-plugin-vue-scan',
    configResolved(config) {
      console.log('Vue Scan enabled in development mode')
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueScanPlugin()
  ],
})
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Overlay Interface](../guides/overlay.md)
- Check the [DevTools Integration](../guides/devtools.md)