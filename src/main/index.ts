import { app, powerSaveBlocker, globalShortcut, ipcMain, shell, net } from 'electron';
import { CHROMIUM_FLAGS, DEFAULT_EMERGENCY_SHORTCUTS, APP_TITLE, APP_NAME, APP_VERSION } from '../common/constants';
import { IPC_CHANNELS, SignageConfig, SaveConfigRequest, ActionResponse } from '../common/types';
import { logger } from './logger';
import { configManager } from './config';
import { windowManager } from './window-manager';
import { watchdogService } from './watchdog';
import { httpServer } from './server';
import { autostartManager } from './autostart';

// Explicitly set application name for consistent userData paths and Windows taskbar/shortcuts
app.name = APP_NAME;

// Apply Chromium performance, video autoplay, touch & kiosk command line flags
for (const flag of CHROMIUM_FLAGS) {
  if (flag.includes('=')) {
    const [key, value] = flag.split('=');
    app.commandLine.appendSwitch(key.replace(/^--/, ''), value);
  } else {
    app.commandLine.appendSwitch(flag.replace(/^--/, ''));
  }
}

// Handle termination signals (Ctrl+C from console, task managers, shutdown)
const handleProcessTermination = (signal: string) => {
  logger.info('Main', `Received termination signal ${signal}. Quitting application cleanly.`);
  app.quit();
};

process.on('SIGINT', () => handleProcessTermination('SIGINT'));
process.on('SIGTERM', () => handleProcessTermination('SIGTERM'));
process.on('SIGBREAK', () => handleProcessTermination('SIGBREAK'));
process.on('SIGHUP', () => handleProcessTermination('SIGHUP'));

// On Windows, hook readline for console Ctrl+C if standard input is a TTY
if (process.platform === 'win32' && process.stdin.isTTY) {
  try {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.on('SIGINT', () => {
      handleProcessTermination('SIGINT (readline)');
    });
  } catch {}
}

// Ensure single instance lock for unattended kiosk operation
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.warn('Main', 'Another instance of Webpage Signage Runner is already running. Exiting.');
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  logger.info('Main', 'Second instance launch detected. Focusing setup or reopening interface.');
  windowManager.openSetupWindow();
});

