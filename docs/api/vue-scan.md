# Vue Scan API Reference

This document provides detailed information about the Vue Scan API.

## `createVueScan(options)`

The main entry point for Vue Scan. Creates a Vue plugin that can be installed in a Vue application.

### Parameters

- `options` (Object, optional): Configuration options for Vue Scan

### Returns

- A Vue plugin object with an `install` method

### Example

```js
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)
app.use(createVueScan({
  enabled: true,
  overlay: true,
  // ...other options
}))
```

## Configuration Options

### `enabled`

- Type: `Boolean`
- Default: `process.env.NODE_ENV !== 'production'` (true in development, false in production)

Controls whether Vue Scan is active. By default, it's enabled in development and disabled in production.

```js
app.use(createVueScan({
  enabled: true // Force enable even in production
}))
```

### `overlay`

- Type: `Boolean`
- Default: `true`

Controls whether the visual overlay UI is displayed.

```js
app.use(createVueScan({
  overlay: false // Disable the overlay UI
}))
```

### `devtools`

- Type: `Boolean`
- Default: `true`

Controls whether the Vue DevTools integration is enabled.

```js
app.use(createVueScan({
  devtools: false // Disable DevTools integration
}))
```

### `ignore`

- Type: `Array<string>`
- Default: `[]`

An array of component names to ignore when tracking performance.

```js
app.use(createVueScan({
  ignore: ['RouterLink', 'RouterView', 'Transition'] // Ignore these components
}))
```

### `trackMemory`

- Type: `Boolean`
- Default: `false`

Controls whether memory usage tracking is enabled. This feature can affect performance, so it's disabled by default.

```js
app.use(createVueScan({
  trackMemory: true // Enable memory usage tracking
}))
```

### `trackMountTime`

- Type: `Boolean`
- Default: `true`

Controls whether component mount time tracking is enabled.

```js
app.use(createVueScan({
  trackMountTime: false // Disable mount time tracking
}))
```

### `trackRenderFrequency`

- Type: `Boolean`
- Default: `true`

Controls whether component render frequency tracking is enabled.

```js
app.use(createVueScan({
  trackRenderFrequency: false // Disable render frequency tracking
}))
```

## Accessing Vue Scan in Components

Vue Scan's monitor instance is accessible within components through the global properties:

```js
// In a Vue component
export default {
  mounted() {
    // Access Vue Scan's monitor
    const monitor = this.$vueScan
    
    // Get metrics for a specific component
    const metrics = monitor.getComponentByName('MyComponent')
    
    // Log metrics
    console.log(metrics)
  }
}
```

Using the Composition API:

```js
import { getCurrentInstance } from 'vue'

export default {
  setup() {
    // Access Vue Scan's monitor in setup()
    const instance = getCurrentInstance()
    const vueScan = instance.appContext.config.globalProperties.$vueScan
    
    // Use Vue Scan functions
    // ...
  }
}
```

## Constants

### `version`

The current version of Vue Scan.

```js
import { version } from 'vue-scan'

console.log(`Using Vue Scan version ${version}`)
``` 