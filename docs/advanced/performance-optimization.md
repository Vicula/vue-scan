# Component Performance Optimization

This guide covers best practices for optimizing Vue components after identifying performance issues with Vue Scan.

## Identifying Performance Issues

Vue Scan helps identify potential performance issues in your components:

1. **High Render Count**: Components that render too frequently
2. **Slow Render Time**: Components that take too long to render
3. **Excessive Memory**: Components that consume too much memory

Once you've identified problematic components, you can apply various optimization techniques.

## Optimizing Component Rendering

### 1. Prevent Unnecessary Renders with `v-memo`

Use `v-memo` to memoize parts of a template and only update them when dependencies change:

```vue
<template>
  <div>
    <div v-memo="[item.id, item.name]">
      <!-- This section will only re-render when item.id or item.name changes -->
      <h2>{{ item.name }}</h2>
      <p>ID: {{ item.id }}</p>
    </div>
    
    <!-- This part will re-render normally -->
    <p>Last updated: {{ item.lastUpdated }}</p>
  </div>
</template>
```

### 2. Use `computed` Properties for Derived Data

Instead of calculating values in the template or on each render, use computed properties:

```vue
<script>
export default {
  props: ['items'],
  computed: {
    filteredItems() {
      return this.items.filter(item => item.active)
    },
    sortedItems() {
      return [...this.filteredItems].sort((a, b) => a.name.localeCompare(b.name))
    }
  }
}
</script>
```

### 3. Apply `v-once` for Static Content

If a part of your template never needs to update after the initial render, use `v-once`:

```vue
<template>
  <div>
    <header v-once>
      <!-- This will render only once and never update -->
      <h1>{{ staticTitle }}</h1>
      <logo-component />
    </header>
    
    <!-- Dynamic content -->
    <main>{{ dynamicContent }}</main>
  </div>
</template>
```

### 4. Optimize Large Lists with `v-virtual-scroll`

For large lists, consider using a virtual scrolling solution:

```vue
<template>
  <virtual-list
    :items="items"
    :item-height="50"
    class="list-container"
  >
    <template v-slot:item="{ item }">
      <item-component :item="item" />
    </template>
  </virtual-list>
</template>
```

## Preventing Re-renders

### 1. Use the Key Attribute Correctly

Ensure proper use of the `key` attribute to maintain component identity:

```vue
<template>
  <div>
    <!-- Good: Unique key based on item identity -->
    <component-item
      v-for="item in items"
      :key="item.id"
      :item="item"
    />
    
    <!-- Bad: Index as key -->
    <component-item
      v-for="(item, index) in items"
      :key="index"
      :item="item"
    />
  </div>
</template>
```

### 2. Use `shallowRef` for Large Objects

When using the Composition API with large reactive objects, consider using `shallowRef`:

```vue
<script setup>
import { shallowRef } from 'vue'

// Only the reference to largeObject is reactive, not its contents
const largeObject = shallowRef({ /* lots of data */ })

// Update the reference when needed
function updateObject(newData) {
  largeObject.value = { ...largeObject.value, ...newData }
}
</script>
```

### 3. Optimize Props with Object Destructuring

When passing many props to a component, use object destructuring:

```vue
<template>
  <user-profile v-bind="userProps" />
</template>

<script>
export default {
  computed: {
    userProps() {
      return {
        id: this.userId,
        name: this.userName,
        email: this.userEmail,
        // ...other props
      }
    }
  }
}
</script>
```

## Optimizing Component Loading

### 1. Use Async Components for Large Components

Load large components asynchronously:

```js
const ExpensiveComponent = defineAsyncComponent(() =>
  import('./ExpensiveComponent.vue')
)
```

### 2. Lazy Loading Routes

In Vue Router, lazy load routes to reduce initial bundle size:

```js
const routes = [
  {
    path: '/dashboard',
    component: () => import('./views/Dashboard.vue')
  }
]
```

## Memory Optimization

### 1. Proper Cleanup in `onUnmounted`

Ensure resources are properly cleaned up when components are unmounted:

```vue
<script setup>
import { onMounted, onUnmounted } from 'vue'

let intervalId

onMounted(() => {
  intervalId = setInterval(() => {
    // Do something periodically
  }, 1000)
})

onUnmounted(() => {
  // Clean up resources
  clearInterval(intervalId)
})
</script>
```

### 2. Debounce Event Handlers

Debounce frequent events like scrolling, resizing, or input:

```vue
<script setup>
import { ref } from 'vue'
import debounce from 'lodash/debounce'

const searchQuery = ref('')
const results = ref([])

// Debounced search function
const debouncedSearch = debounce((query) => {
  // Expensive search operation
  fetchResults(query).then(data => {
    results.value = data
  })
}, 300)

// Call the debounced function when input changes
function onInput(e) {
  searchQuery.value = e.target.value
  debouncedSearch(searchQuery.value)
}
</script>
```

## Monitoring Improvements with Vue Scan

After implementing optimizations, use Vue Scan to verify improvements:

1. Check if the render count has decreased
2. Verify that render times have improved
3. Monitor memory usage to ensure it doesn't grow unbounded

Use the metrics before and after optimization to quantify the improvements.

## Performance Budget

Consider establishing a performance budget for your components:

- Maximum render time: 5ms for critical components
- Maximum render frequency: No more than once per user interaction
- Memory leaks: Zero tolerance

Use Vue Scan to enforce these budgets during development and code reviews. 