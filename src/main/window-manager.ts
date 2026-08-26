import { app, screen, BrowserWindow, Display } from 'electron';
import * as path from 'path';
import { SignageConfig, RuntimeDisplayInfo, DisplayConfig, SystemStatusResponse } from '../common/types';
import { logger } from './logger';
import { configManager } from './config';
import { WatchdogService, watchdogService } from './watchdog';

export class WindowManager {
  private kioskWindows: Map<number, BrowserWindow> = new Map();
  private identifyWindows: Map<number, BrowserWindow> = new Map();
  private setupWindow: BrowserWindow | null = null;
  private isKioskActive: boolean = false;

  constructor() {
    // Register crash recovery handler with watchdog
    watchdogService.setCrashRecoveryHandler((displayId) => {
      this.recoverDisplayWindow(displayId);
    });
  }

  /**
   * Initializes listeners for display hotplugging and resolution changes.
   */
  public initScreenListeners(): void {
    screen.on('display-added', (_event, newDisplay) => {
      logger.info('WindowManager', `Display connected: ID ${newDisplay.id} [${newDisplay.bounds.width}x${newDisplay.bounds.height}]`);
      if (this.isKioskActive) {
        this.createKioskWindowForDisplay(newDisplay);
      }
    });

    screen.on('display-removed', (_event, oldDisplay) => {
      logger.info('WindowManager', `Display disconnected: ID ${oldDisplay.id}`);
      this.closeKioskWindowForDisplay(oldDisplay.id);
    });

    screen.on('display-metrics-changed', (_event, display, changedMetrics) => {
      logger.info('WindowManager', `Display #${display.id} metrics changed: ${changedMetrics.join(', ')}`);
      const win = this.kioskWindows.get(display.id);
      if (win && !win.isDestroyed()) {
        win.setBounds(display.bounds);
      }
    });
  }

  /**
   * Starts multi-display kiosk mode across all available physical screens.
   */
  public launchKiosk(): void {
    logger.info('WindowManager', 'Launching Multi-Display Kiosk Engine...');
    this.isKioskActive = true;

    // Close setup window if open
    if (this.setupWindow && !this.setupWindow.isDestroyed()) {
      this.setupWindow.close();
      this.setupWindow = null;
    }

    const displays = screen.getAllDisplays();
    logger.info('WindowManager', `Detected ${displays.length} physical display(s).`);

    // Clean up any stale windows
    for (const [id, win] of this.kioskWindows) {
      if (!displays.some((d) => d.id === id)) {
        this.closeKioskWindowForDisplay(id);
      }
    }

    displays.forEach((display, index) => {
      this.createKioskWindowForDisplay(display, index);
    });
  }

  /**
   * Creates and pins a borderless fullscreen kiosk window to a specific physical display.
   */
  public createKioskWindowForDisplay(display: Display, displayIndex?: number): BrowserWindow {
    // If window already exists for this display, reuse/update it
    let win = this.kioskWindows.get(display.id);
    if (win && !win.isDestroyed()) {
      win.setBounds(display.bounds);
      return win;
    }

    const displays = screen.getAllDisplays();
    const index = displayIndex !== undefined ? displayIndex : displays.findIndex((d) => d.id === display.id);
    const isPrimary = display.id === screen.getPrimaryDisplay().id;

    const config = configManager.get();
    const displayConf = configManager.getDisplayConfig(display.id, {
      displayIndex: index >= 0 ? index : undefined,
      isPrimary,
      bounds: display.bounds,
    });

    if (!displayConf.enabled) {
      logger.info('WindowManager', `Display #${display.id} is disabled in config. Skipping.`);
      return null as any;
    }

    const preloadPath = path.join(__dirname, '..', 'preload', 'index.js');

    win = new BrowserWindow({
      x: display.bounds.x,
      y: display.bounds.y,
      width: display.bounds.width,
      height: display.bounds.height,
      kiosk: true,
      fullscreen: true,
      alwaysOnTop: true,
      frame: false,
      autoHideMenuBar: true,
      backgroundColor: '#000000',
      skipTaskbar: true,
      enableLargerThanScreen: true,
      show: false,
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        autoplayPolicy: 'no-user-gesture-required',
        backgroundThrottling: false,
        partition: displayConf.partition || undefined,
      },
    });

    // Handle kiosk keyboard shortcuts (Ctrl+C, Ctrl+Q, Cmd+Q to quit, Ctrl+Shift+C for Setup)
    win.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown') {
        const isCtrlOrCmd = input.control || input.meta;
        const key = input.key.toLowerCase();

        // Emergency Quit on Ctrl+C, Ctrl+Q, Cmd+Q, Ctrl+W
        if (isCtrlOrCmd && !input.shift && (key === 'c' || key === 'q' || key === 'w')) {
          event.preventDefault();
          logger.info('WindowManager', `Quit shortcut triggered in kiosk window (${isCtrlOrCmd ? 'Ctrl' : ''}+${key.toUpperCase()}). Quitting.`);
          app.quit();
          return;
        }

