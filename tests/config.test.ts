import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SignageConfigSchema, DisplayConfigSchema } from '../src/common/types';
import { ConfigManager } from '../src/main/config';

describe('ConfigManager & Zod Schema', () => {
  let tempDir: string;
  let tempConfigPath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'signage-test-'));
    tempConfigPath = path.join(tempDir, 'config.json');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should validate valid DisplayConfig with defaults', () => {
    const validDisplay = {
      id: 1,
      url: 'https://www.youtube.com',
      httpMethod: 'POST' as const,
      headers: {
        Authorization: 'Bearer test-token',
        'X-Custom-Secret': 'secret-value',
      },
      requestBody: '{"test": true}',
    };

    const parsed = DisplayConfigSchema.parse(validDisplay);
    expect(parsed.id).toBe(1);
    expect(parsed.url).toBe('https://www.youtube.com');
    expect(parsed.httpMethod).toBe('POST');
    expect(parsed.headers?.Authorization).toBe('Bearer test-token');
    expect(parsed.headers?.['X-Custom-Secret']).toBe('secret-value');
    expect(parsed.requestBody).toBe('{"test": true}');
    expect(parsed.reloadIntervalMinutes).toBe(60);
    expect(parsed.retryIntervalSeconds).toBe(10);
    expect(parsed.hideCursor).toBe(true);
    expect(parsed.zoomFactor).toBe(1.0);
    expect(parsed.enabled).toBe(true);
  });

  it('should reject invalid URL in DisplayConfig', () => {
    const invalidDisplay = {
      id: 1,
      url: 'not-a-valid-url',
    };

    expect(() => DisplayConfigSchema.parse(invalidDisplay)).toThrow();
  });

  it('should validate complete SignageConfigSchema', () => {
    const rawConfig = {
      version: '1.1.2',
      defaultUrl: 'https://www.youtube.com',
      autoStartOnBoot: true,
      api: {
        port: 9191,
      },
      displays: [
        {
          id: 'display-1',
          url: 'https://dashboard.internal',
          reloadIntervalMinutes: 30,
        },
      ],
    };

    const parsed = SignageConfigSchema.parse(rawConfig);
    expect(parsed.version).toBe('1.1.2');
    expect(parsed.api.port).toBe(9191);
    expect(parsed.api.host).toBe('0.0.0.0');
    expect(parsed.displays.length).toBe(1);
    expect(parsed.displays[0].id).toBe('display-1');
    expect(parsed.displays[0].reloadIntervalMinutes).toBe(30);
  });

  it('should save and load configuration atomically', () => {
    const manager = new ConfigManager(tempConfigPath);
    expect(manager.hasConfigFile()).toBe(false);

    manager.save({
      defaultUrl: 'https://google.com',
      displays: [
        {
          id: 1,
          url: 'https://google.com/feed',
          httpMethod: 'GET',
          reloadIntervalMinutes: 45,
          retryIntervalSeconds: 12,
          hideCursor: true,
          zoomFactor: 1.0,
          enabled: true,
        },
      ],
    });

    expect(manager.hasConfigFile()).toBe(true);
    const loaded = manager.load();
    expect(loaded).not.toBeNull();
    expect(loaded?.defaultUrl).toBe('https://google.com');
    expect(loaded?.displays.length).toBe(1);
    expect(loaded?.displays[0].url).toBe('https://google.com/feed');
  });

  it('should update specific display configuration', () => {
    const manager = new ConfigManager(tempConfigPath);
    manager.save({
      defaultUrl: 'https://initial.com',
      displays: [],
    });

    manager.updateDisplayConfig(1, {
      url: 'https://display1.com',
      reloadIntervalMinutes: 15,
    });

    const display1 = manager.getDisplayConfig(1);
    expect(display1.url).toBe('https://display1.com');
    expect(display1.reloadIntervalMinutes).toBe(15);

    // Update existing display
    manager.updateDisplayConfig(1, {
      url: 'https://display1-updated.com',
    });

    const display1Updated = manager.getDisplayConfig(1);
    expect(display1Updated.url).toBe('https://display1-updated.com');
    expect(display1Updated.reloadIntervalMinutes).toBe(15);
  });

  it('should reset configuration correctly', () => {
    const manager = new ConfigManager(tempConfigPath);
    manager.save({ defaultUrl: 'https://test.com' });
    expect(manager.hasConfigFile()).toBe(true);

    manager.reset();
    expect(manager.hasConfigFile()).toBe(false);
  });

  it('should resolve display config across reboots with changed display IDs using smart matching', () => {
    const manager = new ConfigManager(tempConfigPath);
    // User configured display with ID 2528732487 (Windows runtime ID on session 1)
    manager.save({
      defaultUrl: 'https://youtube.com',
      displays: [
        {
          id: 2528732487,
          displayIndex: 0,
          isPrimary: true,
          bounds: { x: 0, y: 0, width: 1920, height: 1080 },
          url: 'https://custom-signage.example.com',
          httpMethod: 'GET',
          reloadIntervalMinutes: 30,
          retryIntervalSeconds: 15,
          hideCursor: true,
          zoomFactor: 1.25,
          enabled: true,
        },
        {
          id: 2528732488,
          displayIndex: 1,
          isPrimary: false,
          bounds: { x: 1920, y: 0, width: 1920, height: 1080 },
          url: 'https://secondary-feed.example.com',
          httpMethod: 'GET',
          reloadIntervalMinutes: 45,
          retryIntervalSeconds: 10,
          hideCursor: true,
          zoomFactor: 1.0,
          enabled: true,
        },
      ],
    });

    // On session 2 after Windows reboot, Electron assigns new display IDs (e.g. 77770001 and 77770002)
    const rebootedDisplay1 = manager.getDisplayConfig(77770001, {
      displayIndex: 0,
      isPrimary: true,
      bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    });
    expect(rebootedDisplay1.url).toBe('https://custom-signage.example.com');
    expect(rebootedDisplay1.zoomFactor).toBe(1.25);

    const rebootedDisplay2 = manager.getDisplayConfig(77770002, {
      displayIndex: 1,
      isPrimary: false,
      bounds: { x: 1920, y: 0, width: 1920, height: 1080 },
    });
    expect(rebootedDisplay2.url).toBe('https://secondary-feed.example.com');
    expect(rebootedDisplay2.reloadIntervalMinutes).toBe(45);
  });

  it('should resolve single-display kiosk setup when display ID changes on reboot', () => {
    const manager = new ConfigManager(tempConfigPath);
    manager.save({
      defaultUrl: 'https://default-youtube.com',
      displays: [
        {
          id: 11112222,
          url: 'https://solo-kiosk.example.com',
          httpMethod: 'GET',
          reloadIntervalMinutes: 20,
          retryIntervalSeconds: 8,
          hideCursor: true,
          zoomFactor: 1.5,
          enabled: true,
        },
      ],
    });

    // On reboot, single screen gets ID 99998888
    const singleScreenConfig = manager.getDisplayConfig(99998888, { displayIndex: 0 });
    expect(singleScreenConfig.url).toBe('https://solo-kiosk.example.com');
    expect(singleScreenConfig.zoomFactor).toBe(1.5);
  });
});
