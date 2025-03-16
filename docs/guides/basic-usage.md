# Basic Usage

This guide will help you get started with the basic features of Vue Scan.

## Installation and Setup

If you haven't installed Vue Scan yet, check out the [installation guide](../installation/README.md) first.

Basic setup example:

```js
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

// Add Vue Scan to your app
app.use(createVueScan())

app.mount('#app')
```

## Understanding Component Highlighting

Once Vue Scan is installed, you'll notice components being highlighted when they render. By default, a subtle overlay appears briefly over components when they update.

This visual feedback helps you:

- Identify which components are rendering when you interact with your app
- Spot unexpected or excessive re-renders
- Understand the rendering behavior of your application

## Using the Overlay Interface

Vue Scan provides a floating overlay UI that displays real-time performance metrics:

1. **Accessing the Overlay**: Look for a small icon in the corner of your application (usually bottom right)
2. **Expanding the Overlay**: Click the icon to expand the full metrics view
3. **Component List**: See a list of components and their performance metrics
4. **Sorting**: Click column headers to sort by different metrics
5. **Component Filtering**: Use the search box to filter components by name
6. **Highlighting**: Click on a component in the list to highlight it in the page

## Monitoring Performance Metrics

Vue Scan tracks several key metrics for each component:

- **Render Count**: How many times a component has rendered
- **Last Render Time**: The time taken (in ms) for the most recent render
- **Average Render Time**: The average time across all renders
- **Mount Time**: When the component was first mounted
- **Memory Usage**: Memory consumption (if enabled)

Use these metrics to identify:

- Components that render too frequently
- Components with slow render times
- Components that consume excessive memory

## DevTools Integration

If you have Vue DevTools installed, Vue Scan adds a custom panel:

1. Open Vue DevTools in your browser
2. Look for the "Vue Scan" tab
3. Access more detailed performance insights
4. Use the component inspector to examine specific components

## Example Workflow

Here's a typical workflow for optimizing a Vue application with Vue Scan:

1. **Run your application** with Vue Scan installed
2. **Interact with your application** naturally to trigger component renders
3. **Open the overlay** to view component metrics
4. **Identify problematic components** (those with high render counts or slow render times)
5. **Optimize those components** using Vue's performance best practices (like memoization, `v-once`, or better prop handling)
6. **Re-test** to verify your optimizations improved performance

## Example: Identifying a Performance Issue

Let's say you notice a component called `UserProfile` is rendering 50 times when you only interact with it once. This could indicate:

1. The component is receiving new props unnecessarily
2. The component depends on a reactive value that changes frequently
3. A parent component is re-rendering and forcing this component to re-render

By investigating and fixing the root cause, you can significantly improve your application's performance.

## Next Steps

- Learn about [Configuration Options](./configuration.md) to customize Vue Scan
- Explore the [Overlay Interface](./overlay.md) in detail
- Understand [Performance Metrics](./metrics.md) and what they mean
- Check out [DevTools Integration](./devtools.md) for more advanced features 