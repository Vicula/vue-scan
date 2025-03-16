<script setup>
import { ref, onMounted, computed, watch } from 'vue';

// Component state
const users = ref([]);
const posts = ref([]);
const isLoadingUsers = ref(false);
const isLoadingPosts = ref(false);
const error = ref(null);
const selectedUserId = ref(null);
const refreshInterval = ref(null);
const autoRefresh = ref(false);

// Computed values
const hasError = computed(() => {
  return error.value !== null;
});

const isLoading = computed(() => {
  return isLoadingUsers.value || isLoadingPosts.value;
});

const selectedUser = computed(() => {
  if (!selectedUserId.value) return null;
  return users.value.find((user) => user.id === selectedUserId.value);
});

const userPosts = computed(() => {
  if (!selectedUserId.value) return [];
  return posts.value.filter((post) => post.userId === selectedUserId.value);
});

// Methods for API calls
async function fetchUsers() {
  if (isLoadingUsers.value) return;

  isLoadingUsers.value = true;
  error.value = null;

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate API call
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('Failed to fetch users');

    const data = await response.json();
    users.value = data;
  } catch (err) {
    error.value = err.message || 'An error occurred while fetching users';
    console.error(error.value);
  } finally {
    isLoadingUsers.value = false;
  }
}

async function fetchUserPosts(userId) {
  if (isLoadingPosts.value) return;

  isLoadingPosts.value = true;
  error.value = null;

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate API call
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    );
    if (!response.ok) throw new Error('Failed to fetch posts');

    const data = await response.json();
    posts.value = data;
  } catch (err) {
    error.value = err.message || 'An error occurred while fetching posts';
    console.error(error.value);
  } finally {
    isLoadingPosts.value = false;
  }
}

function selectUser(userId) {
  selectedUserId.value = userId;
  fetchUserPosts(userId);
}

function clearError() {
  error.value = null;
}

function toggleAutoRefresh() {
  autoRefresh.value = !autoRefresh.value;

  if (autoRefresh.value && selectedUserId.value) {
    // Set up auto-refresh interval (every 5 seconds)
    refreshInterval.value = setInterval(() => {
      fetchUserPosts(selectedUserId.value);
    }, 5000);
  } else if (refreshInterval.value) {
    // Clear interval if auto-refresh disabled
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
}

// Watchers
watch(selectedUserId, (newVal) => {
  if (newVal) {
    fetchUserPosts(newVal);
  }
});

// Simulate problematic code path (memory leak)
watch(
  users,
  () => {
    const arr = [];
    // This builds up an array needlessly on each user change - potential memory issue
    for (let i = 0; i < 10000; i++) {
      arr.push({ id: i, value: `Value ${i}` });
    }
    console.log(`Created ${arr.length} items in memory`);
  },
  { deep: true },
);

// Lifecycle hooks
onMounted(() => {
  fetchUsers();

  // Clean up interval on component unmount
  return () => {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
    }
  };
});
</script>

<template>
  <div class="api-container">
    <h2>API Data Component</h2>
    
    <div class="api-controls">
      <button @click="fetchUsers" :disabled="isLoadingUsers" class="btn">
        {{ isLoadingUsers ? 'Loading Users...' : 'Reload Users' }}
      </button>
      
      <label class="auto-refresh">
        <input type="checkbox" v-model="autoRefresh" @change="toggleAutoRefresh" />
        Auto-refresh posts (every 5s)
      </label>
    </div>
    
    <div v-if="hasError" class="error-message">
      <p>{{ error }}</p>
      <button @click="clearError" class="btn btn-small">Dismiss</button>
    </div>
    
    <div class="content-grid">
      <div class="users-list">
        <h3>Users</h3>
        <div v-if="isLoadingUsers" class="loading-spinner">Loading...</div>
        
        <ul v-else>
          <li 
            v-for="user in users" 
            :key="user.id"
            :class="{ 'selected': selectedUserId === user.id }"
            @click="selectUser(user.id)"
          >
            {{ user.name }}
          </li>
          
          <li v-if="users.length === 0" class="empty-message">No users found</li>
        </ul>
      </div>
      
      <div class="user-details">
        <h3>User Details</h3>
        
        <div v-if="selectedUser" class="selected-user-info">
          <h4>{{ selectedUser.name }}</h4>
          <p><strong>Email:</strong> {{ selectedUser.email }}</p>
          <p><strong>Phone:</strong> {{ selectedUser.phone }}</p>
          <p><strong>Website:</strong> {{ selectedUser.website }}</p>
          
          <div class="user-posts">
            <h4>Posts</h4>
            <div v-if="isLoadingPosts" class="loading-spinner">Loading posts...</div>
            
            <ul v-else>
              <li v-for="post in userPosts" :key="post.id">
                <h5>{{ post.title }}</h5>
                <p>{{ post.body }}</p>
              </li>
              
              <li v-if="userPosts.length === 0" class="empty-message">
                No posts for this user
              </li>
            </ul>
          </div>
        </div>
        
        <div v-else class="no-selection">
          <p>Select a user to view details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.api-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h2, h3, h4, h5 {
  margin-top: 0;
}

.api-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.auto-refresh {
  display: flex;
  align-items: center;
  gap: 5px;
}

.error-message {
  background-color: #ffebee;
  border: 1px solid #f44336;
  color: #d32f2f;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.users-list, .user-details {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.users-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.users-list li {
  padding: 10px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.users-list li:last-child {
  border-bottom: none;
}

.users-list li:hover {
  background-color: #f5f5f5;
}

.users-list li.selected {
  background-color: #e3f2fd;
  font-weight: bold;
}

.user-posts ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-posts li {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.user-posts li:last-child {
  border-bottom: none;
}

.user-posts h5 {
  margin-bottom: 5px;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  color: #666;
}

.empty-message {
  text-align: center;
  color: #888;
  padding: 20px;
  font-style: italic;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  font-size: 14px;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-small {
  padding: 4px 8px;
  font-size: 12px;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
  font-style: italic;
}
</style> 