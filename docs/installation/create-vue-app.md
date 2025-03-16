# Installing Vue Scan in a Create Vue App

This guide explains how to install and configure Vue Scan in a project created with the official [create-vue](https://github.com/vuejs/create-vue) scaffolding tool.

## Installation

First, make sure you have a Vue project created with `create-vue`:

```bash
# Create a new project with create-vue
npm init vue@latest my-vue-app
cd my-vue-app
```

Once you have your project set up, install Vue Scan using your preferred package manager:

```bash
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

// Import other items from your create-vue project
import router from './router'
import store from './store'

const app = createApp(App)

// Add router and store (if available)
if (router) app.use(router)
if (store) app.use(store)

// Add Vue Scan
app.use(createVueScan({
  // Vue Scan options
}))

app.mount('#app')
```

## Configuration for TypeScript Projects

If you're using TypeScript (which is common with create-vue projects), you might want to add type declarations:

```ts
// src/shims-vue-scan.d.ts
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

## Configuration with Environment Variables

You can use the environment variables to configure Vue Scan differently for development and production:

Create or modify `.env.development` and `.env.production` files:

```
# .env.development
VITE_ENABLE_VUE_SCAN=true

# .env.production
VITE_ENABLE_VUE_SCAN=false
```

Then update your main file to use these variables:

```js
// src/main.js
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)

// Use environment variables
app.use(createVueScan({
  enabled: import.meta.env.VITE_ENABLE_VUE_SCAN === 'true',
  // Other options
}))

app.mount('#app')
```

## Configuring with Vite

Since create-vue uses Vite by default, you can also configure Vite to enhance the Vue Scan experience:

```js
// vite.config.js or vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // Add Vue Scan build time optimizations if needed
  build: {
    // Vite build options
  },
  define: {
    // Define global constants
    __VUE_SCAN_VERSION__: JSON.stringify('1.0.0')
  }
})
```

## Ignoring Components in Create Vue Templates

Create Vue projects come with several built-in components you might want to ignore in Vue Scan:

```js
app.use(createVueScan({
  ignore: [
    'RouterLink',
    'RouterView',
    'Suspense',
    'Transition',
    'TransitionGroup'
  ]
}))
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Configuration Options](../guides/configuration.md)
- Check the [Vite Integration](./vite.md) guide for more details on working with Vite