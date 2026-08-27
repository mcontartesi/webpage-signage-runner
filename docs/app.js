/**
 * Webpage Signage Runner - Interactive Web Demo & Simulator
 * Author: Maximiliano Contartesi
 */

const PRESETS = [
  { label: 'YouTube Live Feed', url: 'https://www.youtube.com/watch?v=live_stream_feed', method: 'GET' },
  { label: 'Grafana Ops Dashboard', url: 'https://grafana.internal.cloud/kiosk?orgId=1&refresh=10s', method: 'GET', headers: 'Authorization: Bearer ops-token-8849' },
  { label: 'PowerBI Metrics Video Wall', url: 'https://app.powerbi.com/reportEmbed?reportId=sales-metrics-2026', method: 'GET' },
  { label: 'Weather & Flight Radar', url: 'https://radar.weather-feed.io/airport-kiosk?station=EZE', method: 'GET' },
  { label: 'Emergency Alert Feed (POST)', url: 'https://api.signage-hub.local/v1/feed', method: 'POST', body: '{"kioskId": 101, "emergency": false}' },
];

class SignageDemoApp {
  constructor() {
    this.currentLang = 'es';
    this.currentTab = 'wizard';
    this.displays = [
      {
        id: 1,
        label: 'Main Lobby Video Wall (4K Primary)',
        bounds: { x: 0, y: 0, width: 3840, height: 2160 },
        scaleFactor: 1.5,
        isPrimary: true,
        url: 'https://grafana.internal.cloud/kiosk?orgId=1&refresh=10s',
        httpMethod: 'GET',
        headers: 'Authorization: Bearer grafana-prod-token-9988\nX-Signage-Client: Kiosk-Lobby-1',
        requestBody: '',
        fallbackUrl: 'offline.html',
        reloadIntervalMinutes: 60,
        retryIntervalSeconds: 10,
        zoomFactor: 1.0,
        hideCursor: true,
        enabled: true,
        status: 'online',
        retryCountdown: 10,
        retryAttempt: 1,
        isOffline: false,
      },
      {
        id: 2,
        label: 'Elevator Hallway Secondary Screen',
        bounds: { x: 3840, y: 0, width: 1920, height: 1080 },
        scaleFactor: 1.0,
        isPrimary: false,
        url: 'https://www.youtube.com/watch?v=live_stream_feed',
        httpMethod: 'GET',
        headers: '',
        requestBody: '',
        fallbackUrl: '',
        reloadIntervalMinutes: 30,
        retryIntervalSeconds: 8,
        zoomFactor: 1.0,
        hideCursor: true,
        enabled: true,
        status: 'online',
        retryCountdown: 8,
        retryAttempt: 1,
        isOffline: false,
      },
      {
        id: 3,
        label: 'Executive Conference Room Screen',
        bounds: { x: 5760, y: 0, width: 1920, height: 1080 },
        scaleFactor: 1.0,
        isPrimary: false,
        url: 'https://app.powerbi.com/reportEmbed?reportId=sales-metrics-2026',
        httpMethod: 'POST',
        headers: 'Authorization: Bearer powerbi-corp-secret\nContent-Type: application/json',
        requestBody: '{"branch": "HQ", "theme": "dark"}',
        fallbackUrl: '',
        reloadIntervalMinutes: 120,
        retryIntervalSeconds: 15,
        zoomFactor: 1.1,
        hideCursor: true,
        enabled: true,
        status: 'online',
        retryCountdown: 15,
        retryAttempt: 1,
        isOffline: false,
      },
    ];

    this.logs = [
      { time: this.formatTime(), type: 'info', msg: '[App] Webpage Signage Runner v1.0.0 initialized' },
      { time: this.formatTime(), type: 'info', msg: '[Power] powerSaveBlocker acquired (ID: 1) - Sleep suppressed' },
      { time: this.formatTime(), type: 'info', msg: '[ScreenManager] Enumerated 3 physical monitor(s)' },
      { time: this.formatTime(), type: 'info', msg: '[Server] Embedded REST API listening on http://0.0.0.0:9191' },
      { time: this.formatTime(), type: 'info', msg: '[Watchdog] Memory purge scheduled every 60 min' },
    ];

    this.init();
  }

