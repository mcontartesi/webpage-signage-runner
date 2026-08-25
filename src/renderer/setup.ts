import { SignageConfig, RuntimeDisplayInfo, DisplayConfig } from '../common/types';
import type { SignageAPI } from '../preload/index';

declare global {
  interface Window {
    signageAPI: SignageAPI;
  }
}

class SetupController {
  private config!: SignageConfig;
  private displays: RuntimeDisplayInfo[] = [];

  // DOM Elements
  private displaysContainer = document.getElementById('displays-list') as HTMLDivElement;
  private displayCountBadge = document.getElementById('display-count-badge') as HTMLSpanElement;
  private btnIdentify = document.getElementById('btn-identify') as HTMLButtonElement;
  private btnRefresh = document.getElementById('btn-refresh') as HTMLButtonElement;
  private btnLogs = document.getElementById('btn-logs') as HTMLButtonElement;
  private btnSave = document.getElementById('btn-save') as HTMLButtonElement;
  private statusToast = document.getElementById('status-toast') as HTMLDivElement;

  // Global Inputs
  private inputGlobalDefaultUrl = document.getElementById('global-default-url') as HTMLInputElement;
  private inputGlobalShortcut = document.getElementById('global-shortcut') as HTMLInputElement;
  private inputGlobalAutostart = document.getElementById('global-autostart') as HTMLInputElement;
  private inputGlobalHideCursor = document.getElementById('global-hide-cursor') as HTMLInputElement;
  private inputApiEnabled = document.getElementById('api-enabled') as HTMLInputElement;
  private inputApiPort = document.getElementById('api-port') as HTMLInputElement;
  private inputApiHost = document.getElementById('api-host') as HTMLInputElement;
  private inputApiToken = document.getElementById('api-token') as HTMLInputElement;
  private inputWatchdogReload = document.getElementById('watchdog-reload-mins') as HTMLInputElement;
  private inputWatchdogRetry = document.getElementById('watchdog-retry-secs') as HTMLInputElement;
  private inputWatchdogClearCache = document.getElementById('watchdog-clear-cache') as HTMLInputElement;
  private inputWatchdogAutoRecover = document.getElementById('watchdog-auto-recover') as HTMLInputElement;

  public async init(): Promise<void> {
    this.bindEvents();
    await this.loadData();
  }

  private bindEvents(): void {
    this.btnIdentify.addEventListener('click', async () => {
      this.showToast('Flashing monitor numbers on all displays...', 'success');
      await window.signageAPI.identifyDisplays();
    });

    this.btnRefresh.addEventListener('click', async () => {
      await this.loadData();
      this.showToast('Refreshed display monitors list', 'success');
    });

    this.btnLogs.addEventListener('click', async () => {
      await window.signageAPI.openLogsFolder();
    });

    this.btnSave.addEventListener('click', async () => {
      await this.saveAndLaunch();
    });
  }

  private async loadData(): Promise<void> {
    try {
      this.config = await window.signageAPI.getConfig();
      this.displays = await window.signageAPI.getDisplays();

      this.populateGlobalSettings();
      this.renderDisplays();
    } catch (err: any) {
      this.showToast(`Failed to load configuration: ${err.message}`, 'error');
    }
  }

  private populateGlobalSettings(): void {
    this.inputGlobalDefaultUrl.value = this.config.defaultUrl || 'https://antigravity.google';
    this.inputGlobalShortcut.value = this.config.emergencyShortcut || 'CommandOrControl+Shift+C';
    this.inputGlobalAutostart.checked = this.config.autoStartOnBoot ?? true;
    this.inputGlobalHideCursor.checked = this.config.hideCursorGlobal ?? true;

    this.inputApiEnabled.checked = this.config.api?.enabled ?? true;
    this.inputApiPort.value = String(this.config.api?.port || 9191);
    this.inputApiHost.value = this.config.api?.host || '0.0.0.0';
    this.inputApiToken.value = this.config.api?.authToken || '';

    this.inputWatchdogReload.value = String(this.config.defaultReloadIntervalMinutes ?? 60);
    this.inputWatchdogRetry.value = String(this.config.defaultRetryIntervalSeconds ?? 10);
    this.inputWatchdogClearCache.checked = this.config.watchdog?.clearCacheOnReload ?? true;
    this.inputWatchdogAutoRecover.checked = this.config.watchdog?.autoRecoverCrashes ?? true;
  }

