# Production Hardening & Deployment Guide

This guide covers operating system hardening and automation steps to ensure unattended, reliable, 24/7/365 digital signage deployments on **Windows** and **Linux**.

---

## 📋 General Best Practices for Unattended Kiosks

1. **Static IP / DHCP Reservation:** Assign fixed IP addresses to ensure predictable access via the HTTP REST API (port `9191`).
2. **Scheduled Daily OS Reboots:** Scheduling a daily reboot at 4:00 AM clears OS memory leaks, GPU driver states, and network socket tables:
   - Windows: Task Scheduler `shutdown /r /t 0 /f`
   - Linux: Cron job `0 4 * * * /sbin/reboot`
3. **Power Management:** Set the BIOS/UEFI setting **"Restore on AC Power Loss"** to **"Power On"** so kiosks boot automatically after power outages.

---

## 🪟 Windows 10 / 11 / Server Deployment

### 1. Automatic Logon (AutoLogon)
To recover from power loss without prompting for credentials:

1. Download **AutoLogon** from Microsoft Sysinternals.
2. Launch `Autologon.exe`, enter standard user credentials (e.g. `KioskUser`), and click **Enable**.
3. *Alternative Registry Configuration (`HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon`):*
   - `AutoAdminLogon` = `"1"`
   - `DefaultUserName` = `"KioskUser"`
   - `DefaultPassword` = `"YourPassword"`

---

### 2. Disable Sleep, Screen Blanking & Notification Popups
Execute in an elevated Administrator PowerShell prompt:
```powershell
# Disable screen timeout, sleep, and hibernate
powercfg -change -monitor-timeout-ac 0
powercfg -change -standby-timeout-ac 0
powercfg -change -hibernate-timeout-ac 0

# Disable Windows Error Reporting dialogs
Set-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\Windows Error Reporting" -Name "DontShowUI" -Value 1

# Disable Windows Action Center notifications
Set-ItemProperty -Path "HKCU:\Software\Policies\Microsoft\Windows\Explorer" -Name "DisableNotificationCenter" -Value 1
```

---

### 3. Windows Shell Replacement (Enterprise Kiosk Mode)
To replace `explorer.exe` (taskbar and desktop) entirely with Webpage Signage Runner:

1. In Windows 10/11 Enterprise / IoT, enable **Shell Launcher**.
2. Set the custom shell for the `KioskUser` account to:
   ```cmd
   "C:\Program Files\Webpage Signage Runner\Webpage Signage Runner.exe"
   ```

---

## 🐧 Linux Deployment (Ubuntu, Debian, Raspberry Pi OS)

### 1. Disable Screen Blanking & DPMS in X11
Add the following commands to `~/.xprofile` or `~/.xsessionrc`:
```bash
xset s off
xset -dpms
xset s noblank
```

---

### 2. Systemd User Service Configuration
Create a systemd user service to ensure the app is kept alive and automatically restarted if killed:

1. Create service unit file:
   ```bash
   mkdir -p ~/.config/systemd/user
   nano ~/.config/systemd/user/webpage-signage-runner.service
   ```

2. Add unit content:
   ```ini
   [Unit]
   Description=Webpage Signage Runner Kiosk Orchestrator
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

3. Enable and start:
   ```bash
   systemctl --user daemon-reload
   systemctl --user enable webpage-signage-runner.service
   systemctl --user start webpage-signage-runner.service
   ```

---

### 3. System-Wide Mouse Cursor Suppression (`unclutter`)
While Webpage Signage Runner suppresses cursors via CSS, you can hide the cursor globally at the X11 server level:
```bash
sudo apt-get install unclutter
# Add to desktop startup:
unclutter -idle 0.1 -root &
```