  init() {
    this.bindEvents();
    this.renderDisplays();
    this.renderSimulator();
    this.startLiveTimers();
  }

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = tab.dataset.tab;
        this.switchTab(target);
      });
    });

    // Language switcher
    document.querySelectorAll('.btn-lang').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLanguage(btn.dataset.lang);
      });
    });

    // Top action buttons
    document.getElementById('btn-identify-global')?.addEventListener('click', () => this.identifyScreens());
    document.getElementById('btn-refresh-global')?.addEventListener('click', () => {
      this.showToast('Re-scanned physical displays list (3 monitors active)', 'success');
    });
    document.getElementById('btn-logs-modal')?.addEventListener('click', () => this.openModal('logs-modal'));
    document.getElementById('btn-about-modal')?.addEventListener('click', () => this.openModal('about-modal'));
    document.getElementById('btn-add-display')?.addEventListener('click', () => this.addDisplay());

    // Modal close buttons
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Close modal on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModals();
      });
    });

    // Setup Wizard Save & Launch
    document.getElementById('btn-save-launch')?.addEventListener('click', () => this.saveAndLaunch());

    // Simulator action buttons
    document.getElementById('sim-btn-offline')?.addEventListener('click', () => this.toggleSimulatorOffline());
    document.getElementById('sim-btn-reload')?.addEventListener('click', () => this.simulateReload());
    document.getElementById('sim-btn-hotplug')?.addEventListener('click', () => this.simulateHotplug());
    document.getElementById('sim-btn-identify')?.addEventListener('click', () => this.identifyScreens());
    document.getElementById('sim-btn-exit')?.addEventListener('click', () => this.switchTab('wizard'));

    // API Explorer execution
    document.getElementById('btn-api-send')?.addEventListener('click', () => this.executeApiTest());
    document.querySelectorAll('.endpoint-item').forEach(item => {
      item.addEventListener('click', () => {
        document.querySelectorAll('.endpoint-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        this.selectEndpoint(item.dataset.endpoint, item.dataset.method);
      });
    });

    // Global Hotkey Escape simulation
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        this.showToast('Admin Emergency Hotkey (Ctrl+Shift+C) Pressed! Unlocking Kiosk...', 'success');
        this.switchTab('wizard');
      }
    });
  }

  setLanguage(lang) {
    this.currentLang = lang;
    document.querySelectorAll('.btn-lang').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });

    const esDesc = document.querySelector('.desc-es');
    const enDesc = document.querySelector('.desc-en');
    if (esDesc && enDesc) {
      if (lang === 'es') {
        esDesc.style.display = 'block';
        enDesc.style.display = 'none';
      } else {
        esDesc.style.display = 'none';
        enDesc.style.display = 'block';
      }
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tabId}`);
    });

    if (tabId === 'simulator') {
      this.renderSimulator();
    }
  }

  renderDisplays() {
    const container = document.getElementById('displays-list');
    const countBadge = document.getElementById('display-count-badge');
    if (!container) return;

    countBadge.textContent = `${this.displays.length} monitor(s) configured`;
    container.innerHTML = '';

    this.displays.forEach((display, index) => {
      const card = document.createElement('div');
      card.className = `display-card ${!display.enabled ? 'disabled' : ''}`;
      card.dataset.displayId = String(display.id);

      card.innerHTML = `
        <div class="display-card-top">
          <div class="display-info">
            <div class="display-badge-number">${index + 1}</div>
            <div>
              <div class="display-label">${this.escapeHtml(display.label)}</div>
              <div class="display-meta">${this.escapeHtml(display.bounds.width)} × ${this.escapeHtml(display.bounds.height)} @ (${this.escapeHtml(display.bounds.x)}, ${this.escapeHtml(display.bounds.y)}) • Scale: ${this.escapeHtml(display.scaleFactor)}x</div>
            </div>
          </div>
          <div class="display-tags">
            ${display.isPrimary ? '<span class="badge badge-primary">Primary</span>' : '<span class="badge badge-secondary">Secondary</span>'}
            <span class="badge badge-success">Online</span>
            ${this.displays.length > 1 ? `<button class="btn btn-danger btn-small btn-remove-display" data-id="${this.escapeHtml(display.id)}" title="Remove Display">&times;</button>` : ''}
          </div>
        </div>

        <div class="form-group">
          <label>Target Signage URL / Web Application</label>
          <div class="form-input-group">
            <input type="url" class="form-input display-url-input" value="${this.escapeHtml(display.url)}" placeholder="https://www.youtube.com">
            <button type="button" class="btn btn-secondary btn-small btn-test-url">Test</button>
          </div>
          <div class="url-preset-pills">
            ${PRESETS.map(p => `<button type="button" class="preset-pill" data-url="${this.escapeHtml(p.url)}" data-method="${this.escapeHtml(p.method)}" data-headers="${this.escapeHtml(p.headers || '')}">${this.escapeHtml(p.label)}</button>`).join('')}
          </div>
        </div>

        <details class="details-advanced" ${display.httpMethod !== 'GET' || display.headers || display.requestBody ? 'open' : ''}>
          <summary>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Advanced HTTP Request Options (GET/POST/PUT, Bearer Token, Custom Headers)
          </summary>
          <div class="details-content">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>HTTP Method</label>
                <select class="form-select display-method-input">
                  <option value="GET" ${display.httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                  <option value="POST" ${display.httpMethod === 'POST' ? 'selected' : ''}>POST</option>
                  <option value="PUT" ${display.httpMethod === 'PUT' ? 'selected' : ''}>PUT</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Custom HTTP Headers (e.g. Bearer Token, API Secret)</label>
              <textarea class="form-textarea display-headers-input" placeholder="Authorization: Bearer secret-token\nX-Client: 123">${this.escapeHtml(display.headers || '')}</textarea>
            </div>
            <div class="form-group">
              <label>Request Body Payload (JSON for POST/PUT)</label>
              <textarea class="form-textarea display-body-input" placeholder='{"stationId": 1}'>${this.escapeHtml(display.requestBody || '')}</textarea>
            </div>
          </div>
        </details>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>Fallback Offline Asset / URL</label>
            <input type="text" class="form-input display-fallback-input" value="${this.escapeHtml(display.fallbackUrl || '')}" placeholder="offline.html">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group flex-1">
            <label>Reload (Mins)</label>
            <input type="number" class="form-input display-reload-input" value="${this.escapeHtml(display.reloadIntervalMinutes)}" min="0">
          </div>
          <div class="form-group flex-1">
            <label>Retry (Secs)</label>
            <input type="number" class="form-input display-retry-input" value="${this.escapeHtml(display.retryIntervalSeconds)}" min="3" max="300">
          </div>
          <div class="form-group flex-1">
            <label>Zoom (Scale)</label>
            <input type="number" class="form-input display-zoom-input" value="${this.escapeHtml(display.zoomFactor)}" min="0.2" max="3.0" step="0.1">
          </div>
        </div>

        <div class="form-row" style="align-items: center; justify-content: space-between;">
          <label class="checkbox-container">
            <input type="checkbox" class="display-cursor-input" ${display.hideCursor ? 'checked' : ''}>
            <span class="checkmark"></span>
            <span class="checkbox-label">Hide Cursor</span>
          </label>

          <label class="checkbox-container">
            <input type="checkbox" class="display-enable-input" ${display.enabled ? 'checked' : ''}>
            <span class="checkmark"></span>
            <span class="checkbox-label">Enable Screen</span>
          </label>
        </div>
      `;

      // Attach preset buttons
      card.querySelectorAll('.preset-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          card.querySelector('.display-url-input').value = pill.dataset.url;
          card.querySelector('.display-method-input').value = pill.dataset.method;
          card.querySelector('.display-headers-input').value = pill.dataset.headers;
          this.showToast(`Applied preset: ${pill.textContent}`, 'success');
        });
      });

      // Test URL
      const testBtn = card.querySelector('.btn-test-url');
      testBtn.addEventListener('click', () => {
        testBtn.textContent = 'Probing...';
        setTimeout(() => {
          testBtn.textContent = 'HTTP 200 OK';
          testBtn.style.color = '#34d399';
          setTimeout(() => {
            testBtn.textContent = 'Test';
            testBtn.style.color = '';
          }, 2500);
        }, 600);
      });

      // Remove button
      const removeBtn = card.querySelector('.btn-remove-display');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this.displays = this.displays.filter(d => d.id !== display.id);
          this.renderDisplays();
          this.showToast(`Display #${display.id} removed`, 'success');
        });
      }

      // Input changes
      const urlInput = card.querySelector('.display-url-input');
      urlInput.addEventListener('input', () => { display.url = urlInput.value; });

      const enableInput = card.querySelector('.display-enable-input');
      enableInput.addEventListener('change', () => {
        display.enabled = enableInput.checked;
        card.classList.toggle('disabled', !enableInput.checked);
      });

      container.appendChild(card);
    });
  }

  addDisplay() {
    const nextId = this.displays.length > 0 ? Math.max(...this.displays.map(d => d.id)) + 1 : 1;
    this.displays.push({
      id: nextId,
      label: `Digital Signage Display #${nextId}`,
      bounds: { x: nextId * 1920, y: 0, width: 1920, height: 1080 },
      scaleFactor: 1.0,
      isPrimary: false,
      url: 'https://www.youtube.com/watch?v=live_stream_feed',
      httpMethod: 'GET',
      headers: '',
      requestBody: '',
      fallbackUrl: 'offline.html',
      reloadIntervalMinutes: 60,
      retryIntervalSeconds: 10,
      zoomFactor: 1.0,
      hideCursor: true,
      enabled: true,
      status: 'online',
      retryCountdown: 10,
      retryAttempt: 1,
      isOffline: false,
    });

    this.renderDisplays();
    this.showToast(`Added new virtual display monitor #${nextId}`, 'success');
    this.addLog(`[Display] Hot-plugged new display #${nextId} (1920x1080)`);
  }

  saveAndLaunch() {
    this.showToast('Config saved atomically! Launching Multi-Screen Kiosk Simulator...', 'success');
    this.addLog('[Config] Configuration saved to disk. Spawning kiosk windows on all screens...');
    setTimeout(() => {
      this.switchTab('simulator');
    }, 600);
  }

  renderSimulator() {
    const container = document.getElementById('simulator-screens-grid');
    if (!container) return;

    container.innerHTML = '';
    const activeDisplays = this.displays.filter(d => d.enabled);

    if (activeDisplays.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-secondary);">
          <p>No displays enabled. Go to Setup Wizard to enable at least one screen.</p>
        </div>
      `;
      return;
    }

    activeDisplays.forEach((display, index) => {
      const monitor = document.createElement('div');
      monitor.className = 'virtual-monitor';
      monitor.dataset.displayId = String(display.id);

      monitor.innerHTML = `
        <div class="virtual-monitor-header">
          <div class="monitor-id-tag">
            <span class="monitor-live-dot"></span>
            <span>DISPLAY #${index + 1}: ${this.escapeHtml(display.label)}</span>
          </div>
          <div>${this.escapeHtml(display.bounds.width)}×${this.escapeHtml(display.bounds.height)} • Zoom: ${this.escapeHtml(display.zoomFactor)}x</div>
        </div>

        <div class="virtual-monitor-viewport">
          ${display.isOffline ? this.renderOfflineView(display) : this.renderSignageDashboard(display, index)}
        </div>

        <div class="monitor-stand"></div>
        <div class="monitor-base"></div>
      `;

      container.appendChild(monitor);
    });
  }

  renderSignageDashboard(display, index) {
    const titles = ['OPERATIONS DASHBOARD', 'LIVE MEDIA BROADCAST', 'REVENUE & KPIs WALL'];
    const title = titles[index % titles.length];

    return `
      <div class="screen-simulation-feed signage-feed-dashboard">
        <div class="dashboard-topbar">
          <div>
            <div class="dashboard-title">${title}</div>
            <div style="font-size: 0.72rem; color: #94a3b8;">Target Feed: ${this.escapeHtml(this.truncateUrl(display.url))}</div>
          </div>
          <div class="dashboard-clock live-clock">--:--:--</div>
        </div>

        <div class="dashboard-grid">
          <div class="feed-widget">
            <div class="widget-label">System Uptime</div>
            <div class="widget-value">99.98%</div>
            <div class="widget-sub">▲ 24/7 Watchdog Active</div>
          </div>
          <div class="feed-widget">
            <div class="widget-label">Active Viewers</div>
            <div class="widget-value">${1420 + index * 340}</div>
            <div class="widget-sub">▲ Live Kiosk Stream</div>
          </div>
          <div class="feed-widget">
            <div class="widget-label">Memory Footprint</div>
            <div class="widget-value">78 MB</div>
            <div class="widget-sub">● Scheduled Purge: ${this.escapeHtml(display.reloadIntervalMinutes)}m</div>
          </div>
          <div class="feed-widget">
            <div class="widget-label">HTTP Method</div>
            <div class="widget-value" style="font-size: 1.1rem; color: #38bdf8;">${this.escapeHtml(display.httpMethod)}</div>
            <div class="widget-sub">${display.headers ? 'Custom Auth Token Active' : 'Public Feed'}</div>
          </div>
        </div>

        <div class="feed-ticker">
          <span style="color: #38bdf8; font-weight: bold;">● STATUS:</span>
          <span>Seamless Multi-Display Orchestration • Hardware Sleep Inhibited • Resolution: ${this.escapeHtml(display.bounds.width)}×${this.escapeHtml(display.bounds.height)}</span>
        </div>
      </div>
    `;
  }

  renderOfflineView(display) {
    return `
      <div class="simulated-offline-view">
        <div class="offline-pulse-circle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </div>
        <div class="offline-feed-title">Display Feed Offline</div>
        <div class="offline-feed-sub">ERR_INTERNET_DISCONNECTED: Reconnecting automatically...</div>
        <div class="offline-countdown-badge">
          Retrying in <span class="offline-timer-sec">${this.escapeHtml(display.retryCountdown)}</span>s (Attempt #${this.escapeHtml(display.retryAttempt)})
        </div>
      </div>
    `;
  }

  toggleSimulatorOffline() {
    const firstActive = this.displays.find(d => d.enabled);
    if (!firstActive) return;

    firstActive.isOffline = !firstActive.isOffline;
    this.renderSimulator();

    if (firstActive.isOffline) {
      this.showToast(`Simulating network dropout on Screen #${firstActive.id}: Switched to Offline Fallback UI!`, 'error');
      this.addLog(`[Watchdog] Network error detected on Display #${firstActive.id}. Transitioned to offline.html`);
    } else {
      this.showToast(`Network restored on Screen #${firstActive.id}! Reloading signage feed...`, 'success');
      this.addLog(`[Watchdog] Network restored on Display #${firstActive.id}. Reloaded target URL`);
    }
  }

  simulateReload() {
    this.showToast('Watchdog: Purging Chromium cache and reloading all displays...', 'success');
    this.addLog('[Watchdog] Executing scheduled cache purge (clearCache: true)');
    this.displays.forEach(d => { d.isOffline = false; });
    this.renderSimulator();
  }

  simulateHotplug() {
    if (this.displays.length > 1) {
      const removed = this.displays.pop();
      this.showToast(`Simulated hot-unplug: Disconnected Display #${removed.id}`, 'error');
      this.addLog(`[ScreenManager] Event: display-removed (ID: ${removed.id})`);
    } else {
      this.addDisplay();
    }
    this.renderSimulator();
    this.renderDisplays();
  }

  identifyScreens() {
    const overlay = document.getElementById('identify-overlay');
    const num = document.getElementById('overlay-screen-num');
    const label = document.getElementById('overlay-screen-label');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    num.textContent = '1';
    label.textContent = 'PRIMARY VIDEO WALL';

    let count = 1;
    const interval = setInterval(() => {
      count++;
      if (count <= this.displays.length) {
        num.textContent = String(count);
        label.textContent = `DISPLAY SCREEN #${count}`;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          overlay.classList.add('hidden');
        }, 1200);
      }
    }, 1200);

    this.showToast('Flashing visual screen identification badges across all physical displays!', 'success');
    this.addLog('[Server] POST /api/identify - Flashed monitor numbers on all screens');
  }

  selectEndpoint(endpoint, method) {
    const pathInput = document.getElementById('api-test-path');
    const methodSelect = document.getElementById('api-test-method');
    const bodyInput = document.getElementById('api-test-body');
    if (pathInput) pathInput.value = endpoint;
    if (methodSelect) methodSelect.value = method;

    if (method === 'GET') {
      if (bodyInput) bodyInput.value = '';
    } else if (endpoint.includes('/url')) {
      if (bodyInput) bodyInput.value = JSON.stringify({ url: 'https://emergency-broadcast.internal/kiosk', httpMethod: 'GET', persist: true }, null, 2);
    } else if (endpoint.includes('/reload')) {
      if (bodyInput) bodyInput.value = JSON.stringify({ clearCache: true }, null, 2);
    } else {
      if (bodyInput) bodyInput.value = '{}';
    }
  }

  executeApiTest() {
    const path = document.getElementById('api-test-path')?.value || '/health';
    const method = document.getElementById('api-test-method')?.value || 'GET';
    const responseViewer = document.getElementById('api-response-viewer');
    const statusTag = document.getElementById('api-response-status');

    if (!responseViewer) return;

    responseViewer.textContent = 'Executing request to embedded REST API...';
    if (statusTag) statusTag.textContent = 'PROBING...';

    setTimeout(() => {
      let resData = {};
      let statusCode = 200;

      if (path === '/health') {
        resData = {
          status: 'ok',
          app: 'webpage-signage-runner',
          version: '1.0.0',
          uptimeSeconds: 86400,
          timestamp: new Date().toISOString(),
        };
      } else if (path === '/api/status') {
        resData = {
          name: 'webpage-signage-runner',
          version: '1.0.0',
          author: 'Maximiliano Contartesi',
          uptimeSeconds: 86400,
          platform: 'win32',
          arch: 'x64',
          nodeVersion: '22.10.0',
          electronVersion: '44.0.0',
          memoryUsageMb: { rss: 142, heapTotal: 68, heapUsed: 49 },
          powerSaveBlockerActive: true,
          displayCount: this.displays.length,
          displays: this.displays.map(d => ({
            id: d.id,
            label: d.label,
            bounds: d.bounds,
            isPrimary: d.isPrimary,
            currentUrl: d.url,
            status: d.isOffline ? 'offline' : 'active',
            lastReload: new Date().toISOString(),
          })),
        };
      } else if (path.includes('/url')) {
        resData = {
          success: true,
          message: `Display URL successfully updated and reloaded on display`,
          timestamp: new Date().toISOString(),
        };
      } else if (path.includes('/reload')) {
        resData = {
          success: true,
          message: 'All displays reloaded successfully. Chromium cache purged.',
        };
      } else if (path.includes('/identify')) {
        resData = {
          success: true,
          message: 'Display identification badges flashed on all screens for 5 seconds.',
        };
        this.identifyScreens();
      } else {
        resData = {
          success: true,
          endpoint: path,
          method: method,
          message: 'Executed mock API route successfully',
        };
      }

      if (statusTag) {
        statusTag.textContent = `${statusCode} OK`;
        statusTag.className = 'badge badge-success';
      }

      responseViewer.textContent = JSON.stringify(resData, null, 2);
      this.addLog(`[API] ${method} ${path} -> ${statusCode} OK`);
    }, 350);
  }

  startLiveTimers() {
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      document.querySelectorAll('.live-clock').forEach(clock => {
        clock.textContent = timeStr;
      });

      // Update offline countdown timers
      this.displays.forEach(d => {
        if (d.isOffline) {
          d.retryCountdown--;
          if (d.retryCountdown <= 0) {
            d.retryCountdown = d.retryIntervalSeconds || 10;
            d.retryAttempt++;
            this.addLog(`[Watchdog] Auto-retry connection attempt #${d.retryAttempt} on Display #${d.id}`);
          }
        }
      });

      const timerSec = document.querySelector('.offline-timer-sec');
      if (timerSec) {
        const offlineDisp = this.displays.find(d => d.isOffline);
        if (offlineDisp) timerSec.textContent = String(offlineDisp.retryCountdown);
      }
    }, 1000);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('hidden');
    if (modalId === 'logs-modal') this.renderLogsConsole();
  }

  closeModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  }

  addLog(msg, type = 'info') {
    this.logs.push({ time: this.formatTime(), type, msg });
    if (this.logs.length > 50) this.logs.shift();
    this.renderLogsConsole();
  }

  renderLogsConsole() {
    const consoleEl = document.getElementById('logs-console');
    if (!consoleEl) return;

    consoleEl.innerHTML = this.logs.map(log => `
      <div class="log-line">
        <span class="log-time">[${log.time}]</span>
        <span class="log-${log.type}">[${log.type.toUpperCase()}]</span>
        <span class="log-msg">${this.escapeHtml(log.msg)}</span>
      </div>
    `).join('');

    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  showToast(msg, type = 'success') {
    const toast = document.getElementById('status-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `status-toast ${type}`;
    setTimeout(() => {
      toast.className = 'status-toast hidden';
    }, 4500);
  }

  formatTime() {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  truncateUrl(url, maxLen = 45) {
    if (!url) return '';
    return url.length > maxLen ? url.substring(0, maxLen) + '...' : url;
  }

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.demoApp = new SignageDemoApp();
});
