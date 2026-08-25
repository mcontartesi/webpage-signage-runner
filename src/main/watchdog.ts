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
  public static buildLoadOptions(
    httpMethod?: 'GET' | 'POST' | 'PUT',
    headers?: Record<string, string>,
    requestBody?: string
  ): { extraHeaders?: string; postData?: Array<{ type: 'rawData'; bytes: Buffer }> } {
    const options: { extraHeaders?: string; postData?: Array<{ type: 'rawData'; bytes: Buffer }> } = {};

    if (headers && Object.keys(headers).length > 0) {
      options.extraHeaders = Object.entries(headers)
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

    logger.info('Watchdog', `Registered display #${displayId} [Target: ${httpMethod} ${targetUrl}]`);
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
            win.reload();
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
            win.reload();
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
    const loadOptions = WatchdogService.buildLoadOptions(state.httpMethod, state.headers, state.requestBody);
    state.window.loadURL(state.targetUrl, loadOptions).catch((err) => {
      logger.warn('Watchdog', `Retry load failed for display #${displayId}:`, err);
    });
  }

  /**
   * Sets up periodic memory cache purge & reload to prevent Chromium memory leaks.
   */
  private scheduleCacheReload(state: DisplayState): void {
    if (state.reloadIntervalMinutes <= 0) return;

    if (state.cacheReloadTimer) {
      clearInterval(state.cacheReloadTimer);
    }

    const intervalMs = state.reloadIntervalMinutes * 60 * 1000;
    state.cacheReloadTimer = setInterval(async () => {
      if (state.window.isDestroyed()) return;

      logger.info('Watchdog', `Executing scheduled cache clear and reload for display #${state.displayId}`);
      try {
        const ses = state.window.webContents.session || session.defaultSession;
        await ses.clearCache();
        await ses.clearStorageData({ storages: ['cachestorage'] });
      } catch (err) {
        logger.warn('Watchdog', `Failed to purge cache for display #${state.displayId}:`, err);
      }

      state.lastReloadTime = new Date().toISOString();
      const loadOptions = WatchdogService.buildLoadOptions(state.httpMethod, state.headers, state.requestBody);
      state.window.loadURL(state.targetUrl, loadOptions).catch(() => {});
    }, intervalMs);
  }

  /**
   * Triggers immediate reload for a specific display.
   */
  public async reloadDisplay(displayId: number, clearCache: boolean = true): Promise<boolean> {
    const state = this.displayStates.get(displayId);
    if (!state || state.window.isDestroyed()) return false;

    logger.info('Watchdog', `Manual reload triggered for display #${displayId} (clearCache=${clearCache})`);
    if (clearCache) {
      try {
        const ses = state.window.webContents.session || session.defaultSession;
        await ses.clearCache();
      } catch {}
    }

    state.lastReloadTime = new Date().toISOString();
    const loadOptions = WatchdogService.buildLoadOptions(state.httpMethod, state.headers, state.requestBody);
    state.window.loadURL(state.targetUrl, loadOptions).catch(() => {});
    return true;
  }

  /**
   * Triggers immediate reload for all active displays.
   */
  public async reloadAll(clearCache: boolean = true): Promise<void> {
    logger.info('Watchdog', `Manual reload triggered for ALL displays (clearCache=${clearCache})`);
    const promises = Array.from(this.displayStates.keys()).map((id) =>
      this.reloadDisplay(id, clearCache)
    );
    await Promise.all(promises);
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
    const state = this.displayStates.get(displayId);
    if (!state) return false;

    state.targetUrl = newUrl;
    state.failureCount = 0;
    if (httpMethod) state.httpMethod = httpMethod;
    if (headers !== undefined) state.headers = headers;
    if (requestBody !== undefined) state.requestBody = requestBody;

    if (reloadNow && !state.window.isDestroyed()) {
      const loadOptions = WatchdogService.buildLoadOptions(state.httpMethod, state.headers, state.requestBody);
      state.window.loadURL(newUrl, loadOptions).catch(() => {});
    }
    return true;
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
