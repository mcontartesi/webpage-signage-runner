import { APP_NAME, APP_TITLE, APP_AUTHOR, APP_VERSION } from '../common/constants';

export const OPENAPI_SPEC = {
  openapi: '3.0.3',
  info: {
    title: `${APP_TITLE} Control & Health API`,
    version: APP_VERSION,
    description: `### Production-grade Multi-Display Digital Signage Kiosk Orchestrator API
Created by **${APP_AUTHOR}**.

This embedded HTTP REST API provides remote monitoring, dynamic URL push, display screenshot capture, and cache reloading without physical keyboard access.

#### Authentication
If configured with an API token, include either:
* **Bearer Token**: \`Authorization: Bearer <token>\`
* **Custom Header**: \`X-API-Key: <token>\`

*Note: The \`/health\`, \`/\`, \`/docs\`, and \`/openapi.json\` endpoints do not require authentication.*`,
    contact: {
      name: APP_AUTHOR,
      url: 'https://github.com/mcontartesi/webpage-signage-runner',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Node Instance',
    },
  ],
  security: [
    { BearerAuth: [] },
    { ApiKeyAuth: [] },
    {},
  ],
  tags: [
    { name: 'System & Health', description: 'Node status, health probes, and power state' },
    { name: 'Display Management', description: 'Screen control, URL updates, reloads, and live screenshots' },
    { name: 'Configuration & Actions', description: 'Configuration management, setup wizard, and app lifecycle' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System & Health'],
        summary: 'Fast Health Check Probe',
        description: 'Lightweight liveness probe for monitoring tools (Prometheus, Uptime Kuma, load balancers). Always unauthenticated.',
        responses: {
          '200': {
            description: 'Application is running normally',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    app: { type: 'string', example: APP_NAME },
                    version: { type: 'string', example: APP_VERSION },
                    uptimeSeconds: { type: 'integer', example: 86400 },
                    timestamp: { type: 'string', format: 'date-time', example: '2026-08-25T22:00:00.000Z' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/status': {
      get: {
        tags: ['System & Health'],
        summary: 'Get Node Telemetry & Displays Status',
        description: 'Returns real-time telemetry including host metrics, memory consumption (RSS, Heap), and states of all connected physical displays.',
        responses: {
          '200': {
            description: 'System status and display telemetry',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: APP_NAME },
                    version: { type: 'string', example: APP_VERSION },
                    author: { type: 'string', example: APP_AUTHOR },
                    uptimeSeconds: { type: 'integer', example: 3600 },
                    platform: { type: 'string', example: 'win32' },
                    arch: { type: 'string', example: 'x64' },
                    nodeVersion: { type: 'string', example: '22.10.0' },
                    electronVersion: { type: 'string', example: '34.0.0' },
                    chromeVersion: { type: 'string', example: '132.0.6834.83' },
                    memoryUsageMb: {
                      type: 'object',
                      properties: {
                        rss: { type: 'number', example: 142 },
                        heapTotal: { type: 'number', example: 65 },
                        heapUsed: { type: 'number', example: 48 },
                        external: { type: 'number', example: 8 },
                      },
                    },
                    powerSaveBlockerActive: { type: 'boolean', example: true },
                    displayCount: { type: 'integer', example: 2 },
                    displays: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          label: { type: 'string', example: 'Display 1' },
                          bounds: {
                            type: 'object',
                            properties: {
                              x: { type: 'number', example: 0 },
                              y: { type: 'number', example: 0 },
                              width: { type: 'number', example: 3840 },
                              height: { type: 'number', example: 2160 },
                            },
                          },
                          isPrimary: { type: 'boolean', example: true },
                          currentUrl: { type: 'string', example: 'https://grafana.company.internal/kiosk' },
                          status: { type: 'string', enum: ['idle', 'loading', 'active', 'offline', 'unresponsive', 'error'], example: 'active' },
                          lastReload: { type: 'string', format: 'date-time', nullable: true, example: '2026-08-25T21:00:00.000Z' },
                          failureCount: { type: 'integer', example: 0 },
                          isResponsive: { type: 'boolean', example: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/displays/{id}/url': {
      post: {
        tags: ['Display Management'],
        summary: 'Update Target URL on Specific Display',
        description: 'Instantly navigates the specified display to a new target URL without interrupting other screens.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Physical display ID or index (e.g. 1)',
            schema: { type: 'integer', example: 1 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['url'],
                properties: {
                  url: {
                    type: 'string',
                    format: 'uri',
                    description: 'Target webpage URL to load immediately',
                    example: 'https://emergency.company.internal/alert',
                  },
                  persist: {
                    type: 'boolean',
                    description: 'If true, persists the URL change to config.json for subsequent reboots',
                    default: false,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Target URL successfully updated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: {
                  success: true,
                  message: 'Display #1 target URL updated to https://emergency.company.internal/alert',
                },
              },
            },
          },
          '400': { description: 'Missing or invalid URL parameter' },
          '404': { description: 'Display ID not found' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/displays/{id}/screenshot': {
      get: {
        tags: ['Display Management'],
        summary: 'Capture Live Screen Screenshot',
        description: 'Captures a full-resolution PNG image of the requested display screen. Essential for verifying visual signage feeds remotely.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Physical display ID (e.g. 1)',
            schema: { type: 'integer', example: 1 },
          },
        ],
        responses: {
          '200': {
            description: 'Raw PNG screenshot image buffer',
            content: {
              'image/png': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '404': { description: 'Display ID not found' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/reload': {
      post: {
        tags: ['Display Management'],
        summary: 'Reload All Connected Displays',
        description: 'Triggers a coordinated reload and optional cache purge across all active screens.',
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  clearCache: {
                    type: 'boolean',
                    description: 'Purge Chromium cache before reload',
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Reload command dispatched',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'All displays reloaded successfully' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/displays/{id}/reload': {
      post: {
        tags: ['Display Management'],
        summary: 'Reload Specific Display',
        description: 'Triggers a reload of a single physical display.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Physical display ID (e.g. 1)',
            schema: { type: 'integer', example: 1 },
          },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  clearCache: { type: 'boolean', default: true, example: true },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Display reload initiated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'Display #1 reloaded successfully' },
              },
            },
          },
          '404': { description: 'Display ID not found' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/identify': {
      post: {
        tags: ['Display Management'],
        summary: 'Flash Physical Screen Identification Badges',
        description: 'Displays large transparent numerical overlays on all physical screens for 5 seconds to identify which monitor corresponds to each ID.',
        responses: {
          '200': {
            description: 'Overlays flashed on all screens',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'Display identification badges flashed on all screens' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/config': {
      get: {
        tags: ['Configuration & Actions'],
        summary: 'Get Current Configuration',
        description: 'Returns the active application configuration (with security tokens redacted).',
        responses: {
          '200': {
            description: 'Active configuration object',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignageConfig' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Configuration & Actions'],
        summary: 'Update Configuration',
        description: 'Applies new configuration parameters live and persists them to config.json atomically.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignageConfig' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Configuration updated and applied',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'Configuration updated and applied successfully' },
              },
            },
          },
          '400': { description: 'Invalid configuration schema' },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/setup': {
      post: {
        tags: ['Configuration & Actions'],
        summary: 'Open Desktop Setup Wizard',
        description: 'Remotely invokes the First-Run Setup Wizard on the physical kiosk desktop.',
        responses: {
          '200': {
            description: 'Setup window opened',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'Setup window opened' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/quit': {
      post: {
        tags: ['Configuration & Actions'],
        summary: 'Shutdown Application',
        description: 'Cleanly terminates the signage runner process on the host machine.',
        responses: {
          '200': {
            description: 'Shutdown scheduled',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ActionResponse' },
                example: { success: true, message: 'Signage runner is shutting down...' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['System & Health'],
        summary: 'OpenAPI 3.0 JSON Specification',
        description: 'Returns the raw OpenAPI 3.0 specification for code generation and automated tooling.',
        responses: {
          '200': {
            description: 'OpenAPI specification document',
            content: { 'application/json': { schema: { type: 'object' } } },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Provide API authentication token via standard Authorization header: `Bearer <token>`',
      },
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'Provide API authentication token via `X-API-Key` header',
      },
    },
    schemas: {
      ActionResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          error: { type: 'string', nullable: true },
          data: { type: 'object', nullable: true },
        },
      },
      DisplayConfig: {
        type: 'object',
        required: ['id', 'url'],
        properties: {
          id: { type: 'integer', example: 1 },
          label: { type: 'string', example: 'Main Entrance Display' },
          url: { type: 'string', format: 'uri', example: 'https://grafana.company.internal/kiosk' },
          fallbackUrl: { type: 'string', example: '' },
          reloadIntervalMinutes: { type: 'number', default: 60, example: 60 },
          retryIntervalSeconds: { type: 'number', default: 10, example: 10 },
          hideCursor: { type: 'boolean', default: true, example: true },
          zoomFactor: { type: 'number', default: 1.0, example: 1.0 },
          enabled: { type: 'boolean', default: true, example: true },
        },
      },
      SignageConfig: {
        type: 'object',
        properties: {
          version: { type: 'string', example: '1.0.0' },
          defaultUrl: { type: 'string', example: 'https://antigravity.google' },
          hideCursorGlobal: { type: 'boolean', example: true },
          defaultReloadIntervalMinutes: { type: 'number', example: 60 },
          defaultRetryIntervalSeconds: { type: 'number', example: 10 },
          autoStartOnBoot: { type: 'boolean', example: true },
          emergencyShortcut: { type: 'string', example: 'CommandOrControl+Shift+C' },
          api: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean', example: true },
              port: { type: 'number', example: 9191 },
              host: { type: 'string', example: '0.0.0.0' },
              authToken: { type: 'string', example: '' },
              cors: { type: 'boolean', example: true },
            },
          },
          watchdog: {
            type: 'object',
            properties: {
              maxRetries: { type: 'number', example: 10 },
              unresponsiveTimeoutSeconds: { type: 'number', example: 15 },
              clearCacheOnReload: { type: 'boolean', example: true },
              autoRecoverCrashes: { type: 'boolean', example: true },
            },
          },
          displays: {
            type: 'array',
            items: { $ref: '#/components/schemas/DisplayConfig' },
          },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Authentication token missing or invalid',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ActionResponse' },
            example: {
              success: false,
              error: 'Unauthorized: Invalid or missing authentication token',
            },
          },
        },
      },
    },
  },
};

/**
 * Generates an interactive Swagger UI HTML document with dark theme styling
 * and embedded OpenAPI specification.
 */
export function getSwaggerHtml(): string {
  const specJson = JSON.stringify(OPENAPI_SPEC);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${APP_TITLE} - Interactive API Explorer</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css">
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2338bdf8'><rect x='2' y='3' width='20' height='14' rx='2'/><line x1='8' y1='21' x2='16' y2='21'/></svg>">
  <style>
    :root {
      --bg-main: #0b0f19;
      --bg-card: #131b2e;
      --border-color: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --primary: #2563eb;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg-main);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* Custom Header */
    .custom-topbar {
      background: rgba(19, 27, 46, 0.95);
      border-bottom: 1px solid var(--border-color);
      padding: 14px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #2563eb, #38bdf8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .brand-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: -0.02em;
    }

    .brand-subtitle {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .topbar-links {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .topbar-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.8rem;
      text-decoration: none;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .topbar-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: var(--accent);
      color: var(--accent);
    }

    /* Swagger Dark Mode Overrides */
    .swagger-ui {
      color: var(--text-main);
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px;
    }

    .swagger-ui .topbar { display: none; }

    .swagger-ui .info {
      margin: 20px 0;
    }

    .swagger-ui .info .title {
      color: #f8fafc;
      font-weight: 700;
    }

    .swagger-ui .info p, .swagger-ui .info li {
      color: var(--text-muted);
    }

    .swagger-ui .scheme-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      box-shadow: none;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .swagger-ui .opblock-tag {
      color: #f8fafc;
      border-bottom: 1px solid var(--border-color);
      font-size: 1.2rem;
      padding: 14px 0 8px 0;
    }

    .swagger-ui .opblock {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      margin: 0 0 16px;
    }

    .swagger-ui .opblock .opblock-summary {
      border-color: var(--border-color);
      padding: 10px 16px;
    }

    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 6px;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .swagger-ui .opblock .opblock-summary-path {
      color: #f8fafc;
      font-weight: 600;
    }

    .swagger-ui .opblock .opblock-summary-description {
      color: var(--text-muted);
    }

    .swagger-ui .opblock-body {
      background: rgba(11, 15, 25, 0.95);
      border-top: 1px solid var(--border-color);
    }

    .swagger-ui .tab li button.tablinks {
      color: var(--text-muted);
    }

    .swagger-ui .tab li button.tablinks.active {
      color: var(--accent);
      border-bottom: 2px solid var(--accent);
    }

    .swagger-ui .btn {
      border-radius: 6px;
      font-weight: 600;
    }

    .swagger-ui .btn.authorize {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      border-color: transparent;
      color: white;
    }

    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #0284c7, #0369a1);
      border-color: transparent;
      color: white;
    }

    .swagger-ui select, .swagger-ui input[type=text], .swagger-ui textarea {
      background: #090d16 !important;
      border: 1px solid var(--border-color) !important;
      color: #f8fafc !important;
      border-radius: 6px;
      padding: 8px 12px;
    }

    .swagger-ui table thead tr td, .swagger-ui table thead tr th {
      color: var(--text-muted);
      border-color: var(--border-color);
    }

    .swagger-ui .response-col_status {
      color: #f8fafc;
    }

    .swagger-ui .model-box, .swagger-ui section.models {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .swagger-ui section.models h4 {
      color: #f8fafc;
    }

    .swagger-ui .model-title {
      color: #f8fafc;
    }

    .swagger-ui .model {
      color: var(--text-muted);
    }

    .swagger-ui .prop-type {
      color: var(--accent);
    }

    /* Fallback UI if CDN fails to load */
    #fallback-container {
      display: none;
      padding: 40px 20px;
      max-width: 900px;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="custom-topbar">
    <div class="brand-wrap">
      <div class="brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <div>
        <div class="brand-title">${APP_TITLE} REST API</div>
        <div class="brand-subtitle">Interactive OpenAPI 3.0 Documentation • By ${APP_AUTHOR}</div>
      </div>
    </div>
    <div class="topbar-links">
      <a href="/openapi.json" target="_blank" class="topbar-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        openapi.json
      </a>
      <a href="/health" target="_blank" class="topbar-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        /health
      </a>
      <a href="https://github.com/mcontartesi/webpage-signage-runner" target="_blank" class="topbar-btn">
        GitHub
      </a>
    </div>
  </div>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js" crossorigin="anonymous"></script>
  <script>
    const spec = ${specJson};

    window.onload = () => {
      if (typeof SwaggerUIBundle !== 'undefined') {
        window.ui = SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
          ],
          plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
          ],
          layout: "StandaloneLayout",
          defaultModelsExpandDepth: 2,
          defaultModelExpandDepth: 2,
          displayRequestDuration: true,
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          tryItOutEnabled: true,
        });
      } else {
        document.getElementById('swagger-ui').innerHTML = \`
          <div style="padding: 40px; text-align: center; color: #94a3b8;">
            <h2>Interactive API Documentation</h2>
            <p>Swagger CDN unavailable offline. Raw OpenAPI specification available at <a href="/openapi.json" style="color: #38bdf8;">/openapi.json</a>.</p>
          </div>
        \`;
      }
    };
  </script>
</body>
</html>`;
}
