import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import {
  getMemoryStats,
  clearMemoryStats,
  startMemoryTracking,
  stopMemoryTracking,
  isMemoryTracking,
} from '../memory-profiler.js';

// Create a standalone server for debugging purposes
export function createStandaloneServer(port = 3333) {
  const app = express();

  // Enable CORS
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });

  // Simple test endpoint
  app.get('/simple-test', (req: Request, res: Response) => {
    res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Simple Test Tab (Standalone Server)</title>
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Simple Test Tab (Standalone Server)</h1>
    <p>This is served from a standalone server on port ${port}.</p>
    
    <div class="status">
      <p><strong>Status:</strong> Standalone server is working!</p>
    </div>
  </div>
</body>
</html>
    `);
  });

  // Memory stats API
  app.get('/api/memory-stats', (req: Request, res: Response) => {
    res.json(getMemoryStats());
  });

  app.post('/api/memory-start', (req: Request, res: Response) => {
    startMemoryTracking();
    res.json({ success: true });
  });

  app.post('/api/memory-stop', (req: Request, res: Response) => {
    stopMemoryTracking();
    res.json({ success: true });
  });

  app.post('/api/memory-clear', (req: Request, res: Response) => {
    clearMemoryStats();
    res.json({ success: true });
  });

  app.get('/api/memory-status', (req: Request, res: Response) => {
    res.json({ isTracking: isMemoryTracking() });
  });

  // Create and start the server
  const server = createServer(app);
  server.listen(port, () => {
    console.log(
      `Nuxt Scan standalone server running on http://localhost:${port}`,
    );
  });

  return {
    server,
    port,
    url: `http://localhost:${port}`,
    stop: () => {
      server.close();
    },
  };
}
