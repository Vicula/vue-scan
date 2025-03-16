# Vue Scan

A powerful performance monitoring plugin for Vue.js applications. Vue Scan helps you identify performance bottlenecks by highlighting components when they rerender, tracking render time, memory usage, and other metrics.

## Features

- 🔍 **Component Highlighting**: Visualize component rerenders in real-time
- ⏱️ **Performance Metrics**: Track render time, render frequency, mount time, and more
- 🧠 **Memory Monitoring**: Optional memory usage tracking for components
- 🛠️ **Vue DevTools Integration**: Custom panel in Vue DevTools for deeper insights
- 📊 **Interactive Overlay**: Floating UI to visualize performance metrics without DevTools

## Packages

This monorepo contains the following packages:

- [vue-scan](./packages/vue-scan): Vue.js performance monitoring plugin
- [nuxt-scan](./packages/nuxt-scan): Nuxt.js integration for Vue Scan

## Getting Started

### Installation

```bash
# npm
npm install vue-scan --save-dev

# yarn
yarn add vue-scan --dev

# pnpm
pnpm add vue-scan -D
```

### Basic Usage

```js
// main.js or main.ts
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

// Add the Vue Scan plugin (automatically disabled in production)
app.use(createVueScan())

app.mount('#app')
```

### Nuxt.js Usage

```bash
# Install the Nuxt module
npm install nuxt-scan --save-dev
```

Then add the module to your `nuxt.config.js`:

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

## Development

This project uses [pnpm](https://pnpm.io/) for package management.

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Demo

Check out the playground demo:

```bash
# Start the demo
pnpm dev
```

This will start a development server with a Vue app that demonstrates Vue Scan's features.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT