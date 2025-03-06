/**
 * A lightweight, universal HTTP client wrapping the native fetch API
 * with convenient features like automatic JSON parsing, retries, and timeouts.
 */

const DEFAULT_OPTIONS = {
  timeout: 10000, // Default 10s timeout
  retries: 0,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json'
  },
  parseJson: true
};

class HttpError extends Error {
  constructor(response, message) {
    super(message || `HTTP Error ${response.status}`);
    this.name = 'HttpError';
    this.response = response;
    this.status = response.status;
  }
}

class TimeoutError extends Error {
  constructor(timeout) {
    super(`Request timeout after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const createFetchWithTimeout = (timeout) => {
  return async (url, options) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new TimeoutError(timeout);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };
};

export class HttpClient {
  constructor(baseUrl = '', defaultOptions = {}) {
    this.baseUrl = baseUrl;
    this.defaultOptions = { ...DEFAULT_OPTIONS, ...defaultOptions };
  }

  async request(url, options = {}) {
    const finalOptions = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    const fullUrl = this.baseUrl + url;
    let attempt = 0;
    
    while (true) {
      try {
        const fetchWithTimeout = createFetchWithTimeout(finalOptions.timeout);
        const response = await fetchWithTimeout(fullUrl, finalOptions);

        // Throw on non-2xx status codes
        if (!response.ok) {
          throw new HttpError(response);
        }

        // Parse JSON response if enabled
        if (finalOptions.parseJson && response.headers.get('content-type')?.includes('application/json')) {
          const data = await response.json();
          return data;
        }

        return response;
      } catch (error) {
        attempt++;
        const shouldRetry = attempt <= finalOptions.retries;
        
        if (!shouldRetry) throw error;
        
        await sleep(finalOptions.retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
      }
    }
  }

  // Convenience methods for common HTTP methods
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(url, data, options = {}) {
    return this.request(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  // Plugin system for extending functionality
  use(plugin) {
    plugin(this);
    return this;
  }
}

// Create default instance
const http = new HttpClient();
export default http;
