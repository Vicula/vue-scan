# Configuration Options

This guide explains all available configuration options for Vue Scan.

## Basic Configuration

When initializing Vue Scan, you can pass a configuration object to customize its behavior:

```js
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

app.use(createVueScan({
  enabled: true,
  overlay: true,
  devtools: true,
  ignore: ['RouterLink', 'RouterView'],
  trackMemory: false,
  trackMountTime: true,
  trackRenderFrequency: true
}))
```

## Available Options

### `enabled`

- Type: `Boolean`
- Default: `process.env.NODE_ENV !== 'production'` (true in development, false in production)

Controls whether Vue Scan is active. By default, Vue Scan automatically enables itself in development and disables itself in production to avoid any performance overhead in production environments.

```js
// Force enable in all environments
app.use(createVueScan({
  enabled: true
}))

// Manually disable
app.use(createVueScan({
  enabled: false
}))

// Conditionally enable
app.use(createVueScan({
  enabled: localStorage.getItem('enableVueScan') === 'true'
}))
```

### `overlay`

- Type: `Boolean`
- Default: `true`

Controls whether the visual overlay UI is displayed. The overlay provides a floating panel with real-time component metrics.

```js
// Disable the overlay
app.use(createVueScan({
  overlay: false
}))
```

### `devtools`

- Type: `Boolean`
- Default: `true`

Controls whether the Vue DevTools integration is enabled. When enabled, Vue Scan adds a custom panel to Vue DevTools with detailed performance metrics.

```js
// Disable DevTools integration
app.use(createVueScan({
  devtools: false
}))
```

### `ignore`

- Type: `Array<string>`
- Default: `[]`

An array of component names to ignore when tracking performance. This is useful for excluding components that you know render frequently by design (like transition components or router views).

```js
// Ignore specific components
app.use(createVueScan({
  ignore: [
    'RouterLink', 
    'RouterView', 
    'Transition',
    'TransitionGroup',
    'KeepAlive'
  ]
}))
```

### `trackMemory`

- Type: `Boolean`
- Default: `false`

Controls whether memory usage tracking is enabled. This feature can affect performance, so it's disabled by default. When enabled, Vue Scan will attempt to measure memory usage for components.

```js
// Enable memory tracking
app.use(createVueScan({
  trackMemory: true
}))
```

### `trackMountTime`

- Type: `Boolean`
- Default: `true`

Controls whether component mount time tracking is enabled. This tracks when components are mounted and unmounted.

```js
// Disable mount time tracking
app.use(createVueScan({
  trackMountTime: false
}))
```

### `trackRenderFrequency`

- Type: `Boolean`
- Default: `true`

Controls whether component render frequency tracking is enabled. This tracks how often components render.

```js
// Disable render frequency tracking
app.use(createVueScan({
  trackRenderFrequency: false
}))
```

## Configuration in Different Environments

### Vite

In a Vite application, you can leverage environment variables to configure Vue Scan:

```js
// main.js
app.use(createVueScan({
  enabled: import.meta.env.DEV || import.meta.env.VITE_ENABLE_VUE_SCAN === 'true',
  trackMemory: import.meta.env.VITE_VUE_SCAN_TRACK_MEMORY === 'true'
}))
```

### Nuxt.js

In a Nuxt.js application, configure Vue Scan in the `nuxt.config.js` file:

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    enabled: process.env.NODE_ENV === 'development',
    ignore: ['NuxtLink', 'NuxtPage']
  }
})
```

## Runtime Configuration

You can also change Vue Scan's configuration at runtime if you have access to the plugin instance:

```js
// In a Vue component
export default {
  mounted() {
    // Disable the overlay
    this.$vueScan.options.overlay = false
    
    // Add a component to ignore
    this.$vueScan.options.ignore.push('MyComponent')
  }
}
```

## Configuration Best Practices

1. **Development vs. Production**: Keep Vue Scan disabled in production by default
2. **Memory Tracking**: Only enable `trackMemory` when specifically debugging memory issues
3. **Component Ignoring**: Ignore router components and transition components to reduce noise
4. **Conditional Enabling**: Consider adding a toggle to enable/disable Vue Scan in development 