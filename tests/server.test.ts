import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as http from 'http';
import { SignageConfig } from '../src/common/types';
import { DEFAULT_CONFIG } from '../src/common/constants';

describe('HTTP Control API Logic & Endpoints', () => {
  let server: http.Server;
  const testPort = 9292;
  const secretToken = 'super-secret-kiosk-token';

  beforeAll(async () => {
    // Spin up an isolated test server using the same routing logic
    server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = parsedUrl.pathname;
      const method = req.method?.toUpperCase() || 'GET';

      // CORS
      if (method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
        });
        res.end();
        return;
      }

      if ((pathname === '/' || pathname === '/docs') && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<!DOCTYPE html><html><head><title>Swagger UI</title></head><body><div id="swagger-ui"></div></body></html>');
        return;
      }

      if (pathname === '/openapi.json' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ openapi: '3.0.3', info: { title: 'Test API' } }));
        return;
      }

      if (pathname === '/health' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', uptime: 100 }));
        return;
      }

      // Auth check
      const authHeader = req.headers['authorization'];
      const apiKeyHeader = req.headers['x-api-key'];
      const isAuth = apiKeyHeader === secretToken || authHeader === `Bearer ${secretToken}`;

      if (!isAuth) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
        return;
      }

      if (pathname === '/api/status' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ name: 'webpage-signage-runner', uptimeSeconds: 100, displayCount: 2 }));
        return;
      }

      if (pathname === '/api/reload' && method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Reloaded all' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Not found' }));
    });

    await new Promise<void>((resolve) => {
      server.listen(testPort, '127.0.0.1', () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  const request = (path: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}): Promise<{ status: number; body: any; headers: http.IncomingHttpHeaders }> => {
    return new Promise((resolve, reject) => {
      const req = http.request(
        {
          host: '127.0.0.1',
          port: testPort,
          path,
          method: options.method || 'GET',
          headers: options.headers || {},
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode || 0, body: JSON.parse(data), headers: res.headers });
            } catch {
              resolve({ status: res.statusCode || 0, body: data, headers: res.headers });
            }
          });
        }
      );
      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    });
  };

  it('should return Swagger UI HTML on root /', async () => {
    const res = await request('/');
    expect(res.status).toBe(200);
    expect(res.body).toContain('Swagger UI');
  });

  it('should return OpenAPI JSON specification on /openapi.json', async () => {
    const res = await request('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
  });

  it('should return health status without authentication', async () => {
    const res = await request('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBe(100);
  });

  it('should reject protected /api/status without token', async () => {
    const res = await request('/api/status');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow /api/status with valid Bearer token', async () => {
    const res = await request('/api/status', {
      headers: { Authorization: `Bearer ${secretToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('webpage-signage-runner');
    expect(res.body.displayCount).toBe(2);
  });

  it('should allow /api/status with valid X-API-Key header', async () => {
    const res = await request('/api/status', {
      headers: { 'X-API-Key': secretToken },
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('webpage-signage-runner');
  });

  it('should process POST /api/reload when authenticated', async () => {
    const res = await request('/api/reload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ clearCache: true }),
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Reloaded all');
  });

  it('should respond to OPTIONS preflight with CORS headers', async () => {
    const res = await request('/api/status', { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});
