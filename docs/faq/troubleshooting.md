# Troubleshooting Vue Scan

This guide helps you diagnose and solve common problems with Vue Scan.

## Vue Scan Isn't Showing Any UI

If you've installed Vue Scan but don't see the overlay or any visual indication that it's working:

### Check Console for Initialization Message

First, check your browser's console for the initialization message:

```
🔍 Vue Scan v0.0.1 initialized
```

If you don't see this message, Vue Scan might not be properly installed.

### Verify Installation

Make sure Vue Scan is correctly installed in your application:

```js
// main.js or main.ts
import { createApp } from 'vue'
import { createVueScan } from 'vue-scan' // Make sure this import works
import App from './App.vue'

const app = createApp(App)
app.use(createVueScan()) // Make sure this line is present
app.mount('#app')
```

### Check Environment

Vue Scan is disabled in production by default. If you're testing in a production environment, explicitly enable it:

```js
app.use(createVueScan({
  enabled: true // Force enable even in production
}))
```

### Check Overlay Setting

Make sure the overlay option is enabled:

```js
app.use(createVueScan({
  overlay: true
}))
```

## Component Highlighting Not Working

If components aren't being highlighted when they render:

### CSS Conflicts

Check if there are CSS rules in your application that might be interfering with Vue Scan's overlays. Vue Scan uses absolute positioning and z-index to create overlays.

### DOM Structure Issues

Some complex DOM structures or CSS layouts might interfere with highlight positioning. Try with a simpler component to verify if the issue is related to a specific component's structure.

## DevTools Integration Not Working

If the Vue DevTools integration isn't working:

### Check DevTools Version

Make sure you're using a recent version of Vue DevTools that supports custom plugins.

### Verify DevTools Setting

Ensure that the DevTools integration is enabled:

```js
app.use(createVueScan({
  devtools: true
}))
```

### Check DevTools Connection

Verify that Vue DevTools are properly connected to your application. You should see the standard Vue DevTools panels working.

## Memory Tracking Issues

If memory tracking isn't working:

### Enable Memory Tracking

Memory tracking is disabled by default. Make sure to enable it:

```js
app.use(createVueScan({
  trackMemory: true
}))
```

### Browser Support

Memory tracking depends on browser features that might not be available in all browsers. Chrome typically provides the best support for memory profiling.

## Performance Issues

If using Vue Scan itself causes performance issues:

### Disable in Production

Make sure Vue Scan is disabled in production:

```js
app.use(createVueScan({
  enabled: process.env.NODE_ENV !== 'production'
}))
```

### Disable Memory Tracking

Memory tracking can impact performance. Disable it if not needed:

```js
app.use(createVueScan({
  trackMemory: false
}))
```

### Ignore Noisy Components

Ignore components that render frequently:

```js
app.use(createVueScan({
  ignore: ['RouterLink', 'RouterView', 'Transition']
}))
```

## SSR and Nuxt-specific Issues

### Vue Scan Not Working with SSR

Vue Scan is designed to run only on the client-side in SSR contexts. Make sure you're checking for client-side rendering before looking for Vue Scan.

In Nuxt.js, the plugin is automatically client-side only. If you have issues, check your Nuxt configuration:

```js
// nuxt.config.js
export default defineNuxtConfig({
  modules: ['nuxt-scan'],
  vueScan: {
    // Make sure options are properly set
    enabled: true
  }
})
```

## Reporting Issues

If you encounter issues not covered here:

1. Check the [Common Issues](./common-issues.md) page
2. Search for your issue in the [GitHub repository](https://github.com/Vicula/vue-scan/issues)
3. If your issue isn't already reported, open a new issue with:
   - Vue Scan version
   - Vue version
   - Browser version
   - Clear steps to reproduce
   - Error messages from the console 