  private renderDisplays(): void {
    this.displayCountBadge.textContent = `${this.displays.length} monitor(s) detected`;
    this.displaysContainer.innerHTML = '';

    if (this.displays.length === 0) {
      this.displaysContainer.innerHTML = `
        <div class="loading-state">
          <p>No active displays detected. Please check display connections.</p>
        </div>
      `;
      return;
    }

    this.displays.forEach((display, index) => {
      // Find existing config or synthesize defaults
      const existingConfig = this.config.displays.find((d) => String(d.id) === String(display.id));
      const targetUrl = existingConfig?.url || this.config.defaultUrl || 'https://antigravity.google';
      const fallbackUrl = existingConfig?.fallbackUrl || '';
      const reloadMins = existingConfig?.reloadIntervalMinutes ?? this.config.defaultReloadIntervalMinutes ?? 60;
      const retrySecs = existingConfig?.retryIntervalSeconds ?? this.config.defaultRetryIntervalSeconds ?? 10;
      const hideCursor = existingConfig?.hideCursor ?? this.config.hideCursorGlobal ?? true;
      const zoomFactor = existingConfig?.zoomFactor ?? 1.0;
      const enabled = existingConfig?.enabled ?? true;

      const card = document.createElement('div');
      card.className = `display-card ${!enabled ? 'disabled' : ''}`;
      card.dataset.displayId = String(display.id);

      card.innerHTML = `
        <div class="display-card-top">
          <div class="display-info">
            <div class="display-badge-number">${index + 1}</div>
            <div>
              <div class="display-label">${display.label || `Display #${display.id}`}</div>
              <div class="display-meta">${display.bounds.width} × ${display.bounds.height} @ (${display.bounds.x}, ${display.bounds.y}) • Scale: ${display.scaleFactor}x</div>
            </div>
          </div>
          <div class="display-tags">
            ${display.isPrimary ? '<span class="badge badge-primary">Primary</span>' : '<span class="badge badge-secondary">Secondary</span>'}
            <span class="badge badge-success">Online</span>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="url-${display.id}">Target Signage URL</label>
          <div class="form-input-group">
            <input type="url" id="url-${display.id}" class="form-input display-url-input" value="${targetUrl}" placeholder="https://example.com/dashboard" required>
            <button type="button" class="btn btn-secondary btn-small btn-test-url" data-target="url-${display.id}">Test</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 12px;">
          <label for="fallback-${display.id}">Fallback Offline Asset / URL (Optional)</label>
          <input type="text" id="fallback-${display.id}" class="form-input display-fallback-input" value="${fallbackUrl}" placeholder="file:///path/or/url">
        </div>

        <div class="form-row" style="margin-bottom: 12px;">
          <div class="form-group flex-1">
            <label for="reload-${display.id}">Reload (Mins)</label>
            <input type="number" id="reload-${display.id}" class="form-input display-reload-input" value="${reloadMins}" min="0">
          </div>
          <div class="form-group flex-1">
            <label for="retry-${display.id}">Retry (Secs)</label>
            <input type="number" id="retry-${display.id}" class="form-input display-retry-input" value="${retrySecs}" min="3" max="300">
          </div>
          <div class="form-group flex-1">
            <label for="zoom-${display.id}">Zoom (Scale)</label>
            <input type="number" id="zoom-${display.id}" class="form-input display-zoom-input" value="${zoomFactor}" min="0.2" max="3.0" step="0.1">
          </div>
        </div>

        <div class="form-row" style="align-items: center; justify-content: space-between;">
          <div class="form-checkbox-group">
            <label class="checkbox-container">
              <input type="checkbox" id="cursor-${display.id}" class="display-cursor-input" ${hideCursor ? 'checked' : ''}>
              <span class="checkmark"></span>
              <span class="checkbox-label">Hide Cursor</span>
            </label>
          </div>

          <div class="form-checkbox-group">
            <label class="checkbox-container">
              <input type="checkbox" id="enabled-${display.id}" class="display-enable-input" ${enabled ? 'checked' : ''}>
              <span class="checkmark"></span>
              <span class="checkbox-label">Enable Screen</span>
            </label>
          </div>
        </div>
      `;

      // Attach test URL handler
      const testBtn = card.querySelector('.btn-test-url') as HTMLButtonElement;
      const urlInput = card.querySelector('.display-url-input') as HTMLInputElement;
      testBtn.addEventListener('click', async () => {
        const val = urlInput.value.trim();
        if (!val) return;
        testBtn.textContent = 'Testing...';
        const res = await window.signageAPI.testUrl(val);
        if (res.success) {
          testBtn.textContent = `OK (${res.data?.status || 200})`;
          testBtn.style.color = '#34d399';
        } else {
          testBtn.textContent = 'Failed';
          testBtn.style.color = '#f87171';
        }
        setTimeout(() => {
          testBtn.textContent = 'Test';
          testBtn.style.color = '';
        }, 3000);
      });

      // Enable/disable toggle
      const enableInput = card.querySelector('.display-enable-input') as HTMLInputElement;
      enableInput.addEventListener('change', () => {
        if (enableInput.checked) {
          card.classList.remove('disabled');
        } else {
          card.classList.add('disabled');
        }
      });

      this.displaysContainer.appendChild(card);
    });
  }

  private async saveAndLaunch(): Promise<void> {
    const globalDefaultUrl = this.inputGlobalDefaultUrl.value.trim();
    if (!globalDefaultUrl) {
      this.showToast('Please specify a valid Global Default URL', 'error');
      this.inputGlobalDefaultUrl.focus();
      return;
    }

    const displaysConfig: DisplayConfig[] = [];
    const displayCards = this.displaysContainer.querySelectorAll('.display-card') as NodeListOf<HTMLDivElement>;

    for (const card of displayCards) {
      const displayId = card.dataset.displayId!;
      const urlInput = card.querySelector('.display-url-input') as HTMLInputElement;
      const fallbackInput = card.querySelector('.display-fallback-input') as HTMLInputElement;
      const reloadInput = card.querySelector('.display-reload-input') as HTMLInputElement;
      const retryInput = card.querySelector('.display-retry-input') as HTMLInputElement;
      const zoomInput = card.querySelector('.display-zoom-input') as HTMLInputElement;
      const cursorInput = card.querySelector('.display-cursor-input') as HTMLInputElement;
      const enableInput = card.querySelector('.display-enable-input') as HTMLInputElement;

      const targetUrl = urlInput.value.trim();
      if (!targetUrl) {
        this.showToast(`Display #${displayId} requires a valid URL`, 'error');
        urlInput.focus();
        return;
      }

      displaysConfig.push({
        id: isNaN(Number(displayId)) ? displayId : Number(displayId),
        url: targetUrl,
        fallbackUrl: fallbackInput.value.trim() || undefined,
        reloadIntervalMinutes: parseInt(reloadInput.value, 10) || 60,
        retryIntervalSeconds: parseInt(retryInput.value, 10) || 10,
        zoomFactor: parseFloat(zoomInput.value) || 1.0,
        hideCursor: cursorInput.checked,
        enabled: enableInput.checked,
      });
    }

    const payloadConfig: SignageConfig = {
      version: '1.0.0',
      defaultUrl: globalDefaultUrl,
      hideCursorGlobal: this.inputGlobalHideCursor.checked,
      defaultReloadIntervalMinutes: parseInt(this.inputWatchdogReload.value, 10) || 60,
      defaultRetryIntervalSeconds: parseInt(this.inputWatchdogRetry.value, 10) || 10,
      autoStartOnBoot: this.inputGlobalAutostart.checked,
      emergencyShortcut: this.inputGlobalShortcut.value.trim() || 'CommandOrControl+Shift+C',
      api: {
        enabled: this.inputApiEnabled.checked,
        port: parseInt(this.inputApiPort.value, 10) || 9191,
        host: this.inputApiHost.value.trim() || '0.0.0.0',
        authToken: this.inputApiToken.value.trim(),
        cors: true,
      },
      watchdog: {
        maxRetries: 10,
        unresponsiveTimeoutSeconds: 15,
        clearCacheOnReload: this.inputWatchdogClearCache.checked,
        autoRecoverCrashes: this.inputWatchdogAutoRecover.checked,
      },
      displays: displaysConfig,
    };

    this.showToast('Saving configuration and launching kiosk...', 'success');

    const result = await window.signageAPI.saveConfig({
      config: payloadConfig,
      launchKioskImmediately: true,
    });

    if (result.success) {
      this.showToast('Configuration saved! Kiosk is starting...', 'success');
    } else {
      this.showToast(`Error saving configuration: ${result.error}`, 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    this.statusToast.textContent = message;
    this.statusToast.className = `status-toast ${type}`;
    setTimeout(() => {
      this.statusToast.className = 'status-toast hidden';
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const controller = new SetupController();
  controller.init();
});
