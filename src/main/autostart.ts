import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { logger } from './logger';
import { APP_NAME, APP_TITLE } from '../common/constants';

export class AutostartManager {
  private getLinuxAutostartPath(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.config', 'autostart', `${APP_NAME}.desktop`);
  }

  private getLinuxDesktopEntryContent(): string {
    const execPath = process.execPath;
    return `[Desktop Entry]
Type=Application
Version=1.0
Name=${APP_TITLE}
Comment=Unattended Digital Signage Runner
Exec=${execPath} --autostart
Terminal=false
StartupNotify=false
Categories=Utility;Kiosk;
X-GNOME-Autostart-enabled=true
`;
  }

  /**
   * Enables or disables automatic startup at user login.
   */
  public setAutostart(enable: boolean): boolean {
    const isWindows = process.platform === 'win32';
    const isLinux = process.platform === 'linux';

    try {
      if (isWindows) {
        app.setLoginItemSettings({
          openAtLogin: enable,
          path: process.execPath,
          args: ['--autostart'],
        });
        logger.info('Autostart', `Windows LoginItem autostart set to ${enable}`);
        return true;
      }

      if (isLinux) {
        const autostartFile = this.getLinuxAutostartPath();
        const autostartDir = path.dirname(autostartFile);

        if (enable) {
          if (!fs.existsSync(autostartDir)) {
            fs.mkdirSync(autostartDir, { recursive: true });
          }
          fs.writeFileSync(autostartFile, this.getLinuxDesktopEntryContent(), 'utf8');
          fs.chmodSync(autostartFile, '755');
          logger.info('Autostart', `Linux .desktop autostart created at ${autostartFile}`);
        } else {
          if (fs.existsSync(autostartFile)) {
            fs.unlinkSync(autostartFile);
            logger.info('Autostart', `Linux .desktop autostart removed from ${autostartFile}`);
          }
        }
        return true;
      }

      logger.warn('Autostart', `Autostart not explicitly implemented for platform ${process.platform}`);
      return false;
    } catch (err) {
      logger.error('Autostart', 'Failed to configure autostart:', err);
      return false;
    }
  }

  /**
   * Checks whether autostart is currently enabled.
   */
  public isEnabled(): boolean {
    try {
      if (process.platform === 'win32') {
        const settings = app.getLoginItemSettings();
        return settings.openAtLogin;
      }
      if (process.platform === 'linux') {
        return fs.existsSync(this.getLinuxAutostartPath());
      }
      return false;
    } catch (err) {
      logger.error('Autostart', 'Failed to check autostart status:', err);
      return false;
    }
  }

  /**
   * Generates systemd user service definition for Linux kiosk setups.
   */
  public getSystemdServiceDefinition(): string {
    const execPath = process.execPath;
    return `[Unit]
Description=${APP_TITLE} Kiosk Runner
After=graphical.target network-online.target
Wants=network-online.target

[Service]
Type=simple
Environment=DISPLAY=:0
Environment=XAUTHORITY=%h/.Xauthority
ExecStart=${execPath} --kiosk
Restart=always
RestartSec=5s
KillMode=process

[Install]
WantedBy=default.target
`;
  }
}

export const autostartManager = new AutostartManager();
