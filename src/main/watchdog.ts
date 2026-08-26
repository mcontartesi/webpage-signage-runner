import { BrowserWindow, session } from 'electron';
import * as path from 'path';
import { logger } from './logger';

export interface DisplayState {
  displayId: number;
  window: BrowserWindow;
  targetUrl: string;
  httpMethod?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  requestBody?: string;
  fallbackUrl?: string;
  status: 'idle' | 'loading' | 'active' | 'offline' | 'unresponsive' | 'error';
  lastReloadTime: string | null;
  failureCount: number;
  isResponsive: boolean;
  retryIntervalSeconds: number;
  reloadIntervalMinutes: number;
  retryTimer?: NodeJS.Timeout;
  cacheReloadTimer?: NodeJS.Timeout;
  unresponsiveTimer?: NodeJS.Timeout;
}

export class WatchdogService {
  private displayStates: Map<number, DisplayState> = new Map();
  private onCrashCallback?: (displayId: number) => void;

  public setCrashRecoveryHandler(handler: (displayId: number) => void): void {
    this.onCrashCallback = handler;
  }

  /**
   * Builds Electron loadURL options from method, headers, and requestBody.
   */
  /**
   * Builds Electron loadURL options from method, headers, and requestBody.
   * Optionally appends cache-busting headers for forced hard reload.
   */
  public static buildLoadOptions(
    httpMethod?: 'GET' | 'POST' | 'PUT',
    headers?: Record<string, string>,
    requestBody?: string,
    forceCacheBusting: boolean = false
  ): { extraHeaders?: string; postData?: Array<{ type: 'rawData'; bytes: Buffer }> } {
    const options: { extraHeaders?: string; postData?: Array<{ type: 'rawData'; bytes: Buffer }> } = {};

    const headerMap: Record<string, string> = { ...(headers || {}) };
    if (forceCacheBusting) {
      headerMap['Pragma'] = 'no-cache';
      headerMap['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    if (Object.keys(headerMap).length > 0) {
      options.extraHeaders = Object.entries(headerMap)
        .filter(([k, v]) => k.trim() !== '' && v !== undefined)
        .map(([k, v]) => `${k.trim()}: ${v}`)
        .join('\n');
    }

    if ((httpMethod === 'POST' || httpMethod === 'PUT') && requestBody !== undefined) {
      options.postData = [
        {
          type: 'rawData',
          bytes: Buffer.from(requestBody, 'utf8'),
        },
      ];
    }

    return options;
  }

  /**
   * Purges Chromium disk & memory cache, Service Workers, CacheStorage, and host DNS resolver cache.
   */
  public static async purgeSessionCache(win: BrowserWindow): Promise<void> {
    if (win.isDestroyed()) return;
    try {
      const ses = win.webContents.session || session.defaultSession;
      await ses.clearCache();
      await ses.clearStorageData({
        storages: ['cachestorage', 'serviceworkers', 'shadercache'],
      });
      if (typeof ses.clearHostResolverCache === 'function') {
        await ses.clearHostResolverCache();
      }
    } catch (err) {
      logger.warn('Watchdog', 'Error purging session cache:', err);
    }
  }

  /**
   * Registers a BrowserWindow with the watchdog service.
   */
  public registerWindow(
    displayId: number,
    win: BrowserWindow,
    targetUrl: string,
    fallbackUrl?: string,
    reloadIntervalMinutes: number = 60,
    retryIntervalSeconds: number = 10,
    httpMethod: 'GET' | 'POST' | 'PUT' = 'GET',
    headers?: Record<string, string>,
    requestBody?: string
  ): void {
    this.unregisterWindow(displayId);

    const state: DisplayState = {
      displayId,
      window: win,
      targetUrl,
      httpMethod,
      headers,
      requestBody,
      fallbackUrl,
      status: 'loading',
      lastReloadTime: new Date().toISOString(),
      failureCount: 0,
      isResponsive: true,
      retryIntervalSeconds,
      reloadIntervalMinutes,
    };

    this.displayStates.set(displayId, state);
    this.attachEventListeners(state);
    this.scheduleCacheReload(state);

    logger.info('Watchdog', `Registered display #${displayId} [Target: ${httpMethod} ${targetUrl}, ReloadInterval: ${reloadIntervalMinutes}m]`);
  }

  /**
   * Unregisters and cleans up timers for a given display.
   */
  public unregisterWindow(displayId: number): void {
    const state = this.displayStates.get(displayId);
    if (!state) return;

    if (state.retryTimer) clearTimeout(state.retryTimer);
    if (state.cacheReloadTimer) clearInterval(state.cacheReloadTimer);
    if (state.unresponsiveTimer) clearTimeout(state.unresponsiveTimer);

    this.displayStates.delete(displayId);
    logger.info('Watchdog', `Unregistered display #${displayId}`);
  }

  private attachEventListeners(state: DisplayState): void {
    const { window: win, displayId } = state;
    const contents = win.webContents;

    // 1. Did start loading
    contents.on('did-start-loading', () => {
      state.status = 'loading';
    });

    // 2. Did finish loading successfully
    contents.on('did-finish-load', () => {
      state.status = 'active';
      state.failureCount = 0;
      state.lastReloadTime = new Date().toISOString();
      if (state.retryTimer) {
        clearTimeout(state.retryTimer);
        state.retryTimer = undefined;
      }
      logger.info('Watchdog', `Display #${displayId} successfully loaded ${state.targetUrl}`);
    });

    // 3. Intercept failed loads (did-fail-load and did-fail-provisional-load)
    contents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      // Error code -3 is ERR_ABORTED (usually triggered by client redirects or stopped navigation)
      if (errorCode === -3) {
        logger.debug('Watchdog', `Display #${displayId} load aborted (ERR_ABORTED), ignoring.`);
        return;
      }
      this.handleLoadFailure(state, errorCode, errorDescription, validatedURL);
    });

