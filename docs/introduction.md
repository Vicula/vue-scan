# Introduction to Vue Scan

Vue Scan is a powerful performance monitoring plugin for Vue.js applications that helps you identify performance bottlenecks by highlighting components when they rerender, tracking render time, memory usage, and other metrics.

## Why Vue Scan?

Performance optimization is a crucial aspect of building high-quality Vue applications. However, identifying performance issues can be challenging without proper tooling. Vue Scan addresses this need by providing:

- **Visual Feedback**: See which components are rendering and how frequently
- **Performance Metrics**: Track render times, mount times, and memory usage
- **Targeted Optimization**: Focus your optimization efforts on the components that need it most

## Key Features

### 🔍 Component Highlighting

Vue Scan makes component rerenders visible by highlighting elements in the DOM when they update. This visual feedback makes it easy to spot unnecessary renders and identify optimization opportunities.

### ⏱️ Performance Metrics

Track detailed performance metrics for each component:
- Render frequency
- Render times (average, last, total)
- Mount and unmount times
- Memory usage (optional)

### 🛠️ Vue DevTools Integration

Vue Scan integrates with Vue DevTools to provide a custom panel with detailed performance insights. This allows you to examine component metrics while using the familiar Vue DevTools interface.

### 📊 Interactive Overlay

The floating overlay UI displays real-time performance data without requiring DevTools to be open. It's perfect for quick performance checks during development.

## When to Use Vue Scan

Vue Scan is most useful in the following scenarios:

- **Development Phase**: Catch performance issues early in the development process
- **Optimization Work**: Identify which components to prioritize for optimization
- **Performance Debugging**: Diagnose unexpected or excessive component rerenders
- **Before Releases**: Verify performance improvements before shipping code

## Getting Started

To start using Vue Scan, follow these steps:

1. [Install Vue Scan](./installation/README.md) using your package manager
2. [Set up the plugin](./installation/vue.md) in your Vue application
3. Explore the [basic usage](./guides/basic-usage.md) guide

## Browser Compatibility

Vue Scan is compatible with all modern browsers that support Vue.js 3.x:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Important Considerations

Vue Scan is designed primarily as a development tool and automatically disables itself in production environments (unless explicitly enabled). This ensures it doesn't impact the performance of your production application. 