<div align="center">

# Webpage Signage Runner

**Enterprise-Grade, Unattended Multi-Display Digital Signage Kiosk & Video Wall Orchestrator for Windows and Linux.**

[![Release: v1.1.2](https://img.shields.io/badge/Release-v1.1.2-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8?logo=googlechrome&logoColor=white)](https://mcontartesi.github.io/webpage-signage-runner/)
[![Wiki Documentation](https://img.shields.io/badge/Documentation-GitHub%20Wiki-blueviolet?logo=gitbook&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/wiki)
[![Downloads](https://img.shields.io/badge/Downloads-Windows%20%7C%20Linux-10b981?logo=windows&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-44.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey)](DEPLOYMENT.md)
[![Created By Maximiliano Contartesi](https://img.shields.io/badge/Author-Maximiliano%20Contartesi-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi)

<p align="center">
  <b>🌐 Language / Idioma / 语言:</b><br>
  <a href="README.md"><b>English</b></a> •
  <a href="README.es.md"><b>Español</b></a> •
  <a href="README.zh-CN.md"><b>简体中文</b></a>
</p>

<p align="center">
  <a href="https://mcontartesi.github.io/webpage-signage-runner/"><b>🌐 Interactive Live Demo</b></a> •
  <a href="https://github.com/mcontartesi/webpage-signage-runner/wiki"><b>📚 Official GitHub Wiki</b></a> •
  <a href="#-quick-download-standalone-binaries"><b>📥 Direct Downloads</b></a> •
  <a href="#-core-capabilities--key-features">Key Features</a> •
  <a href="#-remote-http-rest-api--swagger-ui">REST API</a> •
  <a href="#-author--creator">About Author</a>
</p>

</div>

---

## 📌 Overview & Value Proposition

**Webpage Signage Runner** is an open-source, production-ready, unattended multi-screen digital signage kiosk application created and architected by **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

Engineered for 24/7 reliability in demanding commercial environments, retail stores, video walls, airport terminals, control rooms, and corporate lobbies, Webpage Signage Runner transforms standard Windows and Linux machines into robust, self-healing digital signage players without expensive SaaS subscriptions or vendor lock-in.

### 🌟 Why Webpage Signage Runner?
- **Zero SaaS Subscriptions & 100% Open Source:** Free for commercial and personal deployments under the MIT License.
- **Hardware-Agnostic Multi-Display:** Pins independent, fullscreen, borderless web views to exact physical screen coordinates with hot-plug support.
- **Advanced HTTP Authentication & Feeds:** Native support for `GET`, `POST`, and `PUT` request methods with custom authorization headers (`Bearer`, `X-Api-Key`, basic auth) and custom payload injection.
- **Zero-Downtime Memory & Cache Watchdog:** Automated deep cache clearing (HTTP disk/memory cache, Service Workers, CacheStorage) and forced reloads every 60 minutes with cache-busting headers to prevent memory leaks and display stale content.
- **Self-Healing Offline Resilience:** Automatic network failure detection with an animated countdown fallback UI, automatic reconnection listeners, and crash/OOM recovery.
- **Remote HTTP REST API & Swagger UI:** Integrated control server on port `9191` with interactive Swagger UI documentation, live remote screenshot capture, health checks, and instant content updates.

---

## 📥 Quick Download (Standalone Binaries)

> **No technical knowledge or Node.js required!** Download the standalone binary for your operating system, launch the app, configure your URLs, and run in full kiosk mode immediately.

### 🪟 Windows (Windows 10 / 11 / Windows Server)

| Package Type | File | Description | Download Link |
|---|---|---|---|
| **Setup Installer** | `Webpage-Signage-Runner-Setup-1.1.2-x64.exe` | Standard Windows Installer with Desktop/Start Menu shortcuts & autostart options | [⬇️ Download Installer](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Setup-1.1.2-x64.exe) |
| **Portable Executable** | `Webpage-Signage-Runner-Portable-1.1.2-x64.exe` | Standalone portable executable. Run from any USB drive or folder with zero installation | [⬇️ Download Portable](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Portable-1.1.2-x64.exe) |

### 🐧 Linux (Ubuntu, Debian, Fedora, RHEL, Arch, Raspberry Pi OS x64)

| Package Format | File | Description | Download Link |
|---|---|---|---|
| **AppImage** | `webpage-signage-runner-1.1.2-x64.AppImage` | Universal standalone Linux executable (runs across all major distributions) | [⬇️ Download AppImage](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.AppImage) |
| **Debian / Ubuntu** | `webpage-signage-runner-1.1.2-x64.deb` | Native `.deb` package for Ubuntu, Debian, Linux Mint, and derivatives | [⬇️ Download .deb](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.deb) |
| **Fedora / RHEL** | `webpage-signage-runner-1.1.2-x64.rpm` | Native `.rpm` package for Fedora, CentOS, Red Hat Enterprise Linux, Rocky Linux | [⬇️ Download .rpm](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.rpm) |
| **Tarball** | `webpage-signage-runner-1.1.2-x64.tar.gz` | Portable binary tar archive for custom deployments | [⬇️ Download .tar.gz](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.tar.gz) |

👉 **[View all Releases and Version Changelogs on GitHub Releases](https://github.com/mcontartesi/webpage-signage-runner/releases)**

---

## ⚡ 3-Step Quick Start (End-User Guide)

```
+-------------------+      +-------------------+      +-------------------+
| 1. Download App   | ---> | 2. Launch Wizard  | ---> | 3. Fullscreen Run |
| (Windows / Linux) |      | (Setup URLs & API)|      | (24/7 Multi-Kiosk)|
+-------------------+      +-------------------+      +-------------------+
```

1. **Download & Launch**: Grab the installer or AppImage above and start the application.
2. **Configure Displays**: On first boot, the dark-mode **Setup Wizard** appears automatically:
   - Displays all connected monitors with their physical resolutions and coordinates.
   - Click **"Identify Screens"** to flash prominent numbers on all physical screens.
   - Enter your target URLs (e.g. `https://www.youtube.com`, Grafana dashboards, BI metrics, promotional web apps).
   - Configure HTTP request parameters (headers, auth tokens, POST payloads) if needed.
3. **Launch Kiosk Mode**: Click **"Save & Launch Kiosk Mode"**. The app immediately locks into fullscreen borderless kiosk mode across all physical displays.

> [!TIP]
> **Emergency Unlock Hotkey:** Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any keyboard at any time to instantly unlock the kiosk and reopen the Setup Wizard.

---

## ✨ Core Capabilities & Key Features

### 🖥️ Dynamic Multi-Display Orchestration
- Automatically queries and monitors all attached hardware monitors via `screen.getAllDisplays()`.
- Spawns and fixes independent, borderless, always-on-top kiosk `BrowserWindow` instances to exact pixel coordinates.
- **Dynamic Hot-Plugging:** Seamlessly handles display connects and disconnects (`display-added`, `display-removed`) without crashes or service interruptions.
- Visual display identification overlay tool to verify physical monitor mappings during field installations.

### 🔐 Advanced HTTP Requests & Enterprise Authentication
- Supports `GET`, `POST`, and `PUT` HTTP methods on a per-display basis.
- Custom HTTP request header injection for protected endpoints:
  - `Authorization: Bearer <jwt-token>`
  - `X-Api-Key: <enterprise-key>`
  - `Content-Type: application/json`
- Supports custom JSON payloads and URL-encoded bodies for dynamic kiosk endpoints and reporting feeds.

### 🛡️ 24/7 Self-Healing Watchdog & Deep Cache Purge
- **Network Outage Resilience:** When network drops occur, displays automatically transition to an integrated **Offline Fallback UI** featuring live connection diagnostics and an animated auto-retry countdown timer.
- **Instant Reconnect:** Automatically detects network restoration (`navigator.onLine`) and reloads instantly.
- **Crash & OOM Auto-Recovery:** Automatically captures `render-process-gone` and `unresponsive` events to resurrect crashed display renderers without OS reboots.
- **Forced Full Page Reload & Cache Purge:** Executes periodic hard reloads (default: every **60 minutes**), completely purging Chromium disk/memory cache, Service Workers, and CacheStorage, with cache-busting headers (`Cache-Control: no-cache, no-store, must-revalidate`).

### 📡 Embedded HTTP REST API & Swagger UI
- Integrated high-performance local control server (default port `9191`).
- **Interactive Swagger UI:** Accessible directly at `http://<kiosk-ip>:9191/` or `http://<kiosk-ip>:9191/docs` for API exploration and manual testing.
- **OpenAPI 3.0 Specification:** Exportable specification at `/openapi.json`.
- **Live Remote Screenshots:** Endpoint `/api/displays/:id/screenshot` returns real-time PNG screenshots of display outputs for remote health verification.
- **Bearer Token Security & CORS:** Configurable API authentication and Cross-Origin Resource Sharing.

### ⚙️ Operating System Integration
- **Screensaver & Standby Inhibitor:** Prevents sleep and display power-off via `electron.powerSaveBlocker`.
- **Mouse Cursor Suppression:** Injects global CSS rules (`* { cursor: none !important; }`) to hide mouse pointers in touch and display environments.
- **OS Autostart Support:** Automatic startup integration for Windows (LoginItems) and Linux (`.desktop` / `systemd`).

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph HostOS["Host Operating System (Windows / Linux)"]
        Power["Power Save & Screen Sleep Blocker"]
        AutoStart["OS Autostart Integration"]
        Hotkeys["Global Emergency Shortcut (Ctrl+Shift+C)"]
    end

    subgraph MainProcess["Electron Main Controller (Node.js & TypeScript)"]
        WM["Window & Display Manager"]
        CM["Config Manager (Zod Validated)"]
        WD["Watchdog & Cache Purger"]
        API["Embedded REST API & Swagger UI (:9191)"]
        Log["Structured Daily Rotating Logger"]
    end

    subgraph Hardware["Hardware Monitors"]
        D1["Physical Display 1"]
        D2["Physical Display 2"]
        DN["Physical Display N"]
    end

    subgraph Renderers["Chromium Renderers & Views"]
        UI1["Kiosk Window 1"]
        UI2["Kiosk Window 2"]
        UIN["Kiosk Window N"]
        Offline["Offline Fallback Screen"]
        Setup["Dark-Mode Setup Wizard"]
    end

    HostOS --> MainProcess
    WM -->|"Pins Coordinates"| D1
    WM -->|"Pins Coordinates"| D2
    WM -->|"Pins Coordinates"| DN
    WM --> UI1
    WM --> UI2
    WM --> UIN
    WD -->|"On Network Loss / Crash"| Offline
    CM -->|"First Boot"| Setup
    API -->|"Remote Management"| WM
```

---

## 📡 Remote HTTP REST API & Swagger UI

Webpage Signage Runner provides an embedded HTTP REST server (port `9191` by default) designed for centralized remote management, observability, and remote command execution.

### Interactive API Explorer
Open `http://localhost:9191/` (or `http://<kiosk-ip>:9191/docs`) in any web browser to view the interactive Swagger UI.

### REST Endpoints Summary

| Method | Endpoint | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/` or `/docs` | Interactive Swagger UI API Explorer | - |
| `GET` | `/openapi.json` | OpenAPI 3.0 JSON Specification | - |
| `GET` | `/health` | High-speed liveness check probe (`{"status":"ok"}`) | - |
| `GET` | `/api/status` | Full node telemetry, memory usage, uptime & display states | - |
| `POST` | `/api/reload` | Triggers immediate cache clear and hard reload on all displays | - |
| `POST` | `/api/displays/:id/reload` | Hard reload on a specific display ID | - |
| `POST` | `/api/displays/:id/url` | Pushes a new URL, HTTP method, headers, or body payload live | `{"url":"...","httpMethod":"GET"}` |
| `GET` | `/api/displays/:id/screenshot` | Captures a live PNG screenshot of what the display is showing | Returns `image/png` binary |
| `POST` | `/api/identify` | Flashes large display identification numbers on all monitors | - |
| `POST` | `/api/setup` | Opens the Setup Wizard UI remotely | - |

> For complete API request examples, curl scripts, and token authorization details, refer to [API.md](API.md).

---

## ⚙️ Configuration Reference (`config.json`)

The application stores its configuration file in the OS user data directory:
- **Windows:** `%APPDATA%\webpage-signage-runner\config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

### Annotated `config.json` Example

```json
{
  "version": "1.0.0",
  "defaultUrl": "https://www.youtube.com",
  "hideCursorGlobal": true,
  "defaultReloadIntervalMinutes": 60,
  "defaultRetryIntervalSeconds": 10,
  "autoStartOnBoot": true,
  "emergencyShortcut": "CommandOrControl+Shift+C",
  "api": {
    "enabled": true,
    "port": 9191,
    "host": "0.0.0.0",
    "authToken": "signage-secret-token-12345",
    "cors": true
  },
  "watchdog": {
    "maxRetries": 10,
    "unresponsiveTimeoutSeconds": 15,
    "clearCacheOnReload": true,
    "autoRecoverCrashes": true
  },
  "displays": [
    {
      "id": 1,
      "label": "Lobby Main Video Wall (YouTube Live Stream)",
      "url": "https://www.youtube.com",
      "httpMethod": "GET",
      "headers": {
        "Authorization": "Bearer kiosk-token-lobby",
        "X-Custom-Station": "lobby-wall-01"
      },
      "reloadIntervalMinutes": 60,
      "retryIntervalSeconds": 10,
      "hideCursor": true,
      "zoomFactor": 1.0,
      "enabled": true
    },
    {
      "id": 2,
      "label": "Operations Analytics Dashboard (POST)",
      "url": "https://metrics.internal.corp/kiosk",
      "httpMethod": "POST",
      "headers": {
        "Authorization": "Bearer metrics-api-token-9988",
        "Content-Type": "application/json"
      },
      "requestBody": "{\"stationId\": 2, \"kioskMode\": true, \"theme\": \"dark\"}",
      "reloadIntervalMinutes": 120,
      "retryIntervalSeconds": 15,
      "hideCursor": true,
      "zoomFactor": 1.1,
      "enabled": true
    }
  ]
}
```

---

## 🛠️ Developer Quick Start & Build Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) v20.x or v22.x LTS
- npm v10+

### 1. Clone the Repository
```bash
git clone https://github.com/mcontartesi/webpage-signage-runner.git
cd webpage-signage-runner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run in Development Mode
```bash
npm run dev
```

### 4. Build & Package Standalone Binaries
```bash
# Typecheck TypeScript source
npm run typecheck

# Build TypeScript and static renderer assets
npm run build

# Run unit tests
npm test

# Package platform installers
npm run dist:win    # Builds Windows Setup .exe & Portable .exe
npm run dist:linux  # Builds Linux AppImage, .deb, .rpm, and .tar.gz
```

---

## 🏢 Production Deployment & OS Hardening

For step-by-step guidance on setting up Windows AutoLogon, Windows Shell Launcher, Linux systemd services, and Wayland/X11 unattended boot:
👉 **[Read the Full Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)**

---

## 👤 Author & Creator

**Webpage Signage Runner** was designed, developed, and open-sourced by **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

**Maximiliano Contartesi** is a Solutions Architect and Principal Software Engineer with deep industry experience in building high-availability desktop software, distributed Node.js/Electron systems, resilient IoT/kiosk infrastructure, and enterprise cloud applications.

### 🌐 Connect with Maximiliano Contartesi
- 💼 **LinkedIn Profile:** [https://www.linkedin.com/in/maxiconta/](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub Organization / Profile:** [@mcontartesi](https://github.com/mcontartesi)
- 📝 **Medium Articles:** [@maxiconta](https://medium.com/@maxiconta)
- ✉️ **Email / Professional Contact:** `maxiconta@gmail.com`
- 🌐 **Project Live Demo:** [https://mcontartesi.github.io/webpage-signage-runner/](https://mcontartesi.github.io/webpage-signage-runner/)
- 📚 **GitHub Wiki:** [https://github.com/mcontartesi/webpage-signage-runner/wiki](https://github.com/mcontartesi/webpage-signage-runner/wiki)

---

## 📄 License & Contributing

- **License:** Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.
- **Contributing:** Community contributions, issue reports, and pull requests are welcomed! Please review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting code.

<div align="center">
  <sub>Created with ❤️ by <b>Maximiliano Contartesi</b>. Built for 24/7 reliability in mission-critical digital signage.</sub>
</div>
