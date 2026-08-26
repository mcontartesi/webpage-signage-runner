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
    this.configPath = this.resolveConfigPath(customPath);
  }

  private resolveConfigPath(customPath?: string): string {
    if (customPath) {
      return customPath;
    }

    let defaultPath: string;
    try {
      defaultPath = path.join(app.getPath('userData'), 'config.json');
    } catch {
      defaultPath = path.join(process.cwd(), 'config.json');
    }

    if (fs.existsSync(defaultPath)) {
      return defaultPath;
    }

    // Check alternate known paths where config might have been saved in prior sessions
    const candidates: string[] = [];
    const appData = process.env.APPDATA;
    if (appData) {
      candidates.push(path.join(appData, 'webpage-signage-runner', 'config.json'));
      candidates.push(path.join(appData, 'Webpage Signage Runner', 'config.json'));
    }
    const home = process.env.HOME || process.env.USERPROFILE;
    if (home) {
      candidates.push(path.join(home, '.config', 'webpage-signage-runner', 'config.json'));
    }
    candidates.push(path.join(process.cwd(), 'config.json'));

    for (const candidate of candidates) {
      if (candidate !== defaultPath && fs.existsSync(candidate)) {
        try {
          const dir = path.dirname(defaultPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.copyFileSync(candidate, defaultPath);
          return defaultPath;
        } catch {
          return candidate;
        }
      }
    }

    return defaultPath;
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

      // Rename tmp to actual config with fallback for Windows file locks
      try {
        fs.renameSync(tempPath, this.configPath);
      } catch {
        fs.copyFileSync(tempPath, this.configPath);
        try {
          fs.unlinkSync(tempPath);
        } catch {}
      }

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
   * Gets display config using multi-tier fallback matching across Windows reboots.
   * Matches by: Exact ID -> displayIndex -> Single display fallback -> isPrimary -> screen bounds.
   */
  public getDisplayConfig(
    displayId: number | string,
    context?: { displayIndex?: number; isPrimary?: boolean; bounds?: { x: number; y: number; width: number; height: number } } | number
  ): DisplayConfig {
    const config = this.get();
    const strId = String(displayId);

    // 1. Direct exact ID match
    let found = config.displays.find((d) => String(d.id) === strId);

    const index = typeof context === 'number' ? context : context?.displayIndex;
    const isPrimary = typeof context === 'object' ? context?.isPrimary : undefined;
    const bounds = typeof context === 'object' ? context?.bounds : undefined;

    // 2. Match by displayIndex (stable screen order)
    if (!found && index !== undefined && index >= 0) {
      found = config.displays.find((d) => d.displayIndex === index) || config.displays[index];
    }

    // 3. Match single-display kiosk setup
    if (!found && config.displays.length === 1 && (index === 0 || index === undefined)) {
      found = config.displays[0];
    }

    // 4. Match by isPrimary flag
    if (!found && isPrimary !== undefined) {
      found = config.displays.find((d) => d.isPrimary === isPrimary);
    }

    // 5. Match by physical display bounds (coordinates & resolution)
    if (!found && bounds) {
      found = config.displays.find(
        (d) => d.bounds && d.bounds.x === bounds.x && d.bounds.y === bounds.y
      );
    }

    if (found) {
      // In-memory update of runtime display ID if it changed across reboots
      if (String(found.id) !== strId) {
        found.id = displayId;
      }
      return found;
    }

    // Fallback default config for display
    return {
      id: displayId,
      label: `Display ${displayId}`,
      url: config.defaultUrl,
      httpMethod: 'GET',
      reloadIntervalMinutes: config.defaultReloadIntervalMinutes,
      retryIntervalSeconds: config.defaultRetryIntervalSeconds,
      hideCursor: config.hideCursorGlobal,
      zoomFactor: 1.0,
      enabled: true,
      displayIndex: index,
      isPrimary,
      bounds,
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
        httpMethod: partial.httpMethod || 'GET',
        headers: partial.headers,
        requestBody: partial.requestBody,
        fallbackUrl: partial.fallbackUrl,
        reloadIntervalMinutes: partial.reloadIntervalMinutes ?? config.defaultReloadIntervalMinutes,
        retryIntervalSeconds: partial.retryIntervalSeconds ?? config.defaultRetryIntervalSeconds,
        hideCursor: partial.hideCursor ?? config.hideCursorGlobal,
        zoomFactor: partial.zoomFactor ?? 1.0,
        userAgent: partial.userAgent,
        partition: partial.partition,
        displayIndex: partial.displayIndex,
        isPrimary: partial.isPrimary,
        bounds: partial.bounds,
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
