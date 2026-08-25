# Production Deployment Guide: Webpage Signage Runner

This guide covers hardening and configuring Windows and Linux operating systems for unattended, 24/7 digital signage operation with **Webpage Signage Runner**.

---

## Table of Contents
1. [General Recommendations for 24/7 Digital Signage](#general-recommendations-for-247-digital-signage)
2. [Windows 10 / 11 Deployment](#windows-10--11-deployment)
   - [Auto-Logon Configuration](#1-configure-automatic-login)
   - [Disable OS Notifications & Sleep](#2-disable-sleep--notifications)
   - [Task Scheduler or Shell Launcher](#3-set-up-autostart-or-shell-launcher)
3. [Linux Deployment (Ubuntu, Debian, Raspberry Pi OS)](#linux-deployment-ubuntu-debian-raspberry-pi-os)
   - [Disable Screen Blanking & DPMS](#1-disable-screen-blanking--screensaver)
   - [Systemd User Service Setup](#2-systemd-user-service-setup)
   - [Desktop Autostart](#3-x11--wayland-desktop-autostart)
   - [Hide Mouse Cursor (unclutter)](#4-optional-system-wide-cursor-suppression)
4. [Emergency Shortcuts & Remote Maintenance](#emergency-shortcuts--remote-maintenance)

---

## General Recommendations for 24/7 Digital Signage

1. **Static IP / Reserved DHCP**: Assign fixed IP addresses to kiosk devices to ensure predictable access via the HTTP Control API (e.g. port `9191`).
2. **Scheduled Daily OS Reboots**: While Chromium memory caches are periodically purged by Webpage Signage Runner, scheduling a 4:00 AM system reboot keeps OS drivers and network stacks clean.
3. **Disable Crash Dialogs**: Webpage Signage Runner automatically disables OS crash dialogs and intercepts process errors.

---

## Windows 10 / 11 Deployment

### 1. Configure Automatic Login (AutoLogon)
For kiosks to recover from power outages without human intervention, configure Windows to automatically log in to a dedicated standard user account (e.g. `KioskUser`):

1. Download Microsoft Sysinternals **AutoLogon** from Microsoft Docs.
2. Run `Autologon.exe`, select the `KioskUser` account, enter password, and click **Enable**.
3. Alternatively, configure via Registry (`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon`):
   - `AutoAdminLogon` = `"1"`
   - `DefaultUserName` = `"KioskUser"`
   - `DefaultPassword` = `"YourPassword"`

### 2. Disable Sleep & Notifications
Open an elevated PowerShell prompt:
```powershell
# Disable monitor timeout and standby
powercfg -change -monitor-timeout-ac 0
powercfg -change -standby-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0

# Disable Windows Error Reporting popups
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\Windows Error Reporting" -Name "DontShowUI" -Value 1
```

### 3. Set Up Autostart or Shell Launcher
Webpage Signage Runner has built-in auto-start that configures Windows Login Items when enabled in the Setup Wizard.

For complete Shell replacement (preventing users from seeing Explorer or the taskbar):
1. In Windows 10/11 Enterprise or IoT Enterprise, enable **Shell Launcher**.
2. Set the default shell for `KioskUser` to:
   ```cmd
   "C:\Program Files\Webpage Signage Runner\Webpage Signage Runner.exe"
   ```

---

## Linux Deployment (Ubuntu, Debian, Raspberry Pi OS)

### 1. Disable Screen Blanking & Screensaver
In X11 sessions, disable DPMS and screensaver timeout:
```bash
# Add to ~/.xprofile or ~/.xsessionrc
xset s off
xset -dpms
xset s noblank
```

### 2. Systemd User Service Setup
Create a user systemd service to ensure the kiosk automatically restarts if terminated:

1. Create service unit file:
   ```bash
   mkdir -p ~/.config/systemd/user
   nano ~/.config/systemd/user/webpage-signage-runner.service
   ```

2. Paste the following configuration:
   ```ini
   [Unit]
   Description=Webpage Signage Runner Kiosk
   After=graphical-session.target network-online.target
   Wants=network-online.target

   [Service]
   Type=simple
   Environment=DISPLAY=:0
   Environment=XAUTHORITY=%h/.Xauthority
   ExecStart=/usr/local/bin/webpage-signage-runner
   Restart=always
   RestartSec=5s
   KillMode=process

   [Install]
   WantedBy=graphical-session.target
   ```

3. Enable and start the service:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable webpage-signage-runner.service
   systemctl --user start webpage-signage-runner.service
   ```

### 3. X11 / Wayland Desktop Autostart
Alternatively, use the `.desktop` launcher generated automatically by Webpage Signage Runner in `~/.config/autostart/webpage-signage-runner.desktop`.

### 4. Optional System-Wide Cursor Suppression
Webpage Signage Runner suppresses cursors by default via CSS injection. To suppress the cursor globally at the X11 server level:
```bash
sudo apt-get install unclutter
# Run on login:
unclutter -idle 0.1 -root &
```

---

## Emergency Shortcuts & Remote Maintenance

### Admin Recovery Hotkeys
- Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any connected physical keyboard to bring up the Setup Wizard and unlock the kiosk.

### Remote Identification
- If you have multiple monitors and are unsure which screen matches which port, send a POST request:
  ```bash
  curl -X POST http://<kiosk-ip>:9191/api/identify
  ```
  This immediately flashes a large identification number on every connected screen for 5 seconds.

---

## About & Author Credits

Webpage Signage Runner is designed and engineered by **Maximiliano Contartesi** (Software Architect & Principal Engineer).

Created and maintained with ❤️ by [**Maximiliano Contartesi**](https://github.com/mcontartesi).
- 💼 **LinkedIn:** [maxiconta](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub:** [@mcontartesi](https://github.com/mcontartesi)
- ✉️ **Email / Contact:** maxiconta [at] gmail [dot] com
- 📝 **Medium:** [@maxiconta](https://medium.com/@maxiconta)
