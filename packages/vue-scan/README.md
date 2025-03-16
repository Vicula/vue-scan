# Vue Scan

A performance monitoring plugin for Vue.js applications. Vue Scan helps you identify performance bottlenecks by highlighting components when they rerender, tracking render time, memory usage, and other metrics.

<p align="center">
  <img src="https://placehold.co/600x400?text=Vue+Scan+Demo" alt="Vue Scan Demo" width="600" />
</p>

## Features

- 🔍 **Component Highlighting**: Visualize component rerenders in real-time
- ⏱️ **Performance Metrics**: Track render time, render frequency, mount time, and more
- 🧠 **Memory Monitoring**: Optional memory usage tracking for components
- 🛠️ **Vue DevTools Integration**: Custom panel in Vue DevTools for deeper insights
- 📊 **Interactive Overlay**: Floating UI to visualize performance metrics without DevTools
- 🚫 **Zero Configuration**: Works out of the box with sensible defaults
- 🪶 **Lightweight**: Minimal impact on your app's performance

## Installation

```bash
# npm
npm install vue-scan --save-dev

# yarn
yarn add vue-scan --dev

# pnpm
pnpm add vue-scan -D
```

## Basic Usage

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

## Configuration Options

Vue Scan works out of the box with no configuration, but you can customize it to suit your needs:

```js
app.use(createVueScan({
  // Enable or disable the plugin (defaults to true in development, false in production)
  enabled: true,
  
  // Enable or disable the visual overlay
  overlay: true,
  
  // Enable or disable DevTools integration
  devtools: true,
  
  // Ignore certain components by name
  ignore: ['RouterLink', 'RouterView'],
  
  // Track memory usage (may affect performance)
  trackMemory: true,
  
  // Track component mount time
  trackMountTime: true,
  
  // Track component render frequency
  trackRenderFrequency: true
}))
```

## Vue DevTools Integration

Vue Scan integrates with Vue DevTools to provide detailed performance metrics for your components. To use this feature:

1. Install [Vue DevTools](https://devtools.vuejs.org/guide/installation.html)
2. Open the Vue DevTools panel in your browser
3. Navigate to the "Vue Scan" tab

The DevTools integration provides:

- Component tree with render counts
- Detailed metrics for each component
- Highlight components in the page
- Automatically highlight slow components

## Features

### Component Highlighting

Components will be highlighted with different colors when they rerender:

- 🟢 **Green**: Fast renders (< 8ms)
- 🟡 **Yellow**: Acceptable renders (8-16ms)
- 🟠 **Orange**: Slow renders (16-33ms)
- 🔴 **Red**: Very slow renders (> 33ms)

### Performance Metrics

Vue Scan tracks the following metrics for each component:

- **Render Count**: How many times the component has rendered
- **Last Render Time**: Duration of the most recent render
- **Average Render Time**: Average render duration
- **Mount Time**: When the component was mounted
- **Memory Usage**: Memory consumption (if enabled)

## Browser Support

Vue Scan works in all modern browsers that support Vue.js.

## TypeScript Support

Vue Scan is built with TypeScript and provides full type definitions.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.