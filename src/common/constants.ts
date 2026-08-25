import { SignageConfig } from './types';

export const APP_NAME = 'webpage-signage-runner';
export const APP_TITLE = 'Webpage Signage Runner';
export const APP_AUTHOR = 'Maximiliano Contartesi';
export const APP_VERSION = '1.0.0';

export const AUTHOR_CREDITS = {
  name: 'Maximiliano Contartesi',
  githubUrl: 'https://github.com/mcontartesi',
  githubUser: '@mcontartesi',
  linkedinUrl: 'https://www.linkedin.com/in/maxiconta/',
  linkedinUser: 'maxiconta',
  email: 'maxiconta@gmail.com',
  emailDisplay: 'maxiconta [at] gmail [dot] com',
  mediumUrl: 'https://medium.com/@maxiconta',
  mediumUser: '@maxiconta',
};

export const DEFAULT_PORT = 9191;
export const DEFAULT_HOST = '0.0.0.0';
export const DEFAULT_RETRY_INTERVAL_SECONDS = 10;
export const DEFAULT_RELOAD_INTERVAL_MINUTES = 60;
export const DEFAULT_UNRESPONSIVE_TIMEOUT_SECONDS = 15;

export const DEFAULT_EMERGENCY_SHORTCUTS = [
  'CommandOrControl+Shift+C',
  'CommandOrControl+Alt+S',
];

export const DEFAULT_CONFIG: SignageConfig = {
  version: APP_VERSION,
  defaultUrl: 'https://www.youtube.com',
  hideCursorGlobal: true,
  defaultReloadIntervalMinutes: DEFAULT_RELOAD_INTERVAL_MINUTES,
  defaultRetryIntervalSeconds: DEFAULT_RETRY_INTERVAL_SECONDS,
  autoStartOnBoot: true,
  emergencyShortcut: 'CommandOrControl+Shift+C',
  api: {
    enabled: true,
    port: DEFAULT_PORT,
    host: DEFAULT_HOST,
    authToken: '',
    cors: true,
  },
  watchdog: {
    maxRetries: 10,
    unresponsiveTimeoutSeconds: DEFAULT_UNRESPONSIVE_TIMEOUT_SECONDS,
    clearCacheOnReload: true,
    autoRecoverCrashes: true,
  },
  displays: [],
};

export const CHROMIUM_FLAGS = [
  // Disable touch pinch-to-zoom
  '--disable-pinch',
  // Disable swipe history navigation (back/forward on touchscreens)
  '--overscroll-history-navigation=0',
  // Suppress default browser checks
  '--no-default-browser-check',
  // Suppress translation infobars
  '--disable-features=TranslateUI,TouchpadOverscrollHistoryNavigation',
  // Allow unattended autoplay of video/audio without user gesture
  '--autoplay-policy=no-user-gesture-required',
  // Keep background JS timers running at full speed across multi-monitors
  '--disable-background-timer-throttling',
  // Prevent renderer background throttling when window is not in foreground focus
  '--disable-renderer-backgrounding',
  // Suppress crash notifications and infobars
  '--disable-infobars',
  '--disable-session-crashed-bubble',
  // Prevent component extension updates in kiosk mode
  '--disable-component-update',
];
