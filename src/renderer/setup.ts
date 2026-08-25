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
  private btnAbout = document.getElementById('btn-about') as HTMLButtonElement;
  private btnLogs = document.getElementById('btn-logs') as HTMLButtonElement;
  private btnSave = document.getElementById('btn-save') as HTMLButtonElement;
  private statusToast = document.getElementById('status-toast') as HTMLDivElement;

  // About Modal Elements
  private aboutModal = document.getElementById('about-modal') as HTMLDivElement;
  private btnCloseAbout = document.getElementById('btn-close-about') as HTMLButtonElement;
  private btnModalOk = document.getElementById('btn-modal-ok') as HTMLButtonElement;

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

    if (this.btnAbout) {
      this.btnAbout.addEventListener('click', () => {
        this.openAboutModal();
      });
    }

    if (this.btnCloseAbout) {
      this.btnCloseAbout.addEventListener('click', () => {
        this.closeAboutModal();
      });
    }

    if (this.btnModalOk) {
      this.btnModalOk.addEventListener('click', () => {
        this.closeAboutModal();
      });
    }

    if (this.aboutModal) {
      this.aboutModal.addEventListener('click', (e) => {
        if (e.target === this.aboutModal) {
          this.closeAboutModal();
        }
      });
    }

    this.btnLogs.addEventListener('click', async () => {
      await window.signageAPI.openLogsFolder();
    });

    this.btnSave.addEventListener('click', async () => {
      await this.saveAndLaunch();
    });
  }

  private openAboutModal(): void {
    if (this.aboutModal) {
      this.aboutModal.classList.remove('hidden');
    }
  }

  private closeAboutModal(): void {
    if (this.aboutModal) {
      this.aboutModal.classList.add('hidden');
    }
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
    this.inputGlobalDefaultUrl.value = this.config.defaultUrl || 'https://www.youtube.com';
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

  private formatHeadersToString(headers?: Record<string, string>): string {
    if (!headers || Object.keys(headers).length === 0) return '';
    return Object.entries(headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');
  }

  private parseHeadersFromString(str: string): Record<string, string> | undefined {
    const trimmed = str.trim();
    if (!trimmed) return undefined;

    // Check if JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        return JSON.parse(trimmed);
      } catch {}
    }

    const headers: Record<string, string> = {};
    const lines = trimmed.split('\n');
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) {
          headers[key] = val;
        }
      }
    }
    return Object.keys(headers).length > 0 ? headers : undefined;
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
      const targetUrl = existingConfig?.url || this.config.defaultUrl || 'https://www.youtube.com';
      const httpMethod = existingConfig?.httpMethod || 'GET';
      const headersStr = this.formatHeadersToString(existingConfig?.headers);
      const requestBody = existingConfig?.requestBody || '';
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
            <input type="url" id="url-${display.id}" class="form-input display-url-input" value="${targetUrl}" placeholder="https://www.youtube.com" required>
            <button type="button" class="btn btn-secondary btn-small btn-test-url" data-target="url-${display.id}">Test</button>
          </div>
        </div>

        <!-- Advanced HTTP Method & Custom Headers Section -->
        <details class="details-advanced" ${httpMethod !== 'GET' || headersStr || requestBody ? 'open' : ''}>
          <summary>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Advanced HTTP Request Options (GET/POST/PUT, Headers, Bearer Token)
          </summary>
          <div class="details-content">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="method-${display.id}">HTTP Method</label>
                <select id="method-${display.id}" class="form-select display-method-input">
                  <option value="GET" ${httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                  <option value="POST" ${httpMethod === 'POST' ? 'selected' : ''}>POST</option>
                  <option value="PUT" ${httpMethod === 'PUT' ? 'selected' : ''}>PUT</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="headers-${display.id}">Custom HTTP Headers (Bearer Token, Secrets)</label>
              <textarea id="headers-${display.id}" class="form-textarea display-headers-input" placeholder="Authorization: Bearer your-secret-token\nX-Custom-Auth: secret123">${headersStr}</textarea>
              <span class="form-hint">One header per line (<code>Header: Value</code>) or JSON format.</span>
            </div>

            <div class="form-group">
              <label for="body-${display.id}">Request Body (Payload for POST / PUT)</label>
              <textarea id="body-${display.id}" class="form-textarea display-body-input" placeholder='{"kiosk": 1, "station": "A"}'>${requestBody}</textarea>
            </div>
          </div>
        </details>

        <div class="form-group" style="margin-top: 12px; margin-bottom: 12px;">
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
      const methodSelect = card.querySelector('.display-method-input') as HTMLSelectElement;
      const headersInput = card.querySelector('.display-headers-input') as HTMLTextAreaElement;
      const bodyInput = card.querySelector('.display-body-input') as HTMLTextAreaElement;
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

      const httpMethod = (methodSelect?.value as 'GET' | 'POST' | 'PUT') || 'GET';
      const parsedHeaders = headersInput ? this.parseHeadersFromString(headersInput.value) : undefined;
      const requestBody = bodyInput ? bodyInput.value.trim() || undefined : undefined;

      displaysConfig.push({
        id: isNaN(Number(displayId)) ? displayId : Number(displayId),
        url: targetUrl,
        httpMethod,
        headers: parsedHeaders,
        requestBody,
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
