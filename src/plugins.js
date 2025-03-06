/**
 * Example plugins for the HTTP client showing common use cases
 */

// Auth token interceptor
export const authPlugin = (token) => (client) => {
  const originalRequest = client.request.bind(client);
  client.request = async (url, options = {}) => {
    const finalOptions = {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    };
    return originalRequest(url, finalOptions);
  };
};

// Logging plugin
export const loggingPlugin = (logger = console) => (client) => {
  const originalRequest = client.request.bind(client);
  client.request = async (url, options = {}) => {
    const startTime = Date.now();
    try {
      const response = await originalRequest(url, options);
      logger.info(`${options.method || 'GET'} ${url} - ${Date.now() - startTime}ms`);
      return response;
    } catch (error) {
      logger.error(`${options.method || 'GET'} ${url} - Error: ${error.message}`);
      throw error;
    }
  };
};

// Cache plugin with memory storage
export const cachePlugin = (ttl = 60000) => {
  const cache = new Map();
  
  return (client) => {
    const originalRequest = client.request.bind(client);
    client.request = async (url, options = {}) => {
      if (options.method === 'GET' && !options.noCache) {
        const cacheKey = `${url}-${JSON.stringify(options)}`;
        const cached = cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < ttl) {
          return cached.data;
        }
        
        const response = await originalRequest(url, options);
        cache.set(cacheKey, {
          data: response,
          timestamp: Date.now()
        });
        return response;
      }
      
      return originalRequest(url, options);
    };
  };
};
