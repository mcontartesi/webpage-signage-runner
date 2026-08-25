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
      version: '1.1.0',
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
    expect(parsed.version).toBe('1.1.0');
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
});
