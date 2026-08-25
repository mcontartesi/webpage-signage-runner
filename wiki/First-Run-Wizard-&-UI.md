# First-Run Wizard & Setup UI

The **Dark-Mode Setup Wizard** is the administrative control panel for configuring displays, network parameters, watchdog intervals, and authentication settings.

---

## 🎨 Overview

When Webpage Signage Runner starts without an existing `config.json` file, it bypasses kiosk mode and launches the setup window in centered windowed mode.

The setup interface is built with modern CSS custom properties, responsive grid layout, real-time validation, and smooth animations.

```
┌────────────────────────────────────────────────────────────────────────┐
│ 📺 Webpage Signage Runner • Setup & Configuration                      │
│ [Identify Screens] [Open Logs] [Emergency Help]                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ 🖥️ Display 1 [PRIMARY]                           Bounds: 1920x1080    │
│ Target URL: [ https://www.youtube.com                     ] [Test URL] │
│ ▾ Advanced Request Options (Headers, Method, Body)                     │
│   HTTP Method: [ GET ▾ ]                                               │
│   Headers (JSON): { "Authorization": "Bearer secret..." }              │
│   Zoom Factor: [ 100% ▾ ]   Auto Reload: [ 60 mins ▾ ]                 │
│                                                                        │
│ 🖥️ Display 2                                     Bounds: 3840x2160    │
│ Target URL: [ https://dashboard.company.com/kiosk          ] [Test URL]│
│   Zoom Factor: [ 150% ▾ ]   Auto Reload: [ 120 mins ▾ ]                │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ ⚙️ Global Settings                                                     │
│ [x] Start on OS Boot      [x] Hide Mouse Cursor     [x] Enable REST API│
│ API Port: [ 9191 ]       Auth Token: [                      ]          │
│                                                                        │
│                        [ 🚀 Save & Launch Kiosk Mode ]                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Features of the Setup Wizard

### 1. Connected Display Cards
Each connected monitor receives its own dedicated configuration card showing:
- Monitor index and Primary status badge (`PRIMARY`).
- Resolution width & height in pixels (e.g. `1920 x 1080` or `3840 x 2160`).
- Display position coordinate offsets (`X: 0, Y: 0`).
- Hardware identifier.

### 2. URL Input & Live Testing
- **URL Input:** Accepts any standard `http://` or `https://` web address.
- **Test Button:** Clicking "Test" issues a test HTTP request and verifies whether the host is reachable, displaying a green checkmark or error alert with status codes.

### 3. Advanced HTTP Request Drawer
Expandable drawer for configuring:
- **HTTP Method:** `GET`, `POST`, or `PUT`.
- **Custom Request Headers:** Multi-line key-value or JSON editor for Authorization tokens (`Bearer <jwt>`), `X-Api-Key`, or custom headers.
- **Request Body Payload:** Raw JSON or string body sent when requesting the URL.

### 4. Per-Screen Display Controls
- **Zoom Factor:** Scale web content from `50%` to `300%` (`0.5` to `3.0`), ideal for high-DPI 4K and 8K screens where web fonts would otherwise be unreadable at viewing distance.
- **Cache Reload Interval:** Specify how often Chromium purges memory caches and reloads the URL (`30 min`, `60 min`, `120 min`, `240 min`, or `Disabled`).
- **Retry Delay:** Seconds to wait before attempting reconnection when network goes offline.

### 5. Global Signage Settings
- **Start Automatically on Boot:** Configures Windows Registry / LoginItems or Linux autostart desktop entry.
- **Global Mouse Cursor Suppression:** Injects CSS to hide mouse pointers across all screens.
- **Embedded REST API:** Toggle the embedded HTTP server, change port (default `9191`), and configure an optional API authentication secret key.
- **Watchdog Settings:** Adjust maximum retry counts and unresponsive renderer timeout limits.

---

## 💾 Saving & Launching

When you click **"Save & Launch Kiosk Mode"**:
1. Settings are validated against the **Zod schema** in the main process.
2. The sanitized configuration is written atomically to `config.json`.
3. If autostart was modified, the OS startup entry is updated.
4. The setup window closes.
5. Kiosk windows are spawned across all configured monitors and pinned to their physical coordinates.

---

## 🔄 Reopening the Setup Wizard

To reopen the Setup Wizard at any point:
- **Locally:** Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any connected physical keyboard.
- **Remotely:** Send a POST request to `http://<kiosk-ip>:9191/api/setup`.
