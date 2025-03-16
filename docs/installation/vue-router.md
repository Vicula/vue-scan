# Using Vue Scan with Vue Router

This guide explains how to use Vue Scan effectively with Vue Router.

## Basic Installation

First, install Vue Scan using your preferred package manager:

```bash
# npm
npm install vue-scan --save-dev

# yarn
yarn add vue-scan --dev

# pnpm
pnpm add vue-scan -D
```

## Integration with Vue Router

When using Vue Scan with Vue Router, make sure to set up Vue Scan after creating the router but before mounting the app:

```js
// main.js
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVueScan } from 'vue-scan'
import App from './App.vue'
import routes from './routes'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create app
const app = createApp(App)

// Add router
app.use(router)

// Add Vue Scan
app.use(createVueScan({
  // Vue Scan options
}))

// Mount app
app.mount('#app')
```

## Ignoring Router Components

Router components like `RouterLink` and `RouterView` often render frequently during navigation, which can create noise in your performance metrics. It's a good practice to ignore these components in Vue Scan:

```js
app.use(createVueScan({
  ignore: [
    'RouterLink',
    'RouterView',
    'RouterViewTransition'
  ]
}))
```

## Monitoring Route Changes

You can monitor performance around route changes by connecting to router events. This can help you understand the performance impact of route transitions.

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

// Track route change performance
router.beforeEach((to, from, next) => {
  console.time(`Route change: ${from.path} → ${to.path}`)
  next()
})

router.afterEach((to, from) => {
  console.timeEnd(`Route change: ${from.path} → ${to.path}`)
})

app.mount('#app')
```

## Performance for Lazy-Loaded Routes

When using lazy-loaded routes, Vue Scan can help you identify loading time issues. Make sure to use chunk names for better debugging:

```js
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ './views/Dashboard.vue')
  },
  {
    path: '/profile',
    component: () => import(/* webpackChunkName: "profile" */ './views/Profile.vue')
  }
]
```

## Analyzing Route-level Performance

When analyzing performance with Vue Scan, pay special attention to:

1. **Initial Route Rendering**: The time taken for the initial route to render
2. **Route Transition Performance**: The time taken to switch between routes
3. **Component Render Frequency**: How many components re-render during navigation

## Prefetching Routes for Better Performance

You can combine Vue Scan insights with Vue Router's prefetching capabilities to optimize performance:

```js
// Use Vue Scan to identify slow-loading routes, then prefetch them
router.beforeResolve((to, from, next) => {
  // Prefetch related routes that might be visited next
  if (to.path === '/products') {
    // Prefetch product detail route that might be visited next
    import('./views/ProductDetail.vue')
  }
  next()
})
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Configuration Options](../guides/configuration.md)
- Check the [Performance Optimization](../advanced/performance-optimization.md) guide