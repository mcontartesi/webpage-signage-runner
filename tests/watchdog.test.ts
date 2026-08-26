import { describe, it, expect, vi } from 'vitest';
import { WatchdogService } from '../src/main/watchdog';

describe('WatchdogService Forced Full Reload & Cache Purge', () => {
  it('should build load options with cache-busting headers when forceCacheBusting is true', () => {
    const options = WatchdogService.buildLoadOptions('GET', { 'X-Custom': 'test' }, undefined, true);
    expect(options.extraHeaders).toBeDefined();
    expect(options.extraHeaders).toContain('X-Custom: test');
    expect(options.extraHeaders).toContain('Pragma: no-cache');
    expect(options.extraHeaders).toContain('Cache-Control: no-cache, no-store, must-revalidate');
  });

  it('should build load options without cache-busting headers when forceCacheBusting is false', () => {
    const options = WatchdogService.buildLoadOptions('GET', { 'X-Custom': 'test' }, undefined, false);
    expect(options.extraHeaders).toBe('X-Custom: test');
    expect(options.extraHeaders).not.toContain('Pragma: no-cache');
  });

  it('should correctly include POST payload and cache-busting headers', () => {
    const options = WatchdogService.buildLoadOptions('POST', {}, '{"refresh": true}', true);
    expect(options.extraHeaders).toContain('Pragma: no-cache');
    expect(options.extraHeaders).toContain('Cache-Control: no-cache, no-store, must-revalidate');
    expect(options.postData).toBeDefined();
    expect(options.postData?.[0].type).toBe('rawData');
    expect(options.postData?.[0].bytes.toString('utf8')).toBe('{"refresh": true}');
  });

  it('should manage and register display states with default 60 minute reload interval', () => {
    const watchdog = new WatchdogService();
    const mockWindow: any = {
      isDestroyed: () => false,
      webContents: {
        on: vi.fn(),
        session: {
          clearCache: vi.fn().mockResolvedValue(undefined),
          clearStorageData: vi.fn().mockResolvedValue(undefined),
          clearHostResolverCache: vi.fn().mockResolvedValue(undefined),
        },
        getURL: () => 'https://www.youtube.com',
        reloadIgnoringCache: vi.fn(),
      },
      loadURL: vi.fn().mockResolvedValue(undefined),
    };

    watchdog.registerWindow(
      1,
      mockWindow,
      'https://www.youtube.com',
      undefined,
      60,
      10,
      'GET'
    );

    const state = watchdog.getState(1);
    expect(state).toBeDefined();
    expect(state?.displayId).toBe(1);
    expect(state?.targetUrl).toBe('https://www.youtube.com');
    expect(state?.reloadIntervalMinutes).toBe(60);
    expect(state?.retryIntervalSeconds).toBe(10);
    expect(state?.cacheReloadTimer).toBeDefined();

    watchdog.unregisterWindow(1);
    expect(watchdog.getState(1)).toBeUndefined();
  });

  it('should execute reloadIgnoringCache on standard GET when display is already on targetUrl', async () => {
    const watchdog = new WatchdogService();
    const reloadIgnoringCacheMock = vi.fn();
    const clearCacheMock = vi.fn().mockResolvedValue(undefined);
    const clearStorageDataMock = vi.fn().mockResolvedValue(undefined);
    const clearHostResolverCacheMock = vi.fn().mockResolvedValue(undefined);

    const mockWindow: any = {
      isDestroyed: () => false,
      webContents: {
        on: vi.fn(),
        session: {
          clearCache: clearCacheMock,
          clearStorageData: clearStorageDataMock,
          clearHostResolverCache: clearHostResolverCacheMock,
        },
        getURL: () => 'https://www.youtube.com',
        reloadIgnoringCache: reloadIgnoringCacheMock,
      },
      loadURL: vi.fn().mockResolvedValue(undefined),
    };

    watchdog.registerWindow(2, mockWindow, 'https://www.youtube.com', undefined, 60, 10, 'GET');

    const success = await watchdog.reloadDisplay(2, true);
    expect(success).toBe(true);
    expect(clearCacheMock).toHaveBeenCalled();
    expect(clearStorageDataMock).toHaveBeenCalledWith({
      storages: ['cachestorage', 'serviceworkers', 'shadercache'],
    });
    expect(clearHostResolverCacheMock).toHaveBeenCalled();
    expect(reloadIgnoringCacheMock).toHaveBeenCalled();

    watchdog.unregisterWindow(2);
  });

  it('should dynamically update display config and reset scheduled reload timer', () => {
    const watchdog = new WatchdogService();
    const mockWindow: any = {
      isDestroyed: () => false,
      webContents: {
        on: vi.fn(),
        session: {
          clearCache: vi.fn().mockResolvedValue(undefined),
          clearStorageData: vi.fn().mockResolvedValue(undefined),
          clearHostResolverCache: vi.fn().mockResolvedValue(undefined),
        },
        getURL: () => 'https://app.local',
        reloadIgnoringCache: vi.fn(),
      },
      loadURL: vi.fn().mockResolvedValue(undefined),
    };

    watchdog.registerWindow(3, mockWindow, 'https://app.local', undefined, 60, 10, 'GET');
    const oldTimer = watchdog.getState(3)?.cacheReloadTimer;

    // Update reload interval to 30 minutes
    const updated = watchdog.updateDisplayConfig(3, {
      reloadIntervalMinutes: 30,
      targetUrl: 'https://app.local/v2',
    });

    expect(updated).toBe(true);
    const state = watchdog.getState(3);
    expect(state?.reloadIntervalMinutes).toBe(30);
    expect(state?.targetUrl).toBe('https://app.local/v2');
    expect(state?.cacheReloadTimer).not.toBe(oldTimer);

    watchdog.unregisterWindow(3);
  });
});
