import { defineEventHandler, readBody, getQuery } from 'h3';

// In-memory storage for performance data
// In a production environment, you might want to use a database
const performanceData: any[] = [];

export default defineEventHandler(async (event) => {
  const method = event.method || event.req.method;

  // Handle GET requests to retrieve performance data
  if (method === 'GET') {
    const query = getQuery(event);

    // Filter performanceData based on query parameters if needed
    return {
      success: true,
      data: performanceData,
    };
  }

  // Handle POST requests to save performance data
  if (method === 'POST') {
    try {
      const body = await readBody(event);

      if (Array.isArray(body)) {
        performanceData.push(...body);
      } else {
        performanceData.push(body);
      }

      return {
        success: true,
        message: 'Data received',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to process data',
        error: String(error),
      };
    }
  }

  // Handle other HTTP methods
  return {
    success: false,
    message: 'Method not supported',
  };
});
