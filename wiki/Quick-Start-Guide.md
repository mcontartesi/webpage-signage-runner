# Quick Start Guide

This guide will get your multi-monitor digital signage setup up and running in less than 3 minutes.

---

## 📥 1. Download the Application

Pre-compiled, ready-to-run binaries are available on the [GitHub Releases](https://github.com/mcontartesi/webpage-signage-runner/releases) page for Windows and Linux:

### 🪟 Windows (Windows 10, 11, Server)
- **Installer:** `Webpage-Signage-Runner-Setup-1.0.0-x64.exe`  
  *Installs the app, creates Desktop and Start Menu shortcuts, and sets up optional Windows Startup integration.*
- **Portable:** `Webpage-Signage-Runner-Portable-1.0.0-x64.exe`  
  *No installation required. Run directly from a USB stick, network drive, or local folder.*

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch, Raspberry Pi OS)
- **AppImage:** `webpage-signage-runner-1.0.0-x64.AppImage` (Universal standalone binary)
- **Debian / Ubuntu:** `webpage-signage-runner-1.0.0-x64.deb`
- **Fedora / RHEL:** `webpage-signage-runner-1.0.0-x64.rpm`
- **Tarball:** `webpage-signage-runner-1.0.0-x64.tar.gz`

---

## 🚀 2. Launch & Configure

### On Windows
Double-click the downloaded executable.

### On Linux (AppImage)
Make the AppImage executable and run it:
```bash
chmod +x webpage-signage-runner-1.0.0-x64.AppImage
./webpage-signage-runner-1.0.0-x64.AppImage
```

> [!NOTE]
> If running on Ubuntu/Debian without FUSE installed, launch with:  
> `./webpage-signage-runner-1.0.0-x64.AppImage --no-sandbox --appimage-extract-and-run`

---

## 🖥️ 3. First-Run Setup Wizard

When Webpage Signage Runner starts for the first time without an existing `config.json`, it automatically presents the **Dark-Mode Setup Wizard**:

1. **Review Connected Screens:** The wizard detects all active physical monitors (Resolution, Refresh Rate, Coordinate Position, and Primary tag).
2. **Identify Displays:** Click the **"Identify Screens"** button in the header. The app immediately flashes huge, numbered badge overlays across all physical screens for 5 seconds.
3. **Set URLs:** Enter the URL for each screen (e.g. `https://www.youtube.com`, your live metrics dashboard, Grafana, or an internal portal).
4. **Test URL:** Click **"Test"** next to any URL to verify accessibility directly from the wizard.
5. **Adjust Settings:**
   - **Zoom Factor:** Scale content (e.g., `100%`, `125%`, `150%`).
   - **Auto Reload:** Set cache purge interval (e.g., every 60 minutes) to eliminate memory leaks.
   - **Hide Cursor:** Toggle mouse cursor suppression.
6. **Launch:** Click **"Save & Launch Kiosk Mode"**.

The application immediately switches into full-screen, borderless, always-on-top kiosk windows across all physical monitors.

---

## 🛑 Emergency Admin Escape Key

If you need to unlock the kiosk or modify configuration while running in kiosk mode:

Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any keyboard connected to the kiosk machine.

This will instantly exit the locked kiosk display and open the Setup Wizard interface.

---

## 🌐 Remote Access (REST API & Swagger UI)

By default, the application runs an embedded management server on port `9191`. Open any browser on the local network:

```
http://<kiosk-device-ip>:9191/
```

This opens the interactive **Swagger UI Documentation Explorer**, allowing you to check status, capture live screenshots, reload screens, or push new URLs remotely.

For details, see the [[REST API & Swagger UI|REST-API-&-Swagger-UI]] page.
