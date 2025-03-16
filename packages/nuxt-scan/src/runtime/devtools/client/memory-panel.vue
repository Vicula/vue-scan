<template>
  <div>
    <div class="flex items-center space-x-2 mb-4">
      <NButton v-if="!isTracking" type="primary" @click="startTracking">Start Tracking</NButton>
      <NButton v-else type="warning" @click="stopTracking">Stop Tracking</NButton>
      <NButton @click="refreshStats">Refresh</NButton>
      <NButton type="danger" @click="clearStats">Clear Stats</NButton>
    </div>

    <!-- Memory Stats Summary -->
    <NSectionBlock title="Memory Usage Summary" class="mb-4">
      <div class="grid grid-cols-3 gap-4">
        <NDashboardCard title="Components Tracked" :value="componentCount" />
        <NDashboardCard title="Component Instances" :value="instanceCount" />
        <NDashboardCard title="Total Memory Usage" :value="formatByteSize(totalMemory)" />
      </div>
    </NSectionBlock>

    <!-- Memory Stats Table -->
    <NSectionBlock v-if="componentsStats.length > 0" title="Component Memory Usage">
      <NDataTable :columns="columns" :rows="componentsStats" />
    </NSectionBlock>

    <NCard v-else class="text-center py-8">
      <div class="text-xl mb-2">No memory data collected yet.</div>
      <div class="text-gray-500">Start tracking or generate component activity to collect data.</div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client';
import type { NuxtDevtoolsIframeClient } from '@nuxt/devtools-kit/iframe-client';

// State
const stats = ref<Record<string, any>>({});
const isTracking = ref(false);
const client = ref<NuxtDevtoolsIframeClient | null>(null);
let refreshInterval: NodeJS.Timer | null = null;

// Set up devtools client
const devtoolsClient = useDevtoolsClient();

// Watch for client connection
function setupClient() {
  if (devtoolsClient.value) {
    client.value = devtoolsClient.value;
    // Check if tracking is active and get initial stats
    checkTrackingStatus();
    refreshStats();
  }
}

// Watch for client changes
watch(
  devtoolsClient,
  () => {
    setupClient();
  },
  { immediate: true },
);

// When component is mounted, try to set up the client
onMounted(() => {
  setupClient();
});

// Computed properties
const componentCount = computed(() => Object.keys(stats.value).length);
const instanceCount = computed(() => {
  return Object.values(stats.value).reduce(
    (sum, stat: any) => sum + stat.instanceCount,
    0,
  );
});
const totalMemory = computed(() => {
  return Object.values(stats.value).reduce(
    (sum, stat: any) => sum + stat.lastHeapUsed,
    0,
  );
});

// Format bytes to MB
function formatByteSize(bytes: number) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// Get color class based on memory usage
function getColorByMemoryUsage(bytes: number) {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return 'success';
  if (mb < 5) return 'warning';
  if (mb < 20) return 'orange';
  return 'danger';
}

// Table data
const componentsStats = computed(() => {
  return Object.entries(stats.value).map(([name, stat]) => ({
    name,
    instanceCount: stat.instanceCount,
    currentUsage: {
      value: stat.lastHeapUsed,
      display: formatByteSize(stat.lastHeapUsed),
      type: getColorByMemoryUsage(stat.lastHeapUsed),
    },
    averageUsage: {
      value: stat.averageHeapUsed,
      display: formatByteSize(stat.averageHeapUsed),
      type: getColorByMemoryUsage(stat.averageHeapUsed),
    },
    maxUsage: {
      value: stat.maxHeapUsed,
      display: formatByteSize(stat.maxHeapUsed),
      type: getColorByMemoryUsage(stat.maxHeapUsed),
    },
  }));
});

// Data table columns
const columns = [
  { key: 'name', title: 'Component' },
  { key: 'instanceCount', title: 'Instances' },
  {
    key: 'currentUsage',
    title: 'Current Usage',
    type: 'status',
  },
  {
    key: 'averageUsage',
    title: 'Average Usage',
    type: 'status',
  },
  {
    key: 'maxUsage',
    title: 'Max Usage',
    type: 'status',
  },
];

// Actions
async function startTracking() {
  if (!client.value) return;

  await client.value.devtools.rpc.nuxtScanMemory.startMemoryTracking();
  isTracking.value = true;

  // Setup refresh interval
  refreshInterval = setInterval(refreshStats, 2000);
}

async function stopTracking() {
  if (!client.value) return;

  await client.value.devtools.rpc.nuxtScanMemory.stopMemoryTracking();
  isTracking.value = false;

  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

async function refreshStats() {
  if (!client.value) return;

  try {
    stats.value =
      await client.value.devtools.rpc.nuxtScanMemory.getMemoryStats();
  } catch (error) {
    console.error('Failed to fetch memory stats:', error);
  }
}

async function clearStats() {
  if (!client.value) return;

  await client.value.devtools.rpc.nuxtScanMemory.clearMemoryStats();
  stats.value = {};
}

async function checkTrackingStatus() {
  if (!client.value) return;

  try {
    isTracking.value =
      await client.value.devtools.rpc.nuxtScanMemory.isMemoryTracking();

    // Setup refresh interval if tracking is active
    if (isTracking.value && !refreshInterval) {
      refreshInterval = setInterval(refreshStats, 2000);
    }
  } catch (error) {
    console.error('Failed to check tracking status:', error);
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});
</script>

<style scoped>
.memory-panel {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 20px;
  background-color: var(--background-color, #f9f9f9);
  color: var(--text-color, #333);
}

.controls {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

button {
  padding: 8px 12px;
  background-color: #0088cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.primary {
  background-color: var(--primary-color, #00dc82);
}

button.warning {
  background-color: var(--warning-color, #f1a71e);
}

button.danger {
  background-color: var(--error-color, #ff4d4d);
}

.card-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  background-color: var(--card-background, white);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-label {
  font-size: 14px;
  color: var(--text-secondary, #666);
}

.section-block {
  margin-bottom: 24px;
  background-color: var(--card-background, white);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid var(--border-color, #eee);
}

th {
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary, #666);
}

.green { color: var(--success-color, #00c853); }
.yellow { color: var(--warning-color, #f1a71e); }
.orange { color: var(--warning-dark-color, #ff8800); }
.red { color: var(--error-color, #ff4d4d); }
</style> 