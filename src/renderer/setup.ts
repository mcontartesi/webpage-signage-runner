import { SignageConfig, RuntimeDisplayInfo, DisplayConfig } from '../common/types';
import type { SignageAPI } from '../preload/index';

declare global {
  interface Window {
    signageAPI: SignageAPI;
  }
}

function escapeHtml(str: unknown): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class SetupController {
  private config!: SignageConfig;
  private displays: RuntimeDisplayInfo[] = [];

  // DOM Elements
  private displaysContainer = document.getElementById('displays-list') as HTMLDivElement;
  private displayCountBadge = document.getElementById('display-count-badge') as HTMLSpanElement;
  private btnIdentify = document.getElementById('btn-identify') as HTMLButtonElement;
  private btnRefresh = document.getElementById('btn-refresh') as HTMLButtonElement;
  private btnReloadAll = document.getElementById('btn-reload-all') as HTMLButtonElement;
  private btnAbout = document.getElementById('btn-about') as HTMLButtonElement;
  private btnExit = document.getElementById('btn-exit') as HTMLButtonElement;
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
  private apiDependentFields = document.getElementById('api-dependent-fields') as HTMLDivElement;
  private inputApiPort = document.getElementById('api-port') as HTMLInputElement;
  private inputApiHost = document.getElementById('api-host') as HTMLInputElement;
  private inputApiToken = document.getElementById('api-token') as HTMLInputElement;
  private btnToggleToken = document.getElementById('btn-toggle-token') as HTMLButtonElement;
  private inputWatchdogReload = document.getElementById('watchdog-reload-mins') as HTMLInputElement;
  private inputWatchdogRetry = document.getElementById('watchdog-retry-secs') as HTMLInputElement;
  private inputWatchdogClearCache = document.getElementById('watchdog-clear-cache') as HTMLInputElement;
  private inputWatchdogAutoRecover = document.getElementById('watchdog-auto-recover') as HTMLInputElement;

  private toastTimeout: any = null;

  public async init(): Promise<void> {
    this.bindEvents();
    await this.loadData();
  }

  private bindEvents(): void {
    this.btnIdentify.addEventListener('click', async () => {
      this.showToast('Flashing monitor numbers on all physical screens...', 'success');
      await window.signageAPI.identifyDisplays();
    });

    this.btnRefresh.addEventListener('click', async () => {
      await this.loadData();
      this.showToast('Refreshed display monitors list', 'success');
    });

    if (this.btnReloadAll) {
      this.btnReloadAll.addEventListener('click', async () => {
        this.showToast('Purging cache & forcing reload on all displays...', 'success');
        const res = await window.signageAPI.reloadAll(true);
        if (res.success) {
          this.showToast('All displays reloaded with fresh cache', 'success');
        } else {
          this.showToast(`Reload error: ${res.error || 'Failed'}`, 'error');
        }
      });
    }

    if (this.btnAbout) {
      this.btnAbout.addEventListener('click', () => {
        this.openAboutModal();
      });
    }

    if (this.btnExit) {
      this.btnExit.addEventListener('click', async () => {
        await window.signageAPI.quitApp();
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

    if (this.btnLogs) {
      this.btnLogs.addEventListener('click', async () => {
        await window.signageAPI.openLogsFolder();
      });
    }

    if (this.btnSave) {
      this.btnSave.addEventListener('click', async () => {
        await this.saveAndLaunch();
      });
    }

    // Toggle API dependent fields visibility/state
    if (this.inputApiEnabled) {
      this.inputApiEnabled.addEventListener('change', () => {
        this.updateApiFieldsState();
      });
    }

    // Toggle API token password visibility
    if (this.btnToggleToken && this.inputApiToken) {
      this.btnToggleToken.addEventListener('click', () => {
        const isPassword = this.inputApiToken.type === 'password';
        this.inputApiToken.type = isPassword ? 'text' : 'password';
        this.btnToggleToken.innerHTML = isPassword
          ? `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
               <line x1="1" y1="1" x2="23" y2="23"></line>
             </svg>`
          : `<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
               <circle cx="12" cy="12" r="3"></circle>
             </svg>`;
      });
    }

    // Click to copy API endpoint tags
    document.querySelectorAll('.endpoint-tag').forEach((btn) => {
      btn.addEventListener('click', () => {
        const endpoint = (btn as HTMLElement).dataset.endpoint;
        if (endpoint) {
          navigator.clipboard.writeText(endpoint).then(() => {
            this.showToast(`Copied ${endpoint} to clipboard`, 'success');
          }).catch(() => {
            this.showToast(`Endpoint: ${endpoint}`, 'success');
          });
        }
      });
    });

    // Global keyboard shortcuts: Ctrl+S to save, Ctrl+Q to quit, Escape for modal
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.saveAndLaunch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'q') {
        e.preventDefault();
        window.signageAPI.quitApp();
      }
      if (e.key === 'Escape' && this.aboutModal && !this.aboutModal.classList.contains('hidden')) {
        this.closeAboutModal();
      }
    });
  }

  private updateApiFieldsState(): void {
    if (this.apiDependentFields && this.inputApiEnabled) {
      if (this.inputApiEnabled.checked) {
        this.apiDependentFields.classList.remove('disabled');
      } else {
        this.apiDependentFields.classList.add('disabled');
      }
    }
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
    this.updateApiFieldsState();

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
          <p>No active displays detected. Please check display physical connections.</p>
        </div>
      `;
      return;
    }

    this.displays.forEach((display, index) => {
      // Find existing config using multi-tier smart matching
      let existingConfig = this.config.displays.find((d) => String(d.id) === String(display.id));
      if (!existingConfig && this.config.displays.find((d) => d.displayIndex === index)) {
        existingConfig = this.config.displays.find((d) => d.displayIndex === index);
      }
      if (!existingConfig && this.config.displays[index]) {
        existingConfig = this.config.displays[index];
      }
      if (!existingConfig && this.displays.length === 1 && this.config.displays.length >= 1) {
        existingConfig = this.config.displays[0];
      }
      if (!existingConfig && display.isPrimary) {
        existingConfig = this.config.displays.find((d) => d.isPrimary);
      }
      if (!existingConfig && display.bounds) {
        existingConfig = this.config.displays.find(
          (d) => d.bounds && d.bounds.x === display.bounds.x && d.bounds.y === display.bounds.y
        );
      }

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
            <div class="display-headings">
              <div class="display-label">${escapeHtml(display.label || `Display #${display.id}`)}</div>
              <div class="display-meta">${escapeHtml(display.bounds.width)} × ${escapeHtml(display.bounds.height)} @ (${escapeHtml(display.bounds.x)}, ${escapeHtml(display.bounds.y)}) • Scale: ${escapeHtml(display.scaleFactor)}x</div>
            </div>
          </div>
          <div class="display-tags">
            ${display.isPrimary ? '<span class="badge badge-primary">Primary</span>' : '<span class="badge badge-secondary">Secondary</span>'}
            <span class="badge badge-success">Online</span>
          </div>
        </div>

        <div class="form-group">
          <label for="url-${escapeHtml(display.id)}">Target Signage URL</label>
          <div class="form-input-group">
            <input type="url" id="url-${escapeHtml(display.id)}" class="form-input font-mono display-url-input" value="${escapeHtml(targetUrl)}" placeholder="https://www.youtube.com" required>
            <button type="button" class="btn btn-secondary btn-small btn-test-url" data-target="url-${escapeHtml(display.id)}" title="Test URL connectivity">Test</button>
            <button type="button" class="btn btn-secondary btn-small btn-reload-display" data-display-id="${escapeHtml(display.id)}" title="Purge cache and force reload this display">Reload</button>
          </div>
        </div>

        <!-- Advanced HTTP Request Options Accordion -->
        <details class="details-advanced" ${httpMethod !== 'GET' || headersStr || requestBody ? 'open' : ''}>
          <summary>
            <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span>Advanced HTTP Options (Method, Headers, Payload)</span>
            <svg class="summary-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </summary>
          <div class="details-content">
            <div class="form-row">
              <div class="form-group flex-1">
                <label for="method-${escapeHtml(display.id)}">HTTP Method</label>
                <select id="method-${escapeHtml(display.id)}" class="form-select display-method-input">
                  <option value="GET" ${httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                  <option value="POST" ${httpMethod === 'POST' ? 'selected' : ''}>POST</option>
                  <option value="PUT" ${httpMethod === 'PUT' ? 'selected' : ''}>PUT</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="headers-${escapeHtml(display.id)}">Custom HTTP Headers (Auth Token, Headers)</label>
              <textarea id="headers-${escapeHtml(display.id)}" class="form-textarea display-headers-input" placeholder="Authorization: Bearer your-secret-token\nX-Custom-Auth: secret123">${escapeHtml(headersStr)}</textarea>
              <span class="form-hint">One header per line (<code>Header: Value</code>) or JSON format.</span>
            </div>

            <div class="form-group">
              <label for="body-${escapeHtml(display.id)}">Request Body (Payload for POST / PUT)</label>
              <textarea id="body-${escapeHtml(display.id)}" class="form-textarea display-body-input" placeholder='{"kiosk": 1, "station": "A"}'>${escapeHtml(requestBody)}</textarea>
            </div>
          </div>
        </details>

        <div class="form-group">
          <label for="fallback-${escapeHtml(display.id)}">Fallback Offline Asset / URL (Optional)</label>
          <input type="text" id="fallback-${escapeHtml(display.id)}" class="form-input font-mono display-fallback-input" value="${escapeHtml(fallbackUrl)}" placeholder="file:///path/or/url">
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label for="reload-${escapeHtml(display.id)}">Reload (Mins)</label>
            <input type="number" id="reload-${escapeHtml(display.id)}" class="form-input display-reload-input" value="${escapeHtml(reloadMins)}" min="0">
          </div>
          <div class="form-group flex-1">
            <label for="retry-${escapeHtml(display.id)}">Retry (Secs)</label>
            <input type="number" id="retry-${escapeHtml(display.id)}" class="form-input display-retry-input" value="${escapeHtml(retrySecs)}" min="3" max="300">
          </div>
          <div class="form-group flex-1">
            <label for="zoom-${escapeHtml(display.id)}">Zoom (Scale)</label>
            <input type="number" id="zoom-${escapeHtml(display.id)}" class="form-input display-zoom-input" value="${escapeHtml(zoomFactor)}" min="0.2" max="3.0" step="0.1">
          </div>
        </div>

        <div class="display-card-footer">
          <div class="toggle-row" style="padding: 0;">
            <label class="toggle-switch">
              <input type="checkbox" id="cursor-${escapeHtml(display.id)}" class="display-cursor-input" ${hideCursor ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-info">
              <span class="toggle-title">Hide Cursor</span>
            </div>
          </div>

          <div class="toggle-row" style="padding: 0;">
            <label class="toggle-switch">
              <input type="checkbox" id="enabled-${escapeHtml(display.id)}" class="display-enable-input" ${enabled ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
            <div class="toggle-info">
              <span class="toggle-title">Enable Screen</span>
            </div>
          </div>
        </div>
      `;

      // Attach test URL handler
      const testBtn = card.querySelector('.btn-test-url') as HTMLButtonElement;
      const urlInput = card.querySelector('.display-url-input') as HTMLInputElement;
      testBtn.addEventListener('click', async () => {
        const val = urlInput.value.trim();
        if (!val) {
          this.showToast('Please enter a target URL before testing', 'error');
          urlInput.focus();
          return;
        }
        testBtn.textContent = 'Testing...';
        testBtn.disabled = true;
        const res = await window.signageAPI.testUrl(val);
        testBtn.disabled = false;
        if (res.success) {
          testBtn.textContent = `OK (${res.data?.status || 200})`;
          testBtn.style.color = '#34d399';
          testBtn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        } else {
          testBtn.textContent = 'Failed';
          testBtn.style.color = '#f87171';
          testBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        }
        setTimeout(() => {
          testBtn.textContent = 'Test';
          testBtn.style.color = '';
          testBtn.style.borderColor = '';
        }, 3500);
      });

      // Attach reload display handler
      const reloadBtn = card.querySelector('.btn-reload-display') as HTMLButtonElement;
      if (reloadBtn) {
        reloadBtn.addEventListener('click', async () => {
          reloadBtn.textContent = 'Reloading...';
          reloadBtn.disabled = true;
          this.showToast(`Purging cache & reloading display #${display.id}...`, 'success');
          const res = await window.signageAPI.reloadDisplay(display.id, true);
          reloadBtn.disabled = false;
          if (res.success) {
            reloadBtn.textContent = 'Reloaded';
            reloadBtn.style.color = '#34d399';
            this.showToast(`Display #${display.id} reloaded with fresh cache`, 'success');
          } else {
            reloadBtn.textContent = 'Failed';
            reloadBtn.style.color = '#f87171';
            this.showToast(`Display #${display.id} reload failed: ${res.error || 'Display not found or inactive'}`, 'error');
          }
          setTimeout(() => {
            reloadBtn.textContent = 'Reload';
            reloadBtn.style.color = '';
          }, 3500);
        });
      }

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

    for (let index = 0; index < displayCards.length; index++) {
      const card = displayCards[index];
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
      const matchedDisplay = this.displays.find((d) => String(d.id) === String(displayId)) || this.displays[index];

      displaysConfig.push({
        id: isNaN(Number(displayId)) ? displayId : Number(displayId),
        displayIndex: index,
        isPrimary: matchedDisplay?.isPrimary ?? (index === 0),
        bounds: matchedDisplay ? { ...matchedDisplay.bounds } : undefined,
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
      version: this.config?.version || '1.1.0',
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
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.statusToast.textContent = message;
    this.statusToast.className = `status-toast ${type}`;
    this.toastTimeout = setTimeout(() => {
      this.statusToast.className = 'status-toast hidden';
    }, 4500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const controller = new SetupController();
  controller.init();
});
