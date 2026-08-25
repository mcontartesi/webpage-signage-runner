# Configuration Reference (`config.json`)

Webpage Signage Runner stores its persistent configuration in a clean JSON format. All values are strictly validated using a **Zod** schema upon startup and modification.

---

## 📁 File Locations

The `config.json` file is located in the standard application data path for each operating system:

| Platform | Configuration Path |
|---|---|
| **Windows** | `%APPDATA%\webpage-signage-runner\config.json` (e.g. `C:\Users\<User>\AppData\Roaming\webpage-signage-runner\config.json`) |
| **Linux** | `~/.config/webpage-signage-runner/config.json` |

---

## 📋 Full Configuration Example

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

## 📖 Schema & Field Definitions

### Root Properties

| Field | Type | Default | Description |
|---|---|---|---|
| `version` | `string` | `"1.0.0"` | Configuration schema version. |
| `defaultUrl` | `string` | `"https://www.youtube.com"` | Default fallback URL assigned to unconfigured or hotplugged screens. |
| `hideCursorGlobal` | `boolean` | `true` | When `true`, suppresses mouse pointers across all displays by default. |
| `defaultReloadIntervalMinutes`| `number` | `60` | Default periodic reload interval in minutes (0 to disable). |
| `defaultRetryIntervalSeconds` | `number` | `10` | Default delay in seconds before retrying after load failures. |
| `autoStartOnBoot` | `boolean` | `true` | Configures OS autostart on user login (Windows registry / Linux desktop entry). |
| `emergencyShortcut` | `string` | `"CommandOrControl+Shift+C"` | Electron accelerator string for admin unlock hotkey. |

---

### `api` Object (Embedded REST Server)

| Field | Type | Default | Description |
|---|---|---|---|
| `api.enabled` | `boolean` | `true` | Enables or disables the embedded HTTP management server. |
| `api.port` | `number` | `9191` | TCP port for the REST server and Swagger UI (1024-65535). |
| `api.host` | `string` | `"0.0.0.0"` | Bind address. Use `"0.0.0.0"` for LAN access or `"127.0.0.1"` for localhost only. |
| `api.authToken` | `string` | `""` | Optional secret token required for authenticated API endpoints. |
| `api.cors` | `boolean` | `true` | Injects `Access-Control-Allow-Origin: *` headers for web dashboard integration. |

---

### `watchdog` Object (Self-Healing Subsystem)

| Field | Type | Default | Description |
|---|---|---|---|
| `watchdog.maxRetries` | `number` | `10` | Maximum consecutive offline retry attempts before remaining on offline screen. |
| `watchdog.unresponsiveTimeoutSeconds` | `number` | `15` | Seconds of renderer unresponsiveness allowed before triggering a hard reboot. |
| `watchdog.clearCacheOnReload` | `boolean` | `true` | Clears Chromium disk and memory cache during periodic reloads. |
| `watchdog.autoRecoverCrashes` | `boolean` | `true` | Automatically recreates windows when `render-process-gone` occurs. |

---

### `displays[]` Array (Per-Screen Configurations)

| Field | Type | Default | Description |
|---|---|---|---|
| `id` | `number` / `string` | *Required* | Electron display ID or screen index matching physical hardware. |
| `label` | `string` | `""` | Descriptive name (e.g. "Main Lobby Screen", "Elevator #2"). |
| `url` | `string` | `"https://www.youtube.com"` | Target web application or video feed URL to display. |
| `httpMethod` | `string` | `"GET"` | HTTP request method (`GET`, `POST`, or `PUT`). |
| `headers` | `object` | `{}` | Custom key-value HTTP headers sent with the request. |
| `requestBody` | `string` | `""` | Raw string payload sent with `POST` or `PUT` requests. |
| `reloadIntervalMinutes` | `number` | `60` | Per-screen cache purge and reload interval in minutes (0 to disable). |
| `retryIntervalSeconds` | `number` | `10` | Per-screen offline retry interval in seconds. |
| `hideCursor` | `boolean` | `true` | Screen-specific mouse cursor hiding override. |
| `zoomFactor` | `number` | `1.0` | Content zoom factor (`0.5` = 50%, `1.0` = 100%, `1.5` = 150%, `2.0` = 200%). |
| `userAgent` | `string` | `""` | Optional custom User-Agent string. |
| `partition` | `string` | `""` | Isolated session partition for separate cookies/localstorage per display. |
| `enabled` | `boolean` | `true` | Set to `false` to disable kiosk projection on this screen. |
