# Nuxt Scan API Reference

This document provides detailed information about the Nuxt Scan module API.

## Module Registration

Add the Nuxt Scan module to your Nuxt.js project's configuration file:

```js
// nuxt.config.js or nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
  // Module options
  vueScan: {
    // Options here
  }
})
```

## Configuration Options

All options from Vue Scan are available in the Nuxt module. These options can be specified in your `nuxt.config.js` or `nuxt.config.ts` file under the `vueScan` key.

### `enabled`

- Type: `Boolean`
- Default: `process.env.NODE_ENV !== 'production'` (true in development, false in production)

Controls whether Vue Scan is active. By default, it's enabled in development and disabled in production.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    enabled: true // Force enable even in production
  }
})
```

### `overlay`

- Type: `Boolean`
- Default: `true`

Controls whether the visual overlay UI is displayed.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    overlay: false // Disable the overlay UI
  }
})
```

### `devtools`

- Type: `Boolean`
- Default: `true`

Controls whether the Vue DevTools integration is enabled.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    devtools: false // Disable DevTools integration
  }
})
```

### `ignore`

- Type: `Array<string>`
- Default: `[]`

An array of component names to ignore when tracking performance.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    ignore: ['NuxtLink', 'NuxtPage', 'Transition'] // Ignore these components
  }
})
```

### `trackMemory`

- Type: `Boolean`
- Default: `false`

Controls whether memory usage tracking is enabled. This feature can affect performance, so it's disabled by default.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    trackMemory: true // Enable memory usage tracking
  }
})
```

### `trackMountTime`

- Type: `Boolean`
- Default: `true`

Controls whether component mount time tracking is enabled.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    trackMountTime: false // Disable mount time tracking
  }
})
```

### `trackRenderFrequency`

- Type: `Boolean`
- Default: `true`

Controls whether component render frequency tracking is enabled.

```js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    trackRenderFrequency: false // Disable render frequency tracking
  }
})
```

## Runtime Configuration

You can also configure Nuxt Scan using runtime config in your environment variables:

```
# .env
NUXT_PUBLIC_VUE_SCAN_ENABLED=true
NUXT_PUBLIC_VUE_SCAN_OVERLAY=false
NUXT_PUBLIC_VUE_SCAN_TRACK_MEMORY=true
```

## Accessing Vue Scan in Nuxt Components

You can access Vue Scan in your Nuxt components using the `useNuxtApp` composable:

```vue
<script setup>
// Access Vue Scan in a Nuxt component
const { $vueScan } = useNuxtApp()

// Get the configured options
console.log($vueScan.options)
</script>
```

## Nuxt-specific Features

### Server-side Rendering Compatibility

The Nuxt Scan module is designed to only run on the client side, ensuring compatibility with server-side rendering (SSR) and static site generation (SSG).

### Automatic Environment Detection

Nuxt Scan automatically detects the current environment and disables itself in production unless explicitly enabled. 