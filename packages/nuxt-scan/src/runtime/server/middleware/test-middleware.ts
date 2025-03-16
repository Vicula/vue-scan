import { defineEventHandler } from 'h3';

export default defineEventHandler((event) => {
  // If the URL matches our test path, return a simple response
  const url = event.node.req.url;

  if (url === '/test-middleware-works') {
    return {
      success: true,
      message: 'The test middleware is working correctly!',
      url,
      timestamp: new Date().toISOString(),
    };
  }
});