    contents.on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL, isMainFrame) => {
      if (!isMainFrame) return;
      if (errorCode === -3) return;
      this.handleLoadFailure(state, errorCode, errorDescription, validatedURL);
    });

    // 4. Watchdog: Renderer Unresponsive
    contents.on('unresponsive', () => {
      logger.warn('Watchdog', `Display #${displayId} renderer became UNRESPONSIVE`);
      state.isResponsive = false;
      state.status = 'unresponsive';

      // Set grace timer before forcing reload
      if (!state.unresponsiveTimer) {
        state.unresponsiveTimer = setTimeout(() => {
          logger.error('Watchdog', `Display #${displayId} unresponsive timeout reached (15s). Forcing reload.`);
          try {
            win.webContents.forcefullyCrashRenderer();
          } catch {
            this.reloadDisplay(displayId, true);
          }
        }, 15000);
      }
    });

    contents.on('responsive', () => {
      logger.info('Watchdog', `Display #${displayId} renderer is responsive again.`);
      state.isResponsive = true;
      state.status = 'active';
      if (state.unresponsiveTimer) {
        clearTimeout(state.unresponsiveTimer);
        state.unresponsiveTimer = undefined;
      }
    });

    // 5. Watchdog: Render process crashed / gone
    contents.on('render-process-gone', (event, details) => {
      logger.error('Watchdog', `Display #${displayId} render process gone: reason=${details.reason}, exitCode=${details.exitCode}`);
      state.status = 'error';

      if (this.onCrashCallback) {
        logger.info('Watchdog', `Attempting auto-recovery for crashed display #${displayId}...`);
        setTimeout(() => {
          if (this.onCrashCallback) {
            this.onCrashCallback(displayId);
          }
        }, 2000);
      } else {
        setTimeout(() => {
          if (!win.isDestroyed()) {
            this.reloadDisplay(displayId, true);
          }
        }, 2000);
      }
    });
  }

  /**
   * Handles network / loading errors by redirecting to offline.html with countdown parameters.
   */
  private handleLoadFailure(state: DisplayState, errorCode: number, errorDesc: string, url: string): void {
    state.failureCount++;
    state.status = 'offline';
    logger.warn('Watchdog', `Display #${state.displayId} failed to load "${url}" [code: ${errorCode}, error: ${errorDesc}, attempt: ${state.failureCount}]`);

    const offlinePath = path.join(__dirname, '..', 'renderer', 'offline.html');
    const queryParams = new URLSearchParams({
      displayId: String(state.displayId),
      targetUrl: state.targetUrl,
      errorCode: String(errorCode),
      errorDesc: errorDesc || 'Network error or host unreachable',
      retrySeconds: String(state.retryIntervalSeconds),
      attempt: String(state.failureCount),
    });

    const offlineUrlWithParams = `file://${offlinePath}?${queryParams.toString()}`;

    if (!state.window.isDestroyed()) {
      state.window.loadURL(offlineUrlWithParams).catch((err) => {
        logger.error('Watchdog', `Failed to load offline fallback UI for display #${state.displayId}:`, err);
      });
    }

    // Schedule next retry
    if (state.retryTimer) clearTimeout(state.retryTimer);
    state.retryTimer = setTimeout(() => {
      this.retryDisplay(state.displayId);
    }, state.retryIntervalSeconds * 1000);
  }

  /**
   * Retries loading the target URL for a given display.
   */
  public retryDisplay(displayId: number): void {
    const state = this.displayStates.get(displayId);
    if (!state || state.window.isDestroyed()) return;

    if (state.retryTimer) {
      clearTimeout(state.retryTimer);
      state.retryTimer = undefined;
    }

    logger.info('Watchdog', `Retrying load for display #${displayId}: [${state.httpMethod || 'GET'}] ${state.targetUrl}`);
    state.status = 'loading';
    const loadOptions = WatchdogService.buildLoadOptions(state.httpMethod, state.headers, state.requestBody, true);
    state.window.loadURL(state.targetUrl, loadOptions).catch((err) => {
      logger.warn('Watchdog', `Retry load failed for display #${displayId}:`, err);
    });
  }

  /**
   * Sets up periodic forced memory/disk cache purge & hard reload to prevent Chromium memory leaks
   * and ensure the display always runs the latest version of the target web application.
   */
  private scheduleCacheReload(state: DisplayState): void {
    if (state.cacheReloadTimer) {
      clearInterval(state.cacheReloadTimer);
      state.cacheReloadTimer = undefined;
    }

    if (state.reloadIntervalMinutes <= 0) {
      logger.info('Watchdog', `Periodic cache reload is disabled (0 mins) for display #${state.displayId}`);
      return;
    }

    const intervalMs = state.reloadIntervalMinutes * 60 * 1000;
    logger.info('Watchdog', `Scheduled forced cache purge & full reload every ${state.reloadIntervalMinutes} minutes for display #${state.displayId}`);

    state.cacheReloadTimer = setInterval(async () => {
      if (state.window.isDestroyed()) return;
      logger.info('Watchdog', `Executing scheduled forced full reload with cache purge for display #${state.displayId} (Interval: ${state.reloadIntervalMinutes}m)`);
      await this.reloadDisplay(state.displayId, true);
    }, intervalMs);
  }

  /**
   * Executes a forced full reload for a specific display with optional complete cache purge.
   * Uses hard cache-busting headers and webContents.reloadIgnoringCache() to ensure latest version.
   */
  public async reloadDisplay(displayId: number, clearCache: boolean = true): Promise<boolean> {
    const state = this.displayStates.get(displayId);
    if (!state || state.window.isDestroyed()) return false;

    logger.info('Watchdog', `Forced reload initiated for display #${displayId} (clearCache=${clearCache}) -> [${state.httpMethod || 'GET'}] ${state.targetUrl}`);
    state.status = 'loading';

    if (clearCache) {
      await WatchdogService.purgeSessionCache(state.window);
    }

    state.lastReloadTime = new Date().toISOString();

    const loadOptions = WatchdogService.buildLoadOptions(
      state.httpMethod,
      state.headers,
      state.requestBody,
      true
    );

    // If currently on target URL with standard GET and no custom body, use reloadIgnoringCache for hard reload
    const currentUrl = state.window.webContents.getURL();
    const isTargetUrl = currentUrl && currentUrl.startsWith(state.targetUrl.split('?')[0]);
    const isStandardGet = (!state.httpMethod || state.httpMethod === 'GET') && (!state.headers || Object.keys(state.headers).length === 0) && !state.requestBody;

    if (isTargetUrl && isStandardGet) {
      try {
        state.window.webContents.reloadIgnoringCache();
        return true;
      } catch (err) {
        logger.warn('Watchdog', `reloadIgnoringCache failed for display #${displayId}, falling back to loadURL:`, err);
      }
    }

    state.window.loadURL(state.targetUrl, loadOptions).catch((err) => {
      logger.warn('Watchdog', `Forced reload loadURL failed for display #${displayId}:`, err);
    });

    return true;
  }

  /**
   * Triggers immediate forced full reload with cache purge for all active displays.
   */
  public async reloadAll(clearCache: boolean = true): Promise<void> {
    logger.info('Watchdog', `Forced full reload triggered for ALL displays (clearCache=${clearCache})`);
    const promises = Array.from(this.displayStates.keys()).map((id) =>
      this.reloadDisplay(id, clearCache)
    );
    await Promise.all(promises);
  }

  /**
   * Updates display configuration (URL, reload interval, retry interval, headers, etc.)
   * and dynamically re-arms scheduled reload timers without restarting the window.
   */
  public updateDisplayConfig(
    displayId: number,
    options: {
      targetUrl?: string;
      fallbackUrl?: string;
      reloadIntervalMinutes?: number;
      retryIntervalSeconds?: number;
      httpMethod?: 'GET' | 'POST' | 'PUT';
      headers?: Record<string, string>;
      requestBody?: string;
      reloadNow?: boolean;
    }
  ): boolean {
    const state = this.displayStates.get(displayId);
    if (!state) return false;

    if (options.targetUrl) {
      state.targetUrl = options.targetUrl;
      state.failureCount = 0;
    }
    if (options.fallbackUrl !== undefined) state.fallbackUrl = options.fallbackUrl;
    if (options.httpMethod) state.httpMethod = options.httpMethod;
    if (options.headers !== undefined) state.headers = options.headers;
    if (options.requestBody !== undefined) state.requestBody = options.requestBody;
    if (options.retryIntervalSeconds !== undefined) state.retryIntervalSeconds = options.retryIntervalSeconds;

    let intervalChanged = false;
    if (options.reloadIntervalMinutes !== undefined && options.reloadIntervalMinutes !== state.reloadIntervalMinutes) {
      state.reloadIntervalMinutes = options.reloadIntervalMinutes;
      intervalChanged = true;
    }

    if (intervalChanged) {
      this.scheduleCacheReload(state);
    }

    if (options.reloadNow && !state.window.isDestroyed()) {
      this.reloadDisplay(displayId, true);
    }

    return true;
  }

  /**
   * Updates target URL and optional HTTP request settings for a display.
   */
  public updateTargetUrl(
    displayId: number,
    newUrl: string,
    reloadNow: boolean = true,
    httpMethod?: 'GET' | 'POST' | 'PUT',
    headers?: Record<string, string>,
    requestBody?: string
  ): boolean {
    return this.updateDisplayConfig(displayId, {
      targetUrl: newUrl,
      reloadNow,
      httpMethod,
      headers,
      requestBody,
    });
  }

  /**
   * Returns current snapshot of all display states.
   */
  public getStates(): DisplayState[] {
    return Array.from(this.displayStates.values());
  }

  public getState(displayId: number): DisplayState | undefined {
    return this.displayStates.get(displayId);
  }
}

export const watchdogService = new WatchdogService();
