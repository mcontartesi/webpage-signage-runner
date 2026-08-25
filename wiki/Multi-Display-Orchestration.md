# Multi-Display Orchestration

Webpage Signage Runner is architected from the ground up for multi-monitor setups, video walls, digital menu boards, and heterogeneous display arrays.

---

## 🖥️ Physical Screen Discovery & Coordinate Pinning

Electron provides physical screen information via `electron.screen.getAllDisplays()`. In multi-monitor systems, screens are arranged along a virtual desktop canvas that spans across negative and positive X and Y coordinate spaces.

```
                  Virtual Desktop Coordinate Space
┌────────────────────────────┬────────────────────────────┐
│ Display 1 (Primary)        │ Display 2 (Secondary)      │
│ Bounds: { x: 0, y: 0,      │ Bounds: { x: 1920, y: 0,   │
│           w: 1920, h: 1080}│           w: 3840, h: 2160}│
│ Zoom: 1.0 (100%)           │ Zoom: 1.5 (150% 4K scale)  │
│ URL: https://youtube.com   │ URL: https://grafana.int/  │
└────────────────────────────┴────────────────────────────┘
```

### Window Manager Strategy
The internal `WindowManager` module executes the following lifecycle for each detected screen:

1. **Calculates Exact Screen Bounds:** Retrieves the physical rectangle (`{ x, y, width, height }`) without relying on the OS taskbar work area.
2. **Creates Borderless, Frameless Window:**
   - `frame: false`
   - `kiosk: true`
   - `alwaysOnTop: true`
   - `skipTaskbar: true`
   - `enableLargerThanScreen: true`
3. **Explicit Coordinate Pinning:** Calls `window.setBounds(display.bounds)` before rendering, ensuring the window cannot drift onto adjacent monitors or snap back to the primary display.
4. **DPI & Scale Factor Handling:** Detects `display.scaleFactor` and automatically applies configured `zoomFactor` via `webContents.setZoomFactor()`.

---

## 🔌 Dynamic Hot-Plugging Support

Digital signage hardware in field deployments frequently encounters HDMI/DisplayPort handshakes, cables being disconnected, or displays powered down by building timers.

Webpage Signage Runner attaches listeners to OS display events:

- `screen.on('display-added')`: When a new monitor is connected, the app detects its bounds, checks `config.json` for a matching display ID or applies the `defaultUrl`, and spawns a new kiosk window seamlessly without disrupting existing displays.
- `screen.on('display-removed')`: When a monitor is disconnected, the associated window and watchdog timers are cleanly disposed of to free RAM.
- `screen.on('display-metrics-changed')`: If resolution or rotation changes (e.g. pivoting a screen from landscape to portrait), the window bounds are recalculated and adjusted live.

---

## 🏷️ Visual Screen Identification Overlay

When setting up 4, 8, or 16 screens on a video wall matrix, physical cables rarely match the logical numbering assigned by the operating system.

Webpage Signage Runner includes a built-in **Visual Screen Identifier**:

1. **Trigger via Wizard:** Click the **"Identify Screens"** button in the setup wizard.
2. **Trigger via REST API:** Send a POST request to `http://<ip>:9191/api/identify`.
3. **Behavior:**
   - Opens a transparent, high-contrast overlay window on every connected display.
   - Renders a prominent badge displaying:
     - Display Index (e.g. **Display #1**, **Display #2**)
     - Hardware ID
     - Resolution (e.g. `3840 x 2160 @ 60Hz`)
     - Scale factor & Primary status
   - Automatically fades out and closes after 5 seconds.

---

## 🔒 Mouse Cursor Suppression

In unattended public kiosks, visible mouse cursors degrade visual presentation.

Webpage Signage Runner suppresses cursors at the renderer level:
- Injects a universal CSS rule:
  ```css
  * {
    cursor: none !important;
  }
  ```
- Can be toggled globally via `hideCursorGlobal` in `config.json` or individually per display (`hideCursor: true/false`).

---

## ⚡ Multi-GPU & Hardware Acceleration

Webpage Signage Runner leverages Chromium's GPU acceleration:
- WebGL 2.0 and hardware-accelerated canvas rendering are enabled by default.
- Video decoding (H.264, VP9, AV1) uses OS GPU hardware decoding for smooth 4K/60fps playback on YouTube, HTML5 video streams, and interactive 3D dashboards.
