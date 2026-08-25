<div align="center">

# Webpage Signage Runner

**Production-grade, unattended Multi-Display Digital Signage Kiosk orchestrator for Windows and Linux.**

[![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![Wiki Documentation](https://img.shields.io/badge/Documentation-GitHub%20Wiki-blueviolet?logo=gitbook&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/wiki)
[![Downloads](https://img.shields.io/badge/Downloads-Windows%20%7C%20Linux-10b981?logo=windows&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-44.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey)](DEPLOYMENT.md)
[![Created By Maximiliano Contartesi](https://img.shields.io/badge/Author-Maximiliano%20Contartesi-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi)

<p align="center">
  <a href="https://github.com/mcontartesi/webpage-signage-runner/wiki"><b>📚 Official GitHub Wiki</b></a> •
  <a href="#-quick-download--descargas-directas"><b>📥 Quick Download</b></a> •
  <a href="#key-features">Key Features</a> •
  <a href="#first-run-wizard">First-Run Wizard</a> •
  <a href="#advanced-http-requests--authentication">HTTP & Auth</a> •
  <a href="#configuration-configjson">Configuration</a> •
  <a href="#remote-http-rest-api--swagger-ui">REST API & Swagger</a> •
  <a href="#resilience--watchdog">Watchdog</a> •
  <a href="#about--credits">About & Credits</a> •
  <a href="#guía-en-español">Español</a>
</p>

</div>

---

## 📥 Quick Download / Descargas Directas

> **No technical knowledge or Node.js required!** Download the compiled standalone application for your operating system, double click, and start running your digital signage setup immediately.

### 🪟 Windows (Windows 10 / 11 / Server)

| Type | File | Description | Download |
|---|---|---|---|
| **Installer** | `Webpage-Signage-Runner-Setup-1.0.0-x64.exe` | Standard Windows Setup Wizard (with Desktop & Start Menu shortcuts, Autostart) | [⬇️ Download Installer](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Setup-1.0.0-x64.exe) |
| **Portable** | `Webpage-Signage-Runner-Portable-1.0.0-x64.exe` | Standalone executable (runs directly from USB or folder, no installation required) | [⬇️ Download Portable](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Portable-1.0.0-x64.exe) |

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch, Raspberry Pi OS)

| Package | File | Description | Download |
|---|---|---|---|
| **AppImage** | `webpage-signage-runner-1.0.0-x64.AppImage` | Universal Linux standalone binary (runs on all distributions) | [⬇️ Download AppImage](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.AppImage) |
| **Debian / Ubuntu** | `webpage-signage-runner-1.0.0-x64.deb` | Native `.deb` package for Ubuntu, Debian, Linux Mint | [⬇️ Download .deb](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.deb) |
| **Fedora / RHEL** | `webpage-signage-runner-1.0.0-x64.rpm` | Native `.rpm` package for Fedora, CentOS, Rocky Linux | [⬇️ Download .rpm](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.rpm) |
| **Tarball** | `webpage-signage-runner-1.0.0-x64.tar.gz` | Portable tarball archive | [⬇️ Download .tar.gz](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.tar.gz) |

👉 **[View all Releases and Version Changelog on GitHub Releases](https://github.com/mcontartesi/webpage-signage-runner/releases)**

---

## 🚀 How to Run in 3 Easy Steps (End-User Guide)

1. **Download** the appropriate file above for your OS.
2. **Launch** the app:
   - On **Windows**: Double-click `Webpage-Signage-Runner-Setup-1.0.0-x64.exe` or `Webpage-Signage-Runner-Portable-1.0.0-x64.exe`.
   - On **Linux AppImage**: Make it executable (`chmod +x webpage-signage-runner-*.AppImage`) and run it.
3. **Configure & Launch**:
   - The dark-mode setup wizard will automatically open on first boot.
   - Enter your target URLs (e.g. `https://www.youtube.com`, Grafana dashboards, web apps).
   - Click **"Save & Launch Kiosk Mode"** — the app immediately locks into fullscreen borderless kiosk mode across all physical monitors.

> [!TIP]
> **Emergency Unlock Hotkey:** Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any keyboard at any time to unlock the kiosk and bring up the Setup Wizard.

---

## Key Features

- **Dynamic Multi-Display Orchestration**: Automatically enumerates all connected physical screens (`screen.getAllDisplays()`) and pins independent, borderless, always-on-top kiosk windows to each screen's exact coordinates.
- **Dynamic Hot-Plugging**: Seamlessly reacts to monitor connection and disconnection events (`display-added`, `display-removed`) without crashing or restarting the application.
- **First-Run Dark Mode Setup Wizard**: If no configuration exists, boots into an intuitive dark-mode setup wizard to discover screens, assign URLs (such as `https://www.youtube.com`, live dashboards, or internal web apps), configure zoom levels, and test connectivity.
- **Advanced HTTP Requests & Authentication**: Supports `GET`, `POST`, and `PUT` request methods per display, allowing you to inject custom HTTP headers (such as `Authorization: Bearer <token>`, `X-Api-Key`, custom secrets) and raw request payloads into the initial and reload requests.
- **Visual Screen Identification**: Flashes prominent screen index overlay numbers on all physical monitors at the click of a button so installers know exactly which monitor is which.
- **Self-Healing Process Watchdog**:
  - Automatically intercepts network/loading failures and transitions to a branded **Offline Fallback UI** with live countdown timer and auto-retry loop.
  - Automatically restarts/recovers renderers on `unresponsive` or `render-process-gone` (crashes / OOM).
  - Performs scheduled background cache purges (`reloadIntervalMinutes`) to eliminate Chromium 24/7 memory leaks.
- **Embedded HTTP REST & Health API with Swagger UI**: Integrated local server (default port `9191`) for health checks (`/health`), system status (`/api/status`), remote reloads, dynamic URL changes, live screenshot captures, and interactive Swagger UI documentation at `http://localhost:9191/`.
- **OS Integration & Polishing**:
  - Prevents system sleep and monitor standby using `electron.powerSaveBlocker`.
  - Automatic mouse cursor suppression via CSS injection (`* { cursor: none !important; }`).
  - Automatic startup on boot for Windows (LoginItems) and Linux (`.desktop` / `systemd`).
  - Emergency admin escape hotkey (`Ctrl+Shift+C` / `CmdOrCtrl+Alt+S`).

---

## System Architecture

```mermaid
flowchart TD
    subgraph HostOS["Host OS (Windows / Linux)"]
        Power["Power Save Blocker"]
        AutoStart["OS Autostart Integration"]
        Hotkeys["Global Emergency Shortcuts"]
    end

    subgraph MainProcess["Electron Main Process"]
        WM["Window Manager"]
        CM["Config Manager (Zod)"]
        WD["Watchdog & Cache Purger"]
        API["Embedded HTTP API (:9191)"]
        Log["Structured Logger"]
    end

    subgraph Displays["Hardware Displays"]
        D1["Physical Screen 1"]
        D2["Physical Screen 2"]
        DN["Physical Screen N"]
    end

    subgraph Renderers["Renderers & Views"]
        UI1["Kiosk BrowserWindow 1"]
        UI2["Kiosk BrowserWindow 2"]
        UIN["Kiosk BrowserWindow N"]
        Offline["Offline Fallback UI"]
        Setup["Setup Wizard UI"]
    end

    HostOS --> MainProcess
    WM -->|"Pin bounds"| D1
    WM -->|"Pin bounds"| D2
    WM -->|"Pin bounds"| DN
    WM --> UI1
    WM --> UI2
    WM --> UIN
    WD -->|"On Failure"| Offline
    CM -->|"First Run"| Setup
    API -->|"Remote Control"| WM
```

---

## Developer Quick Start

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20.x or v22.x LTS
- npm v10+

### 2. Clone & Install
```bash
git clone https://github.com/mcontartesi/webpage-signage-runner.git
cd webpage-signage-runner
npm install
```

### 3. Launch in Development Mode
```bash
npm run dev
```

### 4. Build & Package
```bash
# Build TypeScript and assets
npm run build

# Package unpacked application
npm run pack

# Package platform installers
npm run dist:win    # Windows NSIS & Portable .exe
npm run dist:linux  # Linux AppImage, .deb, .rpm
```

---

## First-Run Wizard

When launching without an existing `config.json` file:
1. The application opens the **Dark-Mode Setup Wizard**.
2. All connected displays are enumerated with resolution, refresh rate, and coordinates.
3. Click **"Identify Screens"** to flash large numbers on every screen.
4. Input the desired target URL for each display (e.g. `https://www.youtube.com`, dashboards, Grafana, PowerBI, video walls).
5. (Optional) Expand **"Advanced HTTP Request Options"** to configure `GET`/`POST`/`PUT` methods, custom headers (`Authorization: Bearer <token>`), or request body payloads.
6. Click **"Save & Launch Kiosk Mode"** to save `config.json` atomically and start running immediately.

---

## Advanced HTTP Requests & Authentication

Webpage Signage Runner allows configuring rich HTTP request parameters per display:
- **HTTP Methods**: Support for `GET`, `POST`, and `PUT`.
- **Custom Headers**: Pass Authorization tokens (Bearer, Basic, API keys) or custom corporate secrets:
  ```http
  Authorization: Bearer secret-kiosk-token-12345
  X-Custom-Station-Secret: entrance-kiosk-alpha
  Content-Type: application/json
  ```
- **Request Body**: Send raw JSON or form-encoded payloads for POST and PUT feeds:
  ```json
  {
    "stationId": 1,
    "kioskMode": true,
    "theme": "dark"
  }
  ```

---

## Configuration (`config.json`)

Configurations are saved under `app.getPath('userData')/config.json`:
- **Windows:** `%APPDATA%/webpage-signage-runner/config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

### Example `config.json`
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
      "label": "Lobby Main Video Wall (YouTube Live Feed)",
      "url": "https://www.youtube.com",
      "httpMethod": "GET",
      "headers": {
        "Authorization": "Bearer sample-token",
        "X-Custom-Secret": "secret-123"
      },
      "reloadIntervalMinutes": 60,
      "retryIntervalSeconds": 10,
      "hideCursor": true,
      "zoomFactor": 1.0,
      "enabled": true
    },
    {
      "id": 2,
      "label": "Internal Metrics Feed (POST)",
      "url": "https://dashboard.company.internal/kiosk",
      "httpMethod": "POST",
      "headers": {
        "Authorization": "Bearer metrics-token-9988",
        "Content-Type": "application/json"
      },
      "requestBody": "{\"stationId\": 2, \"kioskMode\": true}",
      "reloadIntervalMinutes": 120,
      "retryIntervalSeconds": 15,
      "hideCursor": true,
      "zoomFactor": 1.25,
      "enabled": true
    }
  ]
}
```

---

## Remote HTTP REST API & Swagger UI

Webpage Signage Runner features an embedded HTTP server (port `9191` by default) for remote monitoring, central management, and interactive API exploration.

- **Interactive Swagger UI:** Navigate to `http://<kiosk-ip>:9191/` (or `http://<kiosk-ip>:9191/docs`) in any browser to access the complete Swagger UI documentation with live request testing and schemas.
- **OpenAPI 3.0 JSON:** `http://<kiosk-ip>:9191/openapi.json`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` or `/docs` | Interactive Swagger UI Documentation Explorer |
| `GET` | `/openapi.json` | OpenAPI 3.0 JSON Specification |
| `GET` | `/health` | Fast liveness probe (`200 OK`) |
| `GET` | `/api/status` | Complete node telemetry, uptime, memory, and display states |
| `POST` | `/api/reload` | Triggers immediate cache clear & reload on all screens |
| `POST` | `/api/displays/:id/reload` | Reloads a specific screen |
| `POST` | `/api/displays/:id/url` | Pushes a new URL, method, headers, or body live |
| `GET` | `/api/displays/:id/screenshot` | Captures an instant PNG screenshot of what the screen is displaying |
| `POST` | `/api/identify` | Flashes screen identification numbers across all monitors |
| `POST` | `/api/setup` | Opens the Setup Wizard remotely |

For complete API documentation, headers, and `curl` examples, see [API.md](API.md).

---

## Resilience & Watchdog

- **Network Failures:** In case of connection dropout, displays automatically render `offline.html` showing diagnostics and an animated countdown before retrying. When the OS network adapter reconnects (`navigator.onLine`), it reloads immediately.
- **Renderer Crashes / OOM:** The watchdog listens to `render-process-gone` and `unresponsive` events to automatically reboot the crashed display window without requiring an OS restart.
- **Memory Purge:** Every `reloadIntervalMinutes`, Chromium's cache and memory storage are purged to avoid long-term JavaScript memory leaks in 24/7 setups.
- **Structured Logs:** Stored in `userData/logs/signage-YYYY-MM-DD.log` with automatic 7-day log retention.

---

## Production Hardening

For step-by-step instructions on setting up Windows AutoLogon, Windows Shell Launcher, Linux systemd user services, and Wayland/X11 kiosk mode, please refer to the [Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md).

---

## About & Credits

**Webpage Signage Runner** was designed and engineered by **Maximiliano Contartesi**, a Principal Software Engineer and Solutions Architect specialized in high-availability desktop applications, Node.js, TypeScript, and Electron kiosk architecture.

Created and maintained with ❤️ by [**Maximiliano Contartesi**](https://github.com/mcontartesi).

- 💼 **LinkedIn:** [maxiconta](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub:** [@mcontartesi](https://github.com/mcontartesi)
- ✉️ **Email / Contact:** maxiconta [at] gmail [dot] com
- 📝 **Medium:** [@maxiconta](https://medium.com/@maxiconta)

---

## Guía en Español

### 📥 Descargas Rápidas (Para Usuarios Finales)
No se requieren conocimientos técnicos de programación ni Node.js. Descarga el ejecutable para tu sistema operativo:
- **Windows Instalador (`.exe`):** [Descargar Instalador](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Setup-1.0.0-x64.exe)
- **Windows Portable (`.exe`):** [Descargar Portable](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Portable-1.0.0-x64.exe)
- **Linux AppImage:** [Descargar AppImage](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.AppImage)
- **Linux Debian / Ubuntu (`.deb`):** [Descargar .deb](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.0.0-x64.deb)

### Características Principales
1. **Gestión Dinámica Multi-Monitor**: Detecta automáticamente todas las pantallas físicas conectadas y proyecta ventanas independientes sin bordes en modo Kiosk fijadas a las coordenadas exactas de cada pantalla.
2. **Soporte de URLs y Métodos HTTP Avanzados**: Configura URLs objetivo (como `https://www.youtube.com`, dashboards o paneles de control) permitiendo peticiones `GET`, `POST` y `PUT` con cabeceras personalizadas (`Authorization: Bearer <token>`, claves de API, secretos) y cuerpo de datos (payload JSON).
3. **Soporte Hot-Plug**: Maneja la conexión y desconexión de pantallas en caliente sin reiniciar la aplicación.
4. **Asistente de Configuración Inicial (Dark Mode)**: Si no existe configuración previa, inicia un asistente visual para identificar monitores, probar URLs y configurar parámetros.
5. **Identificación Visual de Pantallas**: Muestra números gigantes en cada monitor al presionar "Identify Screens" para facilitar la instalación física.
6. **Watchdog y Autorecuperación**:
   - Detecta fallos de red y muestra una pantalla offline con temporizador de reintento automático.
   - Recupera procesos colgados o caídos por falta de memoria (OOM).
   - Limpia periódicamente la caché de Chromium para evitar fugas de memoria en funcionamiento 24/7.
7. **API HTTP REST Embebida con Swagger UI (Puerto 9191)**: Permite monitoreo de estado, cambios remotos de URL, capturas de pantalla y reinicio. Incluye interfaz interactiva Swagger UI en `http://<ip>:9191/` (o `/docs`) para explorar y probar endpoints en vivo.
8. **Arranque Automático con el Sistema**: Configuración integrada para iniciar junto con Windows o Linux.
9. **Atajo de Emergencia**: Presiona **`Ctrl + Shift + C`** o **`CmdOrCtrl + Alt + S`** para salir del modo kiosk y abrir la configuración.

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for more information.

Created and maintained by **Maximiliano Contartesi**.
