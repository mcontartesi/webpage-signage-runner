# Webpage Signage Runner - Remote Control & Health API

**Webpage Signage Runner** includes an embedded, lightweight, zero-overhead HTTP REST API running directly within the main process (default port: `9191`).

This API enables system administrators, monitoring dashboards (such as Prometheus, Grafana, or Uptime Kuma), and central signage management servers to monitor health, push URL updates, take remote screenshots, or trigger scheduled reloads without physical keyboard access.

---

## Interactive Swagger UI Explorer

You can access the built-in interactive Swagger UI documentation simply by opening the API port in any web browser:

- **Swagger UI URL:** `http://<kiosk-ip>:9191/` (or `http://<kiosk-ip>:9191/docs`)
- **OpenAPI 3.0 JSON:** `http://<kiosk-ip>:9191/openapi.json`

The Swagger UI explorer allows you to authenticate, inspect schemas, and execute live API requests directly from the browser using the **Try it out** button.

---

## Authentication & Headers

If configured in `config.json` (or via Setup Wizard), all endpoints except `/health` require authentication.

### Authentication Methods
1. **Bearer Token**:
   ```http
   Authorization: Bearer <your-token>
   ```
2. **Custom Header**:
   ```http
   X-API-Key: <your-token>
   ```

### CORS Support
All responses include standard CORS headers (`Access-Control-Allow-Origin: *`) allowing direct browser-based control dashboards.

---

## Endpoints Reference

### 1. Health Probe
- **Method:** `GET`
- **Path:** `/health`
- **Auth Required:** No
- **Description:** Fast liveness probe for load balancers or uptime monitors.

#### Response Example (`200 OK`)
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

### 2. Node & Display Status
- **Method:** `GET`
- **Path:** `/api/status`
- **Auth Required:** Yes (if token configured)
- **Description:** Returns real-time system metrics, process memory usage, and state for all connected physical screens.

#### Response Example (`200 OK`)
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
      "label": "Main Lobby Video Wall",
      "bounds": { "x": 0, "y": 0, "width": 3840, "height": 2160 },
      "isPrimary": true,
      "currentUrl": "https://dashboard.company.com/lobby",
      "status": "active",
      "lastReload": "2026-08-25T21:00:00.000Z",
      "failureCount": 0,
      "isResponsive": true
    },
    {
      "id": 2,
      "label": "Reception Directory",
      "bounds": { "x": 3840, "y": 0, "width": 1920, "height": 1080 },
      "isPrimary": false,
      "currentUrl": "https://directory.company.com",
      "status": "active",
      "lastReload": "2026-08-25T21:00:00.000Z",
      "failureCount": 0,
      "isResponsive": true
    }
  ]
}
```

---

### 3. Remote Screen Screenshot Capture
- **Method:** `GET`
- **Path:** `/api/displays/:id/screenshot`
- **Auth Required:** Yes (if token configured)
- **Description:** Captures an instant PNG rendering of the specified display window. Vital for verifying what is physically being displayed on remote kiosk screens.

#### Example `curl`
```bash
curl -H "Authorization: Bearer my-secret-token" \
     http://192.168.1.100:9191/api/displays/1/screenshot \
     --output screen-1.png
```

---

### 4. Reload All Displays
- **Method:** `POST`
- **Path:** `/api/reload`
- **Auth Required:** Yes (if token configured)
- **Body (optional):**
  ```json
  {
    "clearCache": true
  }
  ```

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "All displays reloaded successfully"
}
```

---

### 5. Reload Specific Display
- **Method:** `POST`
- **Path:** `/api/displays/:id/reload`
- **Auth Required:** Yes (if token configured)
- **Body (optional):**
  ```json
  {
    "clearCache": true
  }
  ```

#### Example `curl`
```bash
curl -X POST http://localhost:9191/api/displays/2/reload \
     -H "Content-Type: application/json" \
     -d '{"clearCache": true}'
```

---

### 6. Change Target URL for Display
- **Method:** `POST`
- **Path:** `/api/displays/:id/url`
- **Auth Required:** Yes (if token configured)
- **Body:**
  ```json
  {
    "url": "https://www.youtube.com",
    "httpMethod": "GET",
    "headers": {
      "Authorization": "Bearer sample-token",
      "X-Custom-Secret": "station-alpha"
    },
    "requestBody": "{\"kioskId\": 1, \"active\": true}",
    "persist": false
  }
  ```
  - `url` (*string, required*): The new URL to navigate to immediately (e.g. `https://www.youtube.com`).
  - `httpMethod` (*string, optional, default: "GET"*): HTTP method (`GET`, `POST`, `PUT`).
  - `headers` (*object, optional*): Custom HTTP headers (Bearer token, secrets, content-type).
  - `requestBody` (*string, optional*): Payload body for POST/PUT requests.
  - `persist` (*boolean, optional, default: false*): If `true`, saves the updated URL and settings to `config.json` so they persist across reboots.

#### Response Example (`200 OK`)
```json
{
  "success": true,
  "message": "Display #1 target URL updated to [GET] https://www.youtube.com"
}
```

---

### 7. Identify Monitors Overlay
- **Method:** `POST`
- **Path:** `/api/identify`
- **Auth Required:** Yes (if token configured)
- **Description:** Flashes large screen number badges across all physical screens for 5 seconds.

---

### 8. Open Setup Wizard Remotely
- **Method:** `POST`
- **Path:** `/api/setup`
- **Auth Required:** Yes (if token configured)
- **Description:** Brings up the setup wizard window on the host machine.

---

### 9. Get & Update Configuration
- **`GET /api/config`**: Returns sanitized active configuration.
- **`POST /api/config`**: Accepts partial or full JSON configuration, writes atomically to `config.json`, and applies changes live across all running displays.

---

## About & Author Credits

Webpage Signage Runner is created and maintained with ❤️ by [**Maximiliano Contartesi**](https://github.com/mcontartesi).
- 💼 **LinkedIn:** [maxiconta](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub:** [@mcontartesi](https://github.com/mcontartesi)
- ✉️ **Email / Contact:** maxiconta [at] gmail [dot] com
- 📝 **Medium:** [@maxiconta](https://medium.com/@maxiconta)
