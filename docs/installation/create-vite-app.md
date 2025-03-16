# Installing Vue Scan in a Vite-created Vue App

This guide explains how to install and configure Vue Scan in a project created with the Vite template `create-vite`.

## Creating a New Vite Vue Project

If you haven't created a project yet, you can use Vite's official scaffolding tool:

```bash
# npm
npm create vite@latest my-vue-app -- --template vue

# yarn
yarn create vite my-vue-app --template vue

# pnpm
pnpm create vite my-vue-app --template vue

# With TypeScript
npm create vite@latest my-vue-app -- --template vue-ts
```

## Installation

Navigate to your project directory and install Vue Scan:

```bash
cd my-vue-app

# npm
npm install vue-scan --save-dev

# yarn
yarn add vue-scan --dev

# pnpm
pnpm add vue-scan -D
```

## Basic Setup

Open your main entry file (usually `src/main.js` or `src/main.ts`) and add Vue Scan:

```js
// src/main.js or src/main.ts
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

// Import any other extensions you're using
import './style.css'

const app = createApp(App)

// Add Vue Scan
app.use(createVueScan())

app.mount('#app')
```

## Configuration

You can customize Vue Scan by passing options:

```js
app.use(createVueScan({
  enabled: import.meta.env.DEV, // Only in development mode
  overlay: true,
  devtools: true,
  ignore: ['RouterLink', 'RouterView']
}))
```

## Using Environment Variables with Vite

Vite exposes environment variables through `import.meta.env`. You can create the following files:

```
# .env.development
VITE_ENABLE_VUE_SCAN=true
VITE_VUE_SCAN_OVERLAY=true

# .env.production
VITE_ENABLE_VUE_SCAN=false
```

Then use these in your configuration:

```js
app.use(createVueScan({
  enabled: import.meta.env.VITE_ENABLE_VUE_SCAN === 'true',
  overlay: import.meta.env.VITE_VUE_SCAN_OVERLAY === 'true'
}))
```

## TypeScript Support

If you're using the TypeScript template, add type declarations for Vue Scan:

```ts
// src/vue-scan.d.ts
declare module 'vue-scan' {
  import { App } from 'vue'
  
  export interface VueScanOptions {
    enabled?: boolean
    overlay?: boolean
    devtools?: boolean
    ignore?: string[]
    trackMemory?: boolean
    trackMountTime?: boolean
    trackRenderFrequency?: boolean
  }
  
  export function createVueScan(options?: VueScanOptions): {
    install(app: App): void
  }
  
  export const version: string
}
```

## Integration with Vite Configuration

You can enhance Vue Scan with Vite-specific configurations:

```js
// vite.config.js or vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    // Vite development server options
    open: true
  },
  define: {
    // Any global constants needed
    __VUE_SCAN_ENABLED__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
})
```

## Advanced Integration: Vite Plugin (Optional)

For deeper integration, you can create a simple Vite plugin for Vue Scan:

```js
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Simple Vue Scan Vite plugin
function vueScanPlugin() {
  return {
    name: 'vite-plugin-vue-scan',
    configResolved(config) {
      console.log(`Vue Scan enabled for ${config.mode} mode`)
    },
    transformIndexHtml(html) {
      // You could inject code for Vue Scan here if needed
      return html
    }
  }
}

export default defineConfig({
  plugins: [
    vue(),
    vueScanPlugin()
  ]
})
```

## Adding Vue Router

If you're adding Vue Router to your Vite app, make sure to set up Vue Scan after the router:

```js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVueScan } from 'vue-scan'
import App from './App.vue'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

const app = createApp(App)
app.use(router)
app.use(createVueScan())

app.mount('#app')
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Configuration Options](../guides/configuration.md)
- Check the [Vite Integration](./vite.md) guide for more details on working with Vite