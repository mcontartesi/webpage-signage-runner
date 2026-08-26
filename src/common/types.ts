import { z } from 'zod';

/**
 * Configuration schema for an individual display/screen.
 */
export const DisplayConfigSchema = z.object({
  /** Identifier matching Electron display ID (as string) or display index */
  id: z.union([z.string(), z.number()]),
  /** Friendly label for the monitor (e.g. "Samsung 55' Main Hall") */
  label: z.string().optional(),
  /** The target URL to display in kiosk mode */
  url: z.string().url('Target must be a valid URL (http:// or https://)').default('https://www.youtube.com'),
  /** HTTP method for the initial/reloading request (GET, POST, PUT) */
  httpMethod: z.enum(['GET', 'POST', 'PUT']).default('GET'),
  /** Custom HTTP headers (e.g. Authorization: Bearer <token>, X-Api-Key, etc.) */
  headers: z.record(z.string(), z.string()).optional(),
  /** Raw request body string for POST/PUT requests (JSON, XML, or form-urlencoded) */
  requestBody: z.string().optional(),
  /** Fallback URL or local asset path if primary URL fails permanently */
  fallbackUrl: z.string().optional(),
  /** Interval in minutes to clear cache and reload page to prevent memory leaks. 0 to disable. */
  reloadIntervalMinutes: z.number().min(0).default(60),
  /** Seconds to wait before retrying after a load failure */
  retryIntervalSeconds: z.number().min(3).max(300).default(10),
  /** Whether to inject CSS to suppress the mouse pointer */
  hideCursor: z.boolean().default(true),
  /** Zoom scale factor (e.g. 1.0 = 100%, 1.25 = 125%) */
  zoomFactor: z.number().min(0.2).max(5.0).default(1.0),
  /** Custom User-Agent header string */
  userAgent: z.string().optional(),
  /** Isolated partition name for separate cookies/localstorage per display */
  partition: z.string().optional(),
  /** Zero-based display index in the connected display list for stable reboot matching */
  displayIndex: z.number().int().min(0).optional(),
  /** Whether this display is the primary operating system monitor */
  isPrimary: z.boolean().optional(),
  /** Physical screen coordinates and dimensions for resilient reboot matching */
  bounds: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
  /** Whether this screen is actively managed */
  enabled: z.boolean().default(true),
});

export type DisplayConfig = z.infer<typeof DisplayConfigSchema>;

/**
 * Global HTTP Control & Health API configuration schema.
 */
export const ApiConfigSchema = z.object({
  /** Enable embedded HTTP REST API */
  enabled: z.boolean().default(true),
  /** Port to listen on (e.g. 9191) */
  port: z.number().int().min(1024).max(65535).default(9191),
  /** Host to bind (e.g. '0.0.0.0' for LAN access, '127.0.0.1' for local only) */
  host: z.string().default('0.0.0.0'),
  /** Optional security token (Bearer token / X-API-Key). If empty, API is unauthenticated. */
  authToken: z.string().optional(),
  /** Enable CORS headers */
  cors: z.boolean().default(true),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

/**
 * Watchdog & Resilience options schema.
 */
export const WatchdogConfigSchema = z.object({
  /** Maximum consecutive retry attempts before showing permanent offline fallback */
  maxRetries: z.number().min(1).max(100).default(10),
  /** Unresponsive renderer grace period before forced reload (seconds) */
  unresponsiveTimeoutSeconds: z.number().min(5).max(120).default(15),
  /** Clear Chromium disk & memory cache on scheduled reload */
  clearCacheOnReload: z.boolean().default(true),
  /** Re-create window if render process crashes */
  autoRecoverCrashes: z.boolean().default(true),
});

export type WatchdogConfig = z.infer<typeof WatchdogConfigSchema>;

/**
 * Master Application Configuration Schema.
 */
export const SignageConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().default('1.1.1'),
  /** Default URL to assign when new displays are hotplugged or not configured */
  defaultUrl: z.string().url().default('https://www.youtube.com'),
  /** Global cursor hiding toggle */
  hideCursorGlobal: z.boolean().default(true),
  /** Global cache reload interval (minutes) */
  defaultReloadIntervalMinutes: z.number().min(0).default(60),
  /** Global offline retry interval (seconds) */
  defaultRetryIntervalSeconds: z.number().min(3).max(300).default(10),
  /** Automatically launch application on OS startup */
  autoStartOnBoot: z.boolean().default(true),
  /** Emergency shortcut to exit kiosk or open setup (e.g. "CommandOrControl+Shift+C") */
  emergencyShortcut: z.string().default('CommandOrControl+Shift+C'),
  /** Embedded HTTP API settings */
  api: ApiConfigSchema.default({
    enabled: true,
    port: 9191,
    host: '0.0.0.0',
    cors: true,
  }),
  /** Watchdog settings */
  watchdog: WatchdogConfigSchema.default({
    maxRetries: 10,
    unresponsiveTimeoutSeconds: 15,
    clearCacheOnReload: true,
    autoRecoverCrashes: true,
  }),
  /** Per-display settings keyed by display ID or list */
  displays: z.array(DisplayConfigSchema).default([]),
});

export type SignageConfig = z.infer<typeof SignageConfigSchema>;

/**
 * Runtime display metadata received from Electron's screen API.
 */
export interface RuntimeDisplayInfo {
  id: number;
  label: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  workArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  scaleFactor: number;
  rotation: number;
  isPrimary: boolean;
  internal: boolean;
  configuredUrl?: string;
  status: 'idle' | 'loading' | 'active' | 'offline' | 'unresponsive' | 'error';
  lastReloadTime?: string;
  failureCount: number;
}

/**
 * Payload for saving configuration via IPC from the setup UI.
 */
export interface SaveConfigRequest {
  config: SignageConfig;
  launchKioskImmediately?: boolean;
}

/**
 * Result returned from configuration actions.
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Health & Status API response.
 */
export interface SystemStatusResponse {
  name: string;
  version: string;
  author: string;
  uptimeSeconds: number;
  platform: NodeJS.Platform;
  arch: string;
  nodeVersion: string;
  electronVersion: string;
  chromeVersion: string;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  powerSaveBlockerActive: boolean;
  displayCount: number;
  displays: Array<{
    id: number;
    label: string;
    bounds: { x: number; y: number; width: number; height: number };
    isPrimary: boolean;
    currentUrl: string;
    status: string;
    lastReload: string | null;
    failureCount: number;
    isResponsive: boolean;
  }>;
}

/**
 * IPC Channel Constants.
 */
export const IPC_CHANNELS = {
  GET_CONFIG: 'signage:get-config',
  SAVE_CONFIG: 'signage:save-config',
  GET_DISPLAYS: 'signage:get-displays',
  IDENTIFY_DISPLAYS: 'signage:identify-displays',
  TEST_URL: 'signage:test-url',
  OPEN_LOGS_FOLDER: 'signage:open-logs-folder',
  RESTART_APP: 'signage:restart-app',
  CLOSE_SETUP: 'signage:close-setup',
  RETRY_DISPLAY: 'signage:retry-display',
  QUIT_APP: 'signage:quit-app',
} as const;
