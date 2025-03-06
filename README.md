# @alok5953/tiny-http-client

[![npm version](https://img.shields.io/npm/v/@alok5953/tiny-http-client.svg)](https://www.npmjs.com/package/@alok5953/tiny-http-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@alok5953/tiny-http-client.svg)](https://nodejs.org)

A modern, lightweight HTTP client that wraps the native fetch API for both browser and Node.js environments. Built with modern JavaScript practices and zero dependencies.

## Why Choose This Library?

- 🪶 **Truly Lightweight**: Zero dependencies, tiny bundle size (~2KB minified + gzipped)
- ⚡️ **Modern & Fast**: Built on native fetch API
- 🔄 **Smart Retries**: Built-in retry mechanism with exponential backoff
- ⏱ **Timeout Control**: Automatic request timeouts using AbortController
- 🔌 **Extensible**: Plugin system for custom functionality
- 🌐 **Universal**: Works in both browser and Node.js (≥18)
- 🛡️ **Type-Safe**: Written in JavaScript with JSDoc comments for TypeScript support

## Installation

```bash
npm install @alok5953/tiny-http-client
```

## Quick Start

```javascript
import http from '@alok5953/tiny-http-client';

// Simple GET request with automatic JSON parsing
const users = await http.get('https://api.example.com/users');

// POST with JSON body
const newUser = await http.post('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Custom instance with advanced configuration
const api = new HttpClient('https://api.example.com', {
  timeout: 5000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Accept': 'application/json'
  }
});
```

## Features

### Automatic Retries

```javascript
// Retry failed requests automatically
const api = new HttpClient('https://api.example.com', {
  retries: 3,           // Number of retry attempts
  retryDelay: 1000      // Base delay (uses exponential backoff)
});

// The client will automatically retry failed requests
// with increasing delays: 1s, 2s, 4s
const data = await api.get('/unstable-endpoint');
```

### Plugin System

```javascript
import { authPlugin, cachePlugin, loggingPlugin } from '@alok5953/tiny-http-client/plugins';

// Authentication plugin
http.use(authPlugin('your-token'));

// Caching plugin with TTL
http.use(cachePlugin(60000)); // 1 minute cache

// Logging plugin
http.use(loggingPlugin());

// Custom plugin
http.use(client => {
  const originalRequest = client.request.bind(client);
  client.request = async (url, options) => {
    console.log(`Request to: ${url}`);
    const response = await originalRequest(url, options);
    console.log(`Response status: ${response.status}`);
    return response;
  };
});
```

## API Reference

### HttpClient

```javascript
// Constructor
new HttpClient(baseUrl?: string, options?: HttpClientOptions)

// Instance methods
request(url: string, options?: RequestOptions): Promise<any>
get(url: string, options?: RequestOptions): Promise<any>
post(url: string, data?: any, options?: RequestOptions): Promise<any>
put(url: string, data?: any, options?: RequestOptions): Promise<any>
delete(url: string, options?: RequestOptions): Promise<any>
use(plugin: Plugin): HttpClient
```

### Options

```javascript
interface HttpClientOptions {
  timeout?: number;        // Request timeout in ms (default: 10000)
  retries?: number;        // Number of retry attempts (default: 0)
  retryDelay?: number;     // Base delay between retries in ms (default: 1000)
  headers?: Headers;       // Default headers for all requests
  parseJson?: boolean;     // Auto-parse JSON responses (default: true)
  [key: string]: any;      // Any valid fetch options
}
```

### Error Handling

```javascript
try {
  const data = await http.get('/api/users');
} catch (error) {
  if (error.name === 'HttpError') {
    console.error(`HTTP ${error.status}:`, error.message);
    // Access the original response
    console.error('Response:', error.response);
  } else if (error.name === 'TimeoutError') {
    console.error(`Request timed out after ${error.timeout}ms`);
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Alok Kaushik**

- GitHub: [@alokkaushik](https://github.com/alokkaushik)
- LinkedIn: [Alok Kaushik](https://www.linkedin.com/in/alok-kaushik-b67128267/)

## Acknowledgments

- Inspired by the need for a lightweight, modern HTTP client
- Built with modern JavaScript features and best practices
- Zero dependencies for minimal bundle size and maximum reliability
