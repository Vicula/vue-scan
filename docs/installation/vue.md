# Installing Vue Scan in a Vue.js Application

This guide will help you install and set up Vue Scan in a standard Vue.js application.

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

// Add the Vue Scan plugin (automatically disabled in production)
app.use(createVueScan())

app.mount('#app')
```

## Configuration

You can customize Vue Scan by passing options to the `createVueScan` function:

```js
app.use(createVueScan({
  enabled: true, // Enable even in production
  overlay: true, // Show the performance overlay
  devtools: true, // Enable DevTools integration
  ignore: ['MyIgnoredComponent'], // Components to ignore
  trackMemory: false, // Disable memory tracking
  trackMountTime: true, // Track component mount times
  trackRenderFrequency: true // Track how often components render
}))
```

For more details on available options, see the [Configuration Options](../guides/configuration.md) guide.

## Development vs. Production

By default, Vue Scan is automatically disabled in production environments to prevent any performance overhead. If you need to enable it in production for specific reasons, set the `enabled` option to `true`.

```js
app.use(createVueScan({
  enabled: true // Force enable in all environments
}))
```

## Next Steps

- Learn about [Basic Usage](../guides/basic-usage.md) of Vue Scan
- Explore the [Overlay Interface](../guides/overlay.md)
- Check the [DevTools Integration](../guides/devtools.md)