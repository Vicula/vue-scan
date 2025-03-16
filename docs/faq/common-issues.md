# Common Issues

This page lists common issues and questions about Vue Scan, along with their solutions.

## General Questions

### Q: Is Vue Scan Production-Ready?

**A:** Vue Scan is primarily a development tool and is automatically disabled in production environments by default. While you can use it in production by explicitly enabling it, be aware that it adds some overhead to your application. For most use cases, it's recommended to use it only during development.

### Q: Does Vue Scan Work with Vue 2?

**A:** Vue Scan is designed for Vue 3 applications. For Vue 2 applications, consider using other performance monitoring tools like the Vue 2 performance devtools plugin.

### Q: Can I Use Vue Scan with Other Vue Plugins?

**A:** Yes, Vue Scan should work alongside other Vue plugins. If you encounter conflicts, try changing the order of plugin registration. Vue Scan should generally be registered after router and state management plugins.

## Installation Issues

### Q: I'm Getting "Cannot find module 'vue-scan'" Error

**A:** This usually means Vue Scan isn't properly installed. Try:

1. Checking if the package is listed in your `package.json` file
2. Running `npm install vue-scan --save-dev` (or equivalent for your package manager)
3. Checking for typos in the import statement
4. Verifying you're using the correct export from the package (`createVueScan`)

### Q: Vue Scan Not Working with Bundle Optimization

**A:** Some build optimizations might affect Vue Scan's functionality. If you're using tree-shaking or certain minification strategies, ensure that Vue Scan is not being incorrectly optimized away.

For Webpack or Rollup, you might need to add Vue Scan to the list of modules that shouldn't be aggressively optimized.

## UI and Visualization Issues

### Q: Component Highlighting Is Inconsistent

**A:** Component highlighting might be inconsistent due to:

1. Components rendering too quickly to notice the highlight
2. CSS conflicts affecting the highlight overlay
3. Complex nested component structures

Try using the overlay UI instead, which provides a persistent view of component rendering metrics.

### Q: Overlay UI Is Not Displaying Correctly

**A:** If the overlay UI is rendering incorrectly:

1. Check if there are CSS conflicts (especially with z-index, position, or overflow properties)
2. Verify the overlay isn't being clipped by a container with `overflow: hidden`
3. Try adjusting your application's CSS to accommodate the overlay

## Metrics Issues

### Q: Some Components Don't Show Up in Metrics

**A:** Components might not appear in metrics for several reasons:

1. They haven't rendered yet
2. They're in the `ignore` list
3. They're not standard Vue components (e.g., built-in components like `<KeepAlive>`)

Check your configuration and ensure the components have had a chance to render at least once.

### Q: Render Times Seem Inaccurate

**A:** Render time measurements are approximations and might be affected by:

1. Browser performance variations
2. Background processes
3. Development mode Vue overhead

For more accurate performance testing, use Vue Scan in conjunction with browser performance tools and consider running tests in an environment that minimizes external factors.

## DevTools Integration Issues

### Q: Vue Scan Tab Not Appearing in DevTools

**A:** If the Vue Scan tab isn't appearing in DevTools:

1. Make sure you have the latest version of Vue DevTools installed
2. Verify the `devtools` option is enabled in Vue Scan
3. Check the browser console for any Vue DevTools connection errors
4. Try reloading both your application and the DevTools panel

### Q: DevTools Display Different Data Than Overlay

**A:** Some minor differences between the DevTools display and the overlay are normal due to how and when data is synchronized. If the differences are significant, it might indicate a bug.

## Nuxt-specific Issues

### Q: Vue Scan Not Working With Nuxt Server-Side Rendering

**A:** Vue Scan only works on the client side because it measures runtime rendering performance. Make sure you're looking for Vue Scan output after client-side hydration has completed.

### Q: Nuxt Module Not Being Detected

**A:** If Nuxt isn't detecting the Vue Scan module:

1. Verify the module is properly installed: `npm install nuxt-scan --save-dev`
2. Check that it's correctly listed in the `modules` array in `nuxt.config.js`
3. Make sure there are no typos in the module name
4. Try clearing Nuxt's cache and rebuilding

## Performance Issues

### Q: Vue Scan Is Slowing Down My Application

**A:** If Vue Scan is causing noticeable performance degradation:

1. Disable memory tracking (`trackMemory: false`)
2. Ignore frequently rendering components
3. Use Vue Scan selectively during development, not continuously

### Q: High CPU Usage When Using Vue Scan

**A:** High CPU usage might be caused by:

1. Too many components rendering too frequently
2. Memory tracking enabled on a large application
3. Browser performance tools running simultaneously

Try limiting the scope of what Vue Scan is monitoring and disable memory tracking if it's not needed.

## If You Need More Help

If your issue isn't covered here:

1. Check the [Troubleshooting](./troubleshooting.md) page for more detailed debugging steps
2. Look at the [API Reference](../api/vue-scan.md) to ensure you're using Vue Scan correctly
3. Search for or open an issue on the [GitHub repository](https://github.com/Vicula/vue-scan/issues) 