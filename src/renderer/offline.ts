import type { SignageAPI } from '../preload/index';

declare global {
  interface Window {
    signageAPI: SignageAPI;
  }
}

class OfflineController {
  private displayId: number = 1;
  private targetUrl: string = 'https://example.com';
  private errorCode: string = 'ERR_UNKNOWN';
  private errorDesc: string = 'Connection failed';
  private retrySeconds: number = 10;
  private attemptCount: number = 1;

  private remainingMs: number = 10000;
  private totalMs: number = 10000;
  private timerInterval: any = null;

  // DOM Elements
  private targetUrlText = document.getElementById('target-url-text') as HTMLSpanElement;
  private countdownText = document.getElementById('countdown-text') as HTMLSpanElement;
  private countdownSub = document.getElementById('countdown-sub') as HTMLElement;
  private attemptCountText = document.getElementById('attempt-count') as HTMLSpanElement;
  private diagDisplayId = document.getElementById('diag-display-id') as HTMLSpanElement;
  private diagErrorCode = document.getElementById('diag-error-code') as HTMLSpanElement;
  private diagNetworkStatus = document.getElementById('diag-network-status') as HTMLSpanElement;
  private progressBar = document.getElementById('progress-bar') as unknown as SVGCircleElement;
  private btnRetryNow = document.getElementById('btn-retry-now') as HTMLButtonElement;

  private circumference: number = 2 * Math.PI * 52; // r=52 -> 326.72

  public init(): void {
    this.parseQueryParams();
    this.populateDiagnostics();
    this.setupProgressBar();
    this.bindEvents();
    this.startCountdown();
  }

  private parseQueryParams(): void {
    const params = new URLSearchParams(window.location.search);
    this.displayId = parseInt(params.get('displayId') || '1', 10);
    this.targetUrl = params.get('targetUrl') || 'https://example.com';
    this.errorCode = params.get('errorCode') || 'ERR_CONNECTION_FAILED';
    this.errorDesc = params.get('errorDesc') || 'Host unreachable';
    this.retrySeconds = Math.max(3, parseInt(params.get('retrySeconds') || '10', 10));
    this.attemptCount = parseInt(params.get('attempt') || '1', 10);

    this.totalMs = this.retrySeconds * 1000;
    this.remainingMs = this.totalMs;
  }

  private populateDiagnostics(): void {
    this.targetUrlText.textContent = this.targetUrl;
    this.diagDisplayId.textContent = `#${this.displayId}`;
    this.diagErrorCode.textContent = this.errorCode;
    this.attemptCountText.textContent = String(this.attemptCount);

    this.updateNetworkBadge();
  }

  private updateNetworkBadge(): void {
    const isOnline = navigator.onLine;
    this.diagNetworkStatus.textContent = isOnline ? 'Adapter Online' : 'No Internet';
    this.diagNetworkStatus.className = `diag-val badge-net ${isOnline ? 'online' : 'offline'}`;
  }

  private setupProgressBar(): void {
    if (this.progressBar) {
      this.progressBar.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
      this.progressBar.style.strokeDashoffset = '0';
    }
  }

  private bindEvents(): void {
    this.btnRetryNow.addEventListener('click', () => {
      this.triggerRetry();
    });

    window.addEventListener('online', () => {
      this.updateNetworkBadge();
      // Immediately retry if network just came back
      this.triggerRetry();
    });

    window.addEventListener('offline', () => {
      this.updateNetworkBadge();
    });
  }

  private startCountdown(): void {
    const stepMs = 100;
    this.timerInterval = setInterval(() => {
      this.remainingMs -= stepMs;

      if (this.remainingMs <= 0) {
        clearInterval(this.timerInterval);
        this.triggerRetry();
        return;
      }

      const secondsLeft = Math.ceil(this.remainingMs / 1000);
      this.countdownText.textContent = String(secondsLeft);
      this.countdownSub.textContent = String(secondsLeft);

      // Animate progress bar
      if (this.progressBar) {
        const progress = this.remainingMs / this.totalMs;
        const offset = this.circumference - progress * this.circumference;
        this.progressBar.style.strokeDashoffset = String(offset);
      }
    }, stepMs);
  }

  private triggerRetry(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    this.btnRetryNow.textContent = 'Connecting...';
    this.btnRetryNow.disabled = true;

    if (window.signageAPI && window.signageAPI.retryDisplay) {
      window.signageAPI.retryDisplay(this.displayId);
    } else {
      window.location.href = this.targetUrl;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const controller = new OfflineController();
  controller.init();
});
