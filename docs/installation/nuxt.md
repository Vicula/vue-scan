# Installing Vue Scan in a Nuxt.js Application

This guide will help you install and set up Vue Scan in a Nuxt.js application.

## Installation

Install the Nuxt module for Vue Scan using your preferred package manager:

```bash
# npm
npm install nuxt-scan --save-dev

# yarn
yarn add nuxt-scan --dev

# pnpm
pnpm add nuxt-scan -D
```

## Module Registration

Add the module to your `nuxt.config.js` or `nuxt.config.ts` file:

```js
// nuxt.config.js or nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
})
```

## Configuration

You can configure Vue Scan by adding a `vueScan` section to your Nuxt configuration:

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
  vueScan: {
    enabled: true, // Enable even in production
    overlay: true, // Show the performance overlay
    devtools: true, // Enable DevTools integration
    ignore: ['MyIgnoredComponent'], // Components to ignore
    trackMemory: false, // Disable memory tracking
    trackMountTime: true, // Track component mount times
    trackRenderFrequency: true // Track how often components render
  }
})
```

## Runtime Configuration

You can also use runtime configuration by setting values in your `.env` file:

```
NUXT_PUBLIC_VUE_SCAN_ENABLED=true
NUXT_PUBLIC_VUE_SCAN_OVERLAY=true
```

## Development vs. Production

By default, Vue Scan is automatically disabled in production environments to prevent any performance overhead. If you need to enable it in production for specific reasons, set the `enabled` option to `true`.

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
  vueScan: {
    enabled: true // Force enable in all environments
  }
})
```

## Accessing Vue Scan in Components

In Nuxt components, you can access Vue Scan's functionality through the provided composable:

```vue
<script setup>
const { $vueScan } = useNuxtApp()

// Access Vue Scan options
console.log($vueScan.options)
</script>
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Overlay Interface](../guides/overlay.md)
- Check the [DevTools Integration](../guides/devtools.md)