# Quick Start

This guide will help you quickly get up and running with Vue Scan.

## Installation

```bash
# Install with npm
npm install vue-scan --save-dev

# OR with yarn
yarn add vue-scan --dev

# OR with pnpm
pnpm add vue-scan -D
```

## Basic Setup

Add Vue Scan to your application's main entry file:

```js
// main.js or main.ts
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan'
import App from './App.vue'

const app = createApp(App)

// Add Vue Scan with default options
app.use(createVueScan())

app.mount('#app')
```

That's it! Vue Scan is now ready to help you monitor your application's performance.

## Using Vue Scan

Once installed, Vue Scan will:

1. **Highlight components** when they render in the DOM
2. **Track performance metrics** for all your components
3. **Provide a floating overlay** for quick access to metrics
4. **Integrate with Vue DevTools** for deeper analysis

## Verify Installation

To verify that Vue Scan is working properly:

1. Open your application in a browser
2. Open your browser's console
3. You should see a message like `🔍 Vue Scan v0.0.1 initialized`
4. Interact with your application to trigger component renders
5. You should see components highlight briefly as they render

## Using the Overlay

The Vue Scan overlay provides a quick view of component performance metrics:

1. Look for the small icon in the corner of your application
2. Click it to expand the overlay panel
3. View the list of components and their render metrics
4. Click on a component to highlight it in the page

## Next Steps

- [Installation Guides](./installation/README.md) - Detailed installation instructions for different environments
- [Basic Usage](./guides/basic-usage.md) - Learn how to use Vue Scan effectively
- [Configuration Options](./guides/configuration.md) - Customize Vue Scan to your needs 