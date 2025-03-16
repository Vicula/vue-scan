import { defineEventHandler } from 'h3';
import { getMemoryStats } from '../../memory-profiler.js';

export default defineEventHandler(() => {
  const stats = getMemoryStats();

  // Create a basic HTML page for the memory panel
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Memory Profiler</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      padding: 20px;
      background-color: var(--background-color, #f9f9f9);
      color: var(--text-color, #333);
    }
    .panel {
      max-width: 100%;
      margin: 0 auto;
    }
    .controls {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }
    button {
      padding: 8px 12px;
      background-color: var(--primary-color, #00dc82);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
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
    .section {
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
</head>
<body>
  <div class="panel">
    <div class="controls">
      <button id="startBtn">Start Tracking</button>
      <button id="stopBtn" class="warning" style="display: none;">Stop Tracking</button>
      <button id="refreshBtn">Refresh</button>
      <button id="clearBtn" class="danger">Clear Stats</button>
    </div>
    
    <div class="section">
      <h2 class="section-title">Summary</h2>
      <div class="card-container">
        <div class="card">
          <div class="card-value" id="component-count">0</div>
          <div class="card-label">Components Tracked</div>
        </div>
        <div class="card">
          <div class="card-value" id="instance-count">0</div>
          <div class="card-label">Component Instances</div>
        </div>
        <div class="card">
          <div class="card-value" id="total-memory">0 MB</div>
          <div class="card-label">Total Memory Usage</div>
        </div>
      </div>
    </div>
    
    <div class="section" id="component-section">
      <h2 class="section-title">Component Memory Usage</h2>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Instances</th>
            <th>Current Usage</th>
            <th>Average Usage</th>
            <th>Max Usage</th>
          </tr>
        </thead>
        <tbody id="stats-body">
          <!-- Data will be populated here -->
        </tbody>
      </table>
    </div>
    
    <div class="no-data" id="no-data">
      <div style="font-size: 18px; margin-bottom: 8px;">No memory data collected yet.</div>
      <div>Start tracking or generate component activity to collect data.</div>
    </div>
  </div>
  
  <script>
    // Initialize state
    let isTracking = false;
    let refreshInterval = null;
    let stats = ${JSON.stringify(stats)};
    
    // DOM Elements
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const clearBtn = document.getElementById('clearBtn');
    const componentCount = document.getElementById('component-count');
    const instanceCount = document.getElementById('instance-count');
    const totalMemory = document.getElementById('total-memory');
    const statsBody = document.getElementById('stats-body');
    const componentSection = document.getElementById('component-section');
    const noDataMsg = document.getElementById('no-data');
    
    // Utility functions
    function formatByteSize(bytes) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    
    function getColorClass(bytes) {
      const mb = bytes / (1024 * 1024);
      if (mb < 1) return 'green';
      if (mb < 5) return 'yellow';
      if (mb < 20) return 'orange';
      return 'red';
    }
    
    // API calls
    async function fetchStats() {
      try {
        const response = await fetch('/__nuxt-scan/api/memory-stats');
        stats = await response.json();
        updateUI();
      } catch (error) {
        console.error('Error fetching memory stats:', error);
      }
    }
    
    async function startTracking() {
      try {
        await fetch('/__nuxt-scan/api/memory-start', { method: 'POST' });
        isTracking = true;
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-block';
        
        // Setup refresh interval
        refreshInterval = setInterval(fetchStats, 2000);
      } catch (error) {
        console.error('Error starting memory tracking:', error);
      }
    }
    
    async function stopTracking() {
      try {
        await fetch('/__nuxt-scan/api/memory-stop', { method: 'POST' });
        isTracking = false;
        startBtn.style.display = 'inline-block';
        stopBtn.style.display = 'none';
        
        // Clear refresh interval
        if (refreshInterval) {
          clearInterval(refreshInterval);
          refreshInterval = null;
        }
      } catch (error) {
        console.error('Error stopping memory tracking:', error);
      }
    }
    
    async function clearStats() {
      try {
        await fetch('/__nuxt-scan/api/memory-clear', { method: 'POST' });
        stats = {};
        updateUI();
      } catch (error) {
        console.error('Error clearing memory stats:', error);
      }
    }
    
    // UI update
    function updateUI() {
      const statEntries = Object.entries(stats);
      
      // Update summary
      componentCount.textContent = statEntries.length;
      
      let totalInstances = 0;
      let totalHeapUsed = 0;
      
      statEntries.forEach(([_, stat]) => {
        totalInstances += stat.instanceCount;
        totalHeapUsed += stat.lastHeapUsed;
      });
      
      instanceCount.textContent = totalInstances;
      totalMemory.textContent = formatByteSize(totalHeapUsed);
      
      // Update table
      statsBody.innerHTML = '';
      
      if (statEntries.length > 0) {
        componentSection.style.display = 'block';
        noDataMsg.style.display = 'none';
        
        statEntries.forEach(([name, stat]) => {
          const row = document.createElement('tr');
          
          const nameCell = document.createElement('td');
          nameCell.textContent = name;
          
          const instancesCell = document.createElement('td');
          instancesCell.textContent = stat.instanceCount;
          
          const currentCell = document.createElement('td');
          currentCell.textContent = formatByteSize(stat.lastHeapUsed);
          currentCell.className = getColorClass(stat.lastHeapUsed);
          
          const avgCell = document.createElement('td');
          avgCell.textContent = formatByteSize(stat.averageHeapUsed);
          avgCell.className = getColorClass(stat.averageHeapUsed);
          
          const maxCell = document.createElement('td');
          maxCell.textContent = formatByteSize(stat.maxHeapUsed);
          maxCell.className = getColorClass(stat.maxHeapUsed);
          
          row.appendChild(nameCell);
          row.appendChild(instancesCell);
          row.appendChild(currentCell);
          row.appendChild(avgCell);
          row.appendChild(maxCell);
          
          statsBody.appendChild(row);
        });
      } else {
        componentSection.style.display = 'none';
        noDataMsg.style.display = 'block';
      }
    }
    
    // Event listeners
    startBtn.addEventListener('click', startTracking);
    stopBtn.addEventListener('click', stopTracking);
    refreshBtn.addEventListener('click', fetchStats);
    clearBtn.addEventListener('click', clearStats);
    
    // Initial UI update
    updateUI();
    
    // Check if tracking is already active
    fetch('/__nuxt-scan/api/memory-status')
      .then(response => response.json())
      .then(data => {
        if (data.isTracking) {
          isTracking = true;
          startBtn.style.display = 'none';
          stopBtn.style.display = 'inline-block';
          refreshInterval = setInterval(fetchStats, 2000);
        }
      })
      .catch(error => {
        console.error('Error checking tracking status:', error);
      });
  </script>
</body>
</html>
  `;
});
