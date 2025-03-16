# Nuxt Scan

A Nuxt.js module for Vue Scan performance monitoring.

<p align="center">
  <img src="https://placehold.co/600x400?text=Nuxt+Scan+Demo" alt="Nuxt Scan Demo" width="600" />
</p>

## Features

All the features of [Vue Scan](../vue-scan/README.md) plus:
- 🔄 **Auto-registration**: Automatically registers Vue Scan with your Nuxt.js application
- ⚙️ **Module Configuration**: Configure Vue Scan through your nuxt.config.js
- 🌐 **SSR Compatible**: Works with server-side rendering

## Installation

```bash
# npm
npm install nuxt-scan --save-dev

# yarn
yarn add nuxt-scan --dev

# pnpm
pnpm add nuxt-scan -D
```

## Setup

Add `nuxt-scan` to the `modules` section of your `nuxt.config.js`:

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
  vueScan: {
    // options
  }
})
```

## Configuration

All Vue Scan options are supported:

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-scan'
  ],
  vueScan: {
    // Enable or disable the plugin (defaults to true in development, false in production)
    enabled: true,
    
    // Enable or disable the visual overlay
    overlay: true,
    
    // Enable or disable DevTools integration
    devtools: true,
    
    // Ignore certain components by name
    ignore: ['NuxtLink', 'ClientOnly'],
    
    // Track memory usage (may affect performance)
    trackMemory: true,
    
    // Track component mount time
    trackMountTime: true,
    
    // Track component render frequency
    trackRenderFrequency: true
  }
})
```

## Development

```bash
# Install dependencies
pnpm install

# Generate type stubs
pnpm dev:prepare

# Develop with the playground
pnpm dev

# Build the module
pnpm build
```

## License

MIT