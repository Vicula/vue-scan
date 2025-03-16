import { defineEventHandler } from 'h3';

export default defineEventHandler(() => {
  // Return a simple HTML page with no dependencies
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Simple Test Tab</title>
  <meta charset="utf-8">
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    h1 {
      color: #00dc82;
      margin-top: 0;
    }
    .status {
      margin-top: 20px;
      padding: 10px;
      background-color: #e5ffe5;
      border: 1px solid #00dc82;
      border-radius: 4px;
    }
    button {
      background-color: #00dc82;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 8px;
      font-size: 14px;
    }
    .info {
      margin-top: 20px;
      padding: 10px;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Simple Test Tab</h1>
    <p>This is a simple test tab to check if DevTools integration is working.</p>
    
    <div class="status">
      <p><strong>Status:</strong> Tab is loaded successfully!</p>
    </div>
    
    <div style="margin-top: 20px;">
      <button id="testButton">Test Button</button>
    </div>
    
    <div class="info" id="info">
      <p>Click the button to test interactivity</p>
    </div>
  </div>

  <script>
    // Simple JS to test that the tab is interactive
    const button = document.getElementById('testButton');
    const info = document.getElementById('info');
    let clickCount = 0;
    
    button.addEventListener('click', () => {
      clickCount++;
      info.innerHTML = '<p>Button clicked ' + clickCount + ' time(s)</p>';
      
      // Log to console to check if JS is running
      console.log('Button clicked in DevTools test tab');
    });
    
    // Log that the page has loaded
    console.log('Simple test tab loaded successfully');
  </script>
</body>
</html>
  `;
});
