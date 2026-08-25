import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { SignageConfig, SignageConfigSchema, DisplayConfig } from '../common/types';
import { DEFAULT_CONFIG } from '../common/constants';
import { logger } from './logger';

export class ConfigManager {
  private configPath: string;
  private currentConfig: SignageConfig | null = null;

  constructor(customPath?: string) {
    if (customPath) {
      this.configPath = customPath;
    } else {
      try {
        this.configPath = path.join(app.getPath('userData'), 'config.json');
      } catch {
        this.configPath = path.join(process.cwd(), 'config.json');
      }
    }
  }

  public getConfigPath(): string {
    return this.configPath;
  }

  public hasConfigFile(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Loads and validates the configuration file from disk.
   * Returns parsed SignageConfig if valid, or null if file is absent or corrupted.
   */
  public load(): SignageConfig | null {
    if (!fs.existsSync(this.configPath)) {
      logger.info('Config', `No existing configuration found at ${this.configPath}`);
      return null;
    }

    try {
      const raw = fs.readFileSync(this.configPath, 'utf8');
      const parsedJson = JSON.parse(raw);
      const validationResult = SignageConfigSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        logger.error('Config', 'Configuration validation failed:', validationResult.error.format());
        return null;
      }

      this.currentConfig = validationResult.data;
      logger.info('Config', `Successfully loaded configuration with ${this.currentConfig.displays.length} displays.`);
      return this.currentConfig;
    } catch (err) {
      logger.error('Config', 'Failed to read or parse configuration file:', err);
      return null;
    }
  }

  /**
   * Returns current in-memory config or loads from disk if null.
   */
  public get(): SignageConfig {
    if (!this.currentConfig) {
      const loaded = this.load();
      if (loaded) {
        this.currentConfig = loaded;
      } else {
        this.currentConfig = { ...DEFAULT_CONFIG };
      }
    }
    return this.currentConfig;
  }

  /**
   * Saves configuration to disk atomically with validation.
   */
  public save(config: Partial<SignageConfig>): SignageConfig {
    const merged = {
      ...DEFAULT_CONFIG,
      ...this.currentConfig,
      ...config,
    };

    const validated = SignageConfigSchema.parse(merged);

    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Atomic write via temporary file
    const tempPath = `${this.configPath}.${Date.now()}.tmp`;
    const jsonStr = JSON.stringify(validated, null, 2);

    try {
      fs.writeFileSync(tempPath, jsonStr, 'utf8');

      // Create backup if existing config exists
      if (fs.existsSync(this.configPath)) {
        try {
          fs.copyFileSync(this.configPath, `${this.configPath}.bak`);
        } catch {}
      }

      // Rename tmp to actual config
      fs.renameSync(tempPath, this.configPath);
      this.currentConfig = validated;
      logger.info('Config', `Configuration successfully saved to ${this.configPath}`);
      return this.currentConfig;
    } catch (err) {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }
      logger.error('Config', 'Failed to write configuration atomically:', err);
      throw err;
    }
  }

  /**
   * Gets display config for a specific display ID, or returns a fallback config.
   */
  public getDisplayConfig(displayId: number | string): DisplayConfig {
    const config = this.get();
    const strId = String(displayId);
    const found = config.displays.find((d) => String(d.id) === strId);

    if (found) {
      return found;
    }

    // Fallback default config for display
    return {
      id: displayId,
      label: `Display ${displayId}`,
      url: config.defaultUrl,
      reloadIntervalMinutes: config.defaultReloadIntervalMinutes,
      retryIntervalSeconds: config.defaultRetryIntervalSeconds,
      hideCursor: config.hideCursorGlobal,
      zoomFactor: 1.0,
      enabled: true,
    };
  }

  /**
   * Updates or inserts a display's configuration.
   */
  public updateDisplayConfig(displayId: number | string, partial: Partial<DisplayConfig>): SignageConfig {
    const config = this.get();
    const strId = String(displayId);
    const existingIndex = config.displays.findIndex((d) => String(d.id) === strId);

    let updatedDisplays: DisplayConfig[];
    if (existingIndex >= 0) {
      const updated = { ...config.displays[existingIndex], ...partial };
      updatedDisplays = [...config.displays];
      updatedDisplays[existingIndex] = updated;
    } else {
      const newDisplay: DisplayConfig = {
        id: displayId,
        label: partial.label || `Display ${displayId}`,
        url: partial.url || config.defaultUrl,
        fallbackUrl: partial.fallbackUrl,
        reloadIntervalMinutes: partial.reloadIntervalMinutes ?? config.defaultReloadIntervalMinutes,
        retryIntervalSeconds: partial.retryIntervalSeconds ?? config.defaultRetryIntervalSeconds,
        hideCursor: partial.hideCursor ?? config.hideCursorGlobal,
        zoomFactor: partial.zoomFactor ?? 1.0,
        userAgent: partial.userAgent,
        partition: partial.partition,
        enabled: partial.enabled ?? true,
      };
      updatedDisplays = [...config.displays, newDisplay];
    }

    return this.save({ ...config, displays: updatedDisplays });
  }

  /**
   * Removes configuration file (factory reset).
   */
  public reset(): void {
    if (fs.existsSync(this.configPath)) {
      try {
        fs.unlinkSync(this.configPath);
        this.currentConfig = null;
        logger.info('Config', 'Configuration reset: file removed.');
      } catch (err) {
        logger.error('Config', 'Failed to delete config file:', err);
        throw err;
      }
    }
  }
}

export const configManager = new ConfigManager();