// Structured global exception and rejection catching
process.on('uncaughtException', (error) => {
  logger.error('Main:UncaughtException', error.message, error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Main:UnhandledRejection', `Promise rejection: ${String(reason)}`, { promise });
});

let powerSaveBlockerId: number | null = null;

function registerGlobalShortcuts(config: SignageConfig): void {
  globalShortcut.unregisterAll();

  const shortcuts = [
    config.emergencyShortcut || 'CommandOrControl+Shift+C',
    ...DEFAULT_EMERGENCY_SHORTCUTS,
  ];

  const uniqueShortcuts = Array.from(new Set(shortcuts));

  for (const shortcut of uniqueShortcuts) {
    try {
      const registered = globalShortcut.register(shortcut, () => {
        logger.info('Shortcuts', `Emergency setup shortcut triggered: ${shortcut}`);
        windowManager.openSetupWindow();
      });

      if (registered) {
        logger.info('Shortcuts', `Registered emergency shortcut: ${shortcut}`);
      } else {
        logger.warn('Shortcuts', `Failed to register emergency shortcut: ${shortcut}`);
      }
    } catch (err) {
      logger.error('Shortcuts', `Error registering shortcut ${shortcut}:`, err);
    }
  }
}

function registerIpcHandlers(): void {
  // 1. Get current config
  ipcMain.handle(IPC_CHANNELS.GET_CONFIG, () => {
    return configManager.get();
  });

  // 2. Save config from setup UI
  ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, async (_event, payload: SaveConfigRequest): Promise<ActionResponse> => {
    try {
      logger.info('IPC', 'Received save configuration request from UI');
      const saved = configManager.save(payload.config);

      // Handle autostart configuration
      if (saved.autoStartOnBoot !== undefined) {
        autostartManager.setAutostart(saved.autoStartOnBoot);
      }

      // Re-register emergency shortcuts in case key was updated
      registerGlobalShortcuts(saved);

      // Start / restart HTTP API server with new config
      httpServer.start(saved);

      if (payload.launchKioskImmediately) {
        logger.info('IPC', 'Launching kiosk mode immediately after configuration save');
        windowManager.launchKiosk();
      }

      return { success: true, message: 'Configuration saved successfully', data: saved };
    } catch (err: any) {
      logger.error('IPC', 'Failed to save configuration:', err);
      return { success: false, error: err.message || 'Validation or disk write error' };
    }
  });

  // 3. Get connected displays info
  ipcMain.handle(IPC_CHANNELS.GET_DISPLAYS, () => {
    return windowManager.getDisplaysInfo();
  });

  // 4. Identify displays visually with flashing badges
  ipcMain.handle(IPC_CHANNELS.IDENTIFY_DISPLAYS, () => {
    windowManager.identifyDisplays();
    return { success: true };
  });

  // 5. Test target URL connectivity
  ipcMain.handle(IPC_CHANNELS.TEST_URL, async (_event, urlToTest: string): Promise<ActionResponse<{ status: number; ok: boolean }>> => {
    return new Promise((resolve) => {
      try {
        const parsed = new URL(urlToTest);
        const request = net.request({
          method: 'HEAD',
          url: parsed.href,
        });

        const timeout = setTimeout(() => {
          request.abort();
          resolve({ success: false, error: 'Connection timed out (5s)' });
        }, 5000);

        request.on('response', (response) => {
          clearTimeout(timeout);
          resolve({
            success: response.statusCode >= 200 && response.statusCode < 400,
            data: { status: response.statusCode, ok: response.statusCode >= 200 && response.statusCode < 400 },
          });
        });

        request.on('error', (err) => {
          clearTimeout(timeout);
          resolve({ success: false, error: err.message || 'Network request failed' });
        });

        request.end();
      } catch (err: any) {
        resolve({ success: false, error: err.message || 'Invalid URL format' });
      }
    });
  });

  // 6. Open logs folder
  ipcMain.handle(IPC_CHANNELS.OPEN_LOGS_FOLDER, async () => {
    try {
      await shell.openPath(logger.getLogDir());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // 7. Restart application
  ipcMain.handle(IPC_CHANNELS.RESTART_APP, () => {
    logger.info('Main', 'Restart application requested via IPC');
    app.relaunch();
    app.quit();
  });

  // 8. Close setup & launch kiosk
  ipcMain.handle(IPC_CHANNELS.CLOSE_SETUP, () => {
    windowManager.launchKiosk();
    return { success: true };
  });

  // 9. Retry display load
  ipcMain.handle(IPC_CHANNELS.RETRY_DISPLAY, (_event, displayId: number) => {
    watchdogService.retryDisplay(displayId);
    return { success: true };
  });

  // 10. Force reload specific display (with cache clearing)
  ipcMain.handle(IPC_CHANNELS.RELOAD_DISPLAY, async (_event, displayId: number, clearCache: boolean = true) => {
    const success = await watchdogService.reloadDisplay(displayId, clearCache);
    return {
      success,
      message: success ? `Display #${displayId} reloaded successfully` : `Display #${displayId} not found`,
    };
  });

  // 11. Force reload all active displays (with cache clearing)
  ipcMain.handle(IPC_CHANNELS.RELOAD_ALL, async (_event, clearCache: boolean = true) => {
    await watchdogService.reloadAll(clearCache);
    return { success: true, message: 'All displays reloaded successfully' };
  });

  // 12. Quit application cleanly
  ipcMain.handle(IPC_CHANNELS.QUIT_APP, () => {
    logger.info('Main', 'Quit application requested via IPC');
    app.quit();
    return { success: true };
  });
}

// App Initialization
app.whenReady().then(() => {
  logger.info('Main', `Starting ${APP_TITLE} v${APP_VERSION} on ${process.platform} (${process.arch})`);

  // Prevent display sleep & system standby in unattended kiosk environments
  try {
    powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
    logger.info('Main', `Power save blocker active (ID: ${powerSaveBlockerId}) - Display sleep prevented.`);
  } catch (err) {
    logger.warn('Main', 'Failed to start powerSaveBlocker:', err);
  }

  // Register screen event listeners for hotplugging
  windowManager.initScreenListeners();

  // Register IPC handlers
  registerIpcHandlers();

  // Check if configuration exists
  const hasConfig = configManager.hasConfigFile();
  const config = configManager.get();

  registerGlobalShortcuts(config);

  if (!hasConfig) {
    logger.info('Main', 'First-run detected (no config.json). Opening Setup Wizard.');
    windowManager.openSetupWindow();
  } else {
    logger.info('Main', 'Existing configuration found. Launching Kiosk and Control API.');
    httpServer.start(config);
    windowManager.launchKiosk();
  }
});

app.on('window-all-closed', () => {
  // In unattended kiosk mode, do not quit if all displays are active or reloading
  // If explicitly closed in development or non-kiosk, stay alive or quit cleanly
  if (process.platform !== 'darwin' && !configManager.hasConfigFile()) {
    app.quit();
  }
});

app.on('will-quit', () => {
  logger.info('Main', 'Application shutting down cleanly...');
  globalShortcut.unregisterAll();
  httpServer.stop();

  if (powerSaveBlockerId !== null && powerSaveBlocker.isStarted(powerSaveBlockerId)) {
    powerSaveBlocker.stop(powerSaveBlockerId);
  }
});
