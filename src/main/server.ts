import * as http from 'http';
import { app, powerSaveBlocker } from 'electron';
import { SignageConfig, SystemStatusResponse, ActionResponse } from '../common/types';
import { APP_NAME, APP_TITLE, APP_AUTHOR, APP_VERSION } from '../common/constants';
import { logger } from './logger';
import { configManager } from './config';
import { watchdogService } from './watchdog';
import { windowManager } from './window-manager';
import { OPENAPI_SPEC, getSwaggerHtml } from './swagger';

export class HttpServer {
  private server: http.Server | null = null;
  private port: number = 9191;
  private host: string = '0.0.0.0';
  private authToken?: string;

  /**
   * Starts the embedded HTTP server.
   */
  public start(config: SignageConfig): void {
    if (!config.api.enabled) {
      logger.info('Server', 'Embedded HTTP API is disabled in configuration.');
      return;
    }

    this.stop();

    this.port = config.api.port;
    this.host = config.api.host;
    this.authToken = config.api.authToken;

    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res, config);
    });

    this.server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.error('Server', `Port ${this.port} is already in use. HTTP Control API could not start.`);
      } else {
        logger.error('Server', 'HTTP server encountered an error:', err);
      }
    });

    this.server.listen(this.port, this.host, () => {
      logger.info('Server', `Control & Health API listening on http://${this.host}:${this.port}`);
    });
  }

  /**
   * Stops the embedded HTTP server.
   */
  public stop(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
      logger.info('Server', 'HTTP Control API stopped.');
    }
  }

  private sendJson(res: http.ServerResponse, statusCode: number, data: unknown, cors: boolean = true): void {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
    };
    if (cors) {
      headers['Access-Control-Allow-Origin'] = '*';
      headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS, PUT, DELETE';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-API-Key';
    }

    res.writeHead(statusCode, headers);
    res.end(JSON.stringify(data, null, 2));
  }

  private sendError(res: http.ServerResponse, statusCode: number, message: string): void {
    this.sendJson(res, statusCode, {
      success: false,
      error: message,
    } as ActionResponse);
  }

  private authenticate(req: http.IncomingMessage): boolean {
    if (!this.authToken || this.authToken.trim() === '') {
      return true; // No auth required
    }

    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'];

    if (apiKeyHeader && apiKeyHeader === this.authToken) {
      return true;
    }

    if (authHeader) {
      const match = authHeader.match(/^Bearer\s+(.*)$/i);
      if (match && match[1] === this.authToken) {
        return true;
      }
    }

    return false;
  }

  private async parseBody<T = any>(req: http.IncomingMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 1e6) {
          // 1MB flood protection
          req.destroy();
          reject(new Error('Request body too large'));
        }
      });
      req.on('end', () => {
        if (!body) {
          return resolve({} as T);
        }
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(new Error('Invalid JSON payload'));
        }
      });
      req.on('error', (err) => reject(err));
    });
  }

  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    config: SignageConfig
  ): Promise<void> {
    const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;
    const method = req.method?.toUpperCase() || 'GET';

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      });
      res.end();
      return;
    }

    // Swagger UI Interactive Documentation Explorer
    if ((pathname === '/' || pathname === '/docs' || pathname === '/swagger' || pathname === '/api-docs') && method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(getSwaggerHtml());
      return;
    }

    // OpenAPI Specification JSON
    if ((pathname === '/openapi.json' || pathname === '/swagger.json') && method === 'GET') {
      return this.sendJson(res, 200, OPENAPI_SPEC);
    }

    // Health check endpoint (always unauthenticated)
    if (pathname === '/health' && method === 'GET') {
      return this.sendJson(res, 200, {
        status: 'ok',
        app: APP_NAME,
        version: APP_VERSION,
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    }

    // Authentication check for protected API endpoints
    if (!this.authenticate(req)) {
      return this.sendError(res, 401, 'Unauthorized: Invalid or missing authentication token');
    }

    try {
      // 1. GET /api/status
      if (pathname === '/api/status' && method === 'GET') {
        const mem = process.memoryUsage();
        const displays = windowManager.getDisplaySnapshots();

        const statusPayload: SystemStatusResponse = {
          name: APP_NAME,
          version: APP_VERSION,
          author: APP_AUTHOR,
          uptimeSeconds: Math.floor(process.uptime()),
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.versions.node,
          electronVersion: process.versions.electron,
          chromeVersion: process.versions.chrome,
          memoryUsageMb: {
            rss: Math.round(mem.rss / (1024 * 1024)),
            heapTotal: Math.round(mem.heapTotal / (1024 * 1024)),
            heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
            external: Math.round(mem.external / (1024 * 1024)),
          },
          powerSaveBlockerActive: powerSaveBlocker.isStarted(0),
          displayCount: displays.length,
          displays,
        };
        return this.sendJson(res, 200, statusPayload);
      }

      // 2. GET /api/config
      if (pathname === '/api/config' && method === 'GET') {
        const currentConf = configManager.get();
        // Sanitize auth token if present
        const sanitized = {
          ...currentConf,
          api: {
            ...currentConf.api,
            authToken: currentConf.api.authToken ? '***REDACTED***' : '',
          },
        };
        return this.sendJson(res, 200, sanitized);
      }

      // 3. POST /api/config
      if (pathname === '/api/config' && method === 'POST') {
        const body = await this.parseBody<Partial<SignageConfig>>(req);
        const updated = configManager.save(body);
        windowManager.applyConfig(updated);
        return this.sendJson(res, 200, {
          success: true,
          message: 'Configuration updated and applied successfully',
        } as ActionResponse);
      }

      // 4. POST /api/reload
      if (pathname === '/api/reload' && method === 'POST') {
        const body = await this.parseBody<{ clearCache?: boolean }>(req);
        await watchdogService.reloadAll(body.clearCache ?? true);
        return this.sendJson(res, 200, {
          success: true,
          message: 'All displays reloaded successfully',
        } as ActionResponse);
      }

      // 5. POST /api/displays/:id/reload
      const displayReloadMatch = pathname.match(/^\/api\/displays\/([^/]+)\/reload$/);
      if (displayReloadMatch && method === 'POST') {
        const displayId = Number(displayReloadMatch[1]);
        const body = await this.parseBody<{ clearCache?: boolean }>(req);
        const success = await watchdogService.reloadDisplay(displayId, body.clearCache ?? true);
        if (!success) {
          return this.sendError(res, 404, `Display with ID ${displayId} not found`);
        }
        return this.sendJson(res, 200, {
          success: true,
          message: `Display #${displayId} reloaded successfully`,
        } as ActionResponse);
      }

      // 6. POST /api/displays/:id/url
      const displayUrlMatch = pathname.match(/^\/api\/displays\/([^/]+)\/url$/);
      if (displayUrlMatch && method === 'POST') {
        const displayId = Number(displayUrlMatch[1]);
        const body = await this.parseBody<{ url: string; persist?: boolean }>(req);
        if (!body.url) {
          return this.sendError(res, 400, 'Missing "url" parameter in JSON body');
        }

        const success = watchdogService.updateTargetUrl(displayId, body.url, true);
        if (!success) {
          return this.sendError(res, 404, `Display with ID ${displayId} not found`);
        }

        if (body.persist) {
          configManager.updateDisplayConfig(displayId, { url: body.url });
        }

        return this.sendJson(res, 200, {
          success: true,
          message: `Display #${displayId} target URL updated to ${body.url}`,
        } as ActionResponse);
      }

      // 7. GET /api/displays/:id/screenshot
      const displayScreenshotMatch = pathname.match(/^\/api\/displays\/([^/]+)\/screenshot$/);
      if (displayScreenshotMatch && method === 'GET') {
        const displayId = Number(displayScreenshotMatch[1]);
        const win = windowManager.getWindowForDisplay(displayId);
        if (!win || win.isDestroyed()) {
          return this.sendError(res, 404, `Display with ID ${displayId} not found`);
        }

        const image = await win.webContents.capturePage();
        const pngBuffer = image.toPNG();

        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': pngBuffer.length,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(pngBuffer);
        return;
      }

      // 8. POST /api/identify
      if (pathname === '/api/identify' && method === 'POST') {
        windowManager.identifyDisplays();
        return this.sendJson(res, 200, {
          success: true,
          message: 'Display identification badges flashed on all screens',
        } as ActionResponse);
      }

      // 9. POST /api/setup
      if (pathname === '/api/setup' && method === 'POST') {
        windowManager.openSetupWindow();
        return this.sendJson(res, 200, {
          success: true,
          message: 'Setup window opened',
        } as ActionResponse);
      }

      // 10. POST /api/quit
      if (pathname === '/api/quit' && method === 'POST') {
        this.sendJson(res, 200, {
          success: true,
          message: 'Signage runner is shutting down...',
        } as ActionResponse);
        setTimeout(() => app.quit(), 500);
        return;
      }

      // 404 Not Found
      return this.sendError(res, 404, `Route ${method} ${pathname} not found`);
    } catch (err: any) {
      logger.error('Server', `Unhandled API error on ${method} ${pathname}:`, err);
      return this.sendError(res, 500, err.message || 'Internal server error');
    }
  }
}

export const httpServer = new HttpServer();
