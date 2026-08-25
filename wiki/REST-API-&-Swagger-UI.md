# REST API & Swagger UI Reference

Webpage Signage Runner features an embedded, zero-overhead HTTP REST API running directly within the main process (default port: `9191`).

This API enables central management servers, monitoring systems (e.g. Prometheus, Grafana, Uptime Kuma), and administrators to query telemetry, take instant screenshots of screens, reload views, and dynamically push new URLs over the local network.

---

## 🧭 Interactive Swagger UI Explorer

Navigate to the API root in any standard web browser:

```
http://<kiosk-ip>:9191/
```
*(or `http://<kiosk-ip>:9191/docs`)*

- **Interactive Testing:** Inspect schemas, type parameters, and click **"Try it out"** to execute live API commands directly from the browser.
- **OpenAPI 3.0 Specification:** Raw JSON spec is available at `http://<kiosk-ip>:9191/openapi.json`.

---

## 🔒 Authentication

If an `authToken` is defined in `config.json`, all endpoints (except `/health`) require authentication using either:

1. **Bearer Token:**
   ```http
   Authorization: Bearer <your-secret-token>
   ```
2. **API Key Header:**
   ```http
   X-API-Key: <your-secret-token>
   ```

---

## 📚 Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/` or `/docs` | Interactive Swagger UI Documentation Explorer | No |
| `GET` | `/openapi.json` | OpenAPI 3.0 JSON Specification | No |
| `GET` | `/health` | Fast liveness probe for monitoring tools | No |
| `GET` | `/api/status` | Complete telemetry: memory, displays, uptime, resolution | Yes |
| `GET` | `/api/displays/:id/screenshot` | Instant PNG screenshot capture of what the screen is displaying | Yes |
| `POST` | `/api/reload` | Flushes cache and reloads all displays immediately | Yes |
| `POST` | `/api/displays/:id/reload` | Flushes cache and reloads a specific display | Yes |
| `POST` | `/api/displays/:id/url` | Pushes a new target URL, method, headers, or body | Yes |
| `POST` | `/api/identify` | Flashes large numbering overlay across all physical screens | Yes |
| `POST` | `/api/setup` | Opens the Setup Wizard UI remotely on the host | Yes |
| `GET` | `/api/config` | Retrieves the active sanitized configuration | Yes |
| `POST` | `/api/config` | Updates configuration atomically and applies changes live | Yes |

---

## 🔍 Detailed Endpoint Documentation

### 1. Health Probe (`GET /health`)
Fast probe returning application status and uptime.
```bash
curl http://localhost:9191/health
```
#### Response (`200 OK`):
```json
{
  "status": "ok",
  "app": "webpage-signage-runner",
  "version": "1.0.0",
  "uptimeSeconds": 86400,
  "timestamp": "2026-08-25T22:00:00.000Z"
}
```

---

### 2. System & Display Telemetry (`GET /api/status`)
Returns host metrics, Node.js & Electron runtime versions, memory consumption (RSS, heap), and detailed per-screen state.
```bash
curl -H "Authorization: Bearer my-token" http://localhost:9191/api/status
```
#### Response (`200 OK`):
```json
{
  "name": "webpage-signage-runner",
  "version": "1.0.0",
  "author": "Maximiliano Contartesi",
  "uptimeSeconds": 86400,
  "platform": "win32",
  "arch": "x64",
  "nodeVersion": "22.10.0",
  "electronVersion": "34.0.0",
  "chromeVersion": "132.0.6834.83",
  "memoryUsageMb": {
    "rss": 142,
    "heapTotal": 65,
    "heapUsed": 48,
    "external": 8
  },
  "powerSaveBlockerActive": true,
  "displayCount": 2,
  "displays": [
    {
      "id": 1,
      "label": "Lobby Main Video Wall",
      "bounds": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "isPrimary": true,
      "currentUrl": "https://www.youtube.com",
      "status": "active",
      "lastReload": "2026-08-25T21:00:00.000Z",
      "failureCount": 0,
      "isResponsive": true
    }
  ]
}
```

---

### 3. Remote Screen Screenshot (`GET /api/displays/:id/screenshot`)
Captures an instant PNG rendering of the specified screen directly from Electron's native backing buffer.
```bash
curl -H "Authorization: Bearer my-token" \
     http://192.168.1.50:9191/api/displays/1/screenshot \
     --output display-1-live.png
```

---

### 4. Reload Displays (`POST /api/reload` & `POST /api/displays/:id/reload`)
Forces an immediate cache flush and reload.
```bash
# Reload all screens
curl -X POST -H "Authorization: Bearer my-token" \
     -H "Content-Type: application/json" \
     -d '{"clearCache": true}' \
     http://localhost:9191/api/reload

# Reload display #2 only
curl -X POST -H "Authorization: Bearer my-token" \
     -H "Content-Type: application/json" \
     -d '{"clearCache": true}' \
     http://localhost:9191/api/displays/2/reload
```

---

### 5. Change Target URL (`POST /api/displays/:id/url`)
Updates the active URL, method, headers, or request payload for a specific screen live.
```bash
curl -X POST -H "Authorization: Bearer my-token" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://emergency.company.com/alert",
       "httpMethod": "GET",
       "headers": {
         "Authorization": "Bearer emergency-token"
       },
       "persist": false
     }' \
     http://localhost:9191/api/displays/1/url
```
- **`persist: false`**: URL reverts back upon next application reboot.
- **`persist: true`**: Automatically updates `config.json` on disk.

---

### 6. Visual Identification (`POST /api/identify`)
Flashes large identification numbers on all physical monitors for 5 seconds.
```bash
curl -X POST -H "Authorization: Bearer my-token" http://localhost:9191/api/identify
```