        // Emergency setup hotkey (Ctrl+Shift+C or Ctrl+Alt+S)
        if ((isCtrlOrCmd && input.shift && key === 'c') || (isCtrlOrCmd && input.alt && key === 's')) {
          event.preventDefault();
          logger.info('WindowManager', `Emergency setup hotkey triggered in kiosk window (${input.key}).`);
          this.openSetupWindow();
          return;
        }
      }
    });

    // Explicitly pin bounds and kiosk state
    win.setBounds(display.bounds);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setFullScreen(true);

    const targetUrl = displayConf.url || config.defaultUrl;

    // Apply zoom factor and mouse suppression on DOM ready
    const applyStyling = () => {
      if (!win || win.isDestroyed()) return;
      if (displayConf.zoomFactor && displayConf.zoomFactor !== 1.0) {
        win.webContents.setZoomFactor(displayConf.zoomFactor);
      }
      if (displayConf.hideCursor) {
        win.webContents.insertCSS('* { cursor: none !important; }').catch(() => {});
      }
    };

    win.webContents.on('dom-ready', applyStyling);
    win.webContents.on('did-finish-load', applyStyling);

    if (displayConf.userAgent) {
      win.webContents.setUserAgent(displayConf.userAgent);
    }

    // Register with watchdog
    watchdogService.registerWindow(
      display.id,
      win,
      targetUrl,
      displayConf.fallbackUrl,
      displayConf.reloadIntervalMinutes,
      displayConf.retryIntervalSeconds,
      displayConf.httpMethod || 'GET',
      displayConf.headers,
      displayConf.requestBody
    );

    win.once('ready-to-show', () => {
      if (!win.isDestroyed()) {
        win.show();
        win.focus();
      }
    });

    win.on('closed', () => {
      this.kioskWindows.delete(display.id);
      watchdogService.unregisterWindow(display.id);
    });

    // Initial load
    logger.info('WindowManager', `Loading display #${display.id} [${display.bounds.width}x${display.bounds.height}] -> [${displayConf.httpMethod || 'GET'}] ${targetUrl}`);
    const loadOptions = WatchdogService.buildLoadOptions(displayConf.httpMethod, displayConf.headers, displayConf.requestBody);
    win.loadURL(targetUrl, loadOptions).catch((err) => {
      logger.warn('WindowManager', `Initial load error on display #${display.id}:`, err);
    });

    this.kioskWindows.set(display.id, win);
    return win;
  }

  /**
   * Closes kiosk window for a given display.
   */
  public closeKioskWindowForDisplay(displayId: number): void {
    const win = this.kioskWindows.get(displayId);
    if (win && !win.isDestroyed()) {
      win.close();
    }
    this.kioskWindows.delete(displayId);
    watchdogService.unregisterWindow(displayId);
  }

  /**
   * Recovers a crashed display by recreating its window.
   */
  private recoverDisplayWindow(displayId: number): void {
    const displays = screen.getAllDisplays();
    const targetDisplay = displays.find((d) => d.id === displayId);

    this.closeKioskWindowForDisplay(displayId);

    if (targetDisplay) {
      logger.info('WindowManager', `Re-creating window for crashed display #${displayId}`);
      this.createKioskWindowForDisplay(targetDisplay);
    }
  }

  /**
   * Applies updated configuration to running kiosk displays.
   */
  public applyConfig(newConfig: SignageConfig): void {
    logger.info('WindowManager', 'Applying new configuration to displays...');
    const displays = screen.getAllDisplays();

    for (let i = 0; i < displays.length; i++) {
      const display = displays[i];
      const isPrimary = display.id === screen.getPrimaryDisplay().id;
      const displayConf = configManager.getDisplayConfig(display.id, {
        displayIndex: i,
        isPrimary,
        bounds: display.bounds,
      });
      const win = this.kioskWindows.get(display.id);

      if (!displayConf.enabled) {
        if (win) this.closeKioskWindowForDisplay(display.id);
        continue;
      }

      if (!win || win.isDestroyed()) {
        this.createKioskWindowForDisplay(display, i);
      } else {
        const targetUrl = displayConf.url || newConfig.defaultUrl;
        watchdogService.updateTargetUrl(
          display.id,
          targetUrl,
          true,
          displayConf.httpMethod || 'GET',
          displayConf.headers,
          displayConf.requestBody
        );

        if (displayConf.hideCursor) {
          win.webContents.insertCSS('* { cursor: none !important; }').catch(() => {});
        }
        if (displayConf.zoomFactor) {
          win.webContents.setZoomFactor(displayConf.zoomFactor);
        }
      }
    }
  }

  /**
   * Opens the modern Setup Wizard window.
   */
  public openSetupWindow(): BrowserWindow {
    if (this.setupWindow && !this.setupWindow.isDestroyed()) {
      this.setupWindow.show();
      this.setupWindow.focus();
      return this.setupWindow;
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const preloadPath = path.join(__dirname, '..', 'preload', 'index.js');
    const setupHtmlPath = path.join(__dirname, '..', 'renderer', 'setup.html');

    this.setupWindow = new BrowserWindow({
      width: Math.min(1080, primaryDisplay.workArea.width - 40),
      height: Math.min(780, primaryDisplay.workArea.height - 40),
      center: true,
      frame: false,
      resizable: true,
      minWidth: 800,
      minHeight: 600,
      backgroundColor: '#0f172a',
      title: 'Webpage Signage Runner - Setup Wizard',
      webPreferences: {
        preload: preloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    // Handle setup window keyboard shortcuts (Ctrl+Q to quit)
    this.setupWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown') {
        const isCtrlOrCmd = input.control || input.meta;
        const key = input.key.toLowerCase();

        // Ctrl+Q / Cmd+Q quits application
        if (isCtrlOrCmd && key === 'q') {
          event.preventDefault();
          logger.info('WindowManager', 'Quit shortcut triggered in setup window (Ctrl+Q). Exiting.');
          app.quit();
          return;
        }
      }
    });

    this.setupWindow.loadFile(setupHtmlPath);

    this.setupWindow.on('closed', () => {
      this.setupWindow = null;
    });

    return this.setupWindow;
  }

  /**
   * Flashes prominent display ID overlays across all physical screens.
   */
  public identifyDisplays(): void {
    logger.info('WindowManager', 'Flashing screen identification badges...');

    // Close any previous identify overlays
    for (const [, win] of this.identifyWindows) {
      if (!win.isDestroyed()) win.close();
    }
    this.identifyWindows.clear();

    const displays = screen.getAllDisplays();
    const identifyHtmlPath = path.join(__dirname, '..', 'renderer', 'identify.html');

    displays.forEach((display, index) => {
      const overlay = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        focusable: false,
        hasShadow: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
        },
      });

      overlay.setAlwaysOnTop(true, 'screen-saver');
      overlay.setIgnoreMouseEvents(true);

      const query = new URLSearchParams({
        index: String(index + 1),
        id: String(display.id),
        res: `${display.bounds.width}x${display.bounds.height}`,
        isPrimary: String(display.id === screen.getPrimaryDisplay().id),
      });

      overlay.loadURL(`file://${identifyHtmlPath}?${query.toString()}`);
      this.identifyWindows.set(display.id, overlay);

      // Auto-close after 5 seconds
      setTimeout(() => {
        if (!overlay.isDestroyed()) {
          overlay.close();
        }
        this.identifyWindows.delete(display.id);
      }, 5000);
    });
  }

  public getWindowForDisplay(displayId: number): BrowserWindow | undefined {
    return this.kioskWindows.get(displayId);
  }

  /**
   * Returns display runtime diagnostics snapshot.
   */
  public getDisplaySnapshots(): SystemStatusResponse['displays'] {
    const displays = screen.getAllDisplays();
    const primaryId = screen.getPrimaryDisplay().id;

    return displays.map((d, index) => {
      const isPrimary = d.id === primaryId;
      const state = watchdogService.getState(d.id);
      const conf = configManager.getDisplayConfig(d.id, {
        displayIndex: index,
        isPrimary,
        bounds: d.bounds,
      });

      return {
        id: d.id,
        label: conf.label || `Display ${d.id}`,
        bounds: d.bounds,
        isPrimary,
        currentUrl: state?.targetUrl || conf.url,
        status: state?.status || 'idle',
        lastReload: state?.lastReloadTime || null,
        failureCount: state?.failureCount || 0,
        isResponsive: state?.isResponsive ?? true,
      };
    });
  }

  /**
   * Returns list of displays with full metadata for setup wizard.
   */
  public getDisplaysInfo(): RuntimeDisplayInfo[] {
    const displays = screen.getAllDisplays();
    const primaryId = screen.getPrimaryDisplay().id;

    return displays.map((d, index) => {
      const isPrimary = d.id === primaryId;
      const conf = configManager.getDisplayConfig(d.id, {
        displayIndex: index,
        isPrimary,
        bounds: d.bounds,
      });
      const state = watchdogService.getState(d.id);

      return {
        id: d.id,
        label: conf.label || `Display ${d.id}`,
        bounds: d.bounds,
        workArea: d.workArea,
        scaleFactor: d.scaleFactor,
        rotation: d.rotation,
        isPrimary,
        internal: d.internal,
        configuredUrl: conf.url,
        status: state?.status || 'idle',
        lastReloadTime: state?.lastReloadTime || undefined,
        failureCount: state?.failureCount || 0,
      };
    });
  }
}

export const windowManager = new WindowManager();
