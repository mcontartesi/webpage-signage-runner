# HTTP & Authentication

Webpage Signage Runner goes beyond standard browser kiosks by offering enterprise-grade HTTP request orchestration per display. This allows signage screens to authenticate against protected APIs, microservices, internal dashboards, and dynamic content feeds.

---

## 🚀 Supported HTTP Request Methods

For each display configured in Webpage Signage Runner, you can define the HTTP method used when loading and reloading the URL:

- **`GET` (Default):** Standard web page retrieval. Custom headers can be attached (e.g. for proxy authentication or API gateway routing).
- **`POST`:** Sends an initial `POST` request with headers and a request body payload. Perfect for endpoints that return HTML views based on station parameters or dynamic tokens.
- **`PUT`:** Sends an initial `PUT` request with payload data.

---

## 🔐 Custom HTTP Headers

Custom headers are attached to all renderer navigation requests using Electron's `webContents.loadURL(url, { extraHeaders, postData })` API.

### Common Header Use Cases

#### 1. Bearer Token Authentication (OAuth / JWT)
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Key Authentication
```http
X-Api-Key: signage-secret-key-9988-aabb
```

#### 3. Custom Station Identifiers
```http
X-Kiosk-Id: lobby-station-01
X-Location-Code: US-NYC-HQ
```

#### 4. JSON Content-Type for POST/PUT requests
```http
Content-Type: application/json
Accept: text/html, application/json
```

---

## 📦 Request Body Payloads (POST & PUT)

When configuring a display with `POST` or `PUT`, you can provide a raw body string (JSON, XML, or form-urlencoded).

### Example JSON Payload:
```json
{
  "stationId": 101,
  "department": "Operations",
  "kioskMode": true,
  "theme": "dark",
  "refreshSeconds": 300
}
```

When Webpage Signage Runner loads the screen, it buffers this payload into an `UploadRawData` stream and dispatches the request to the target server.

---

## ⚙️ Configuration Example (`config.json`)

Here is an example configuring two screens with different HTTP parameters:

```json
{
  "displays": [
    {
      "id": 1,
      "label": "Public Video Feed (GET)",
      "url": "https://www.youtube.com",
      "httpMethod": "GET",
      "reloadIntervalMinutes": 60,
      "hideCursor": true,
      "zoomFactor": 1.0,
      "enabled": true
    },
    {
      "id": 2,
      "label": "Internal Metrics Feed (POST)",
      "url": "https://dashboard.internal.company.com/kiosk-feed",
      "httpMethod": "POST",
      "headers": {
        "Authorization": "Bearer eyJhbGciOi...",
        "Content-Type": "application/json",
        "X-Station-ID": "display-2-operations"
      },
      "requestBody": "{\"kiosk\": true, \"view\": \"wallboard\"}",
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

## 🌐 Dynamic URL & Header Updates via REST API

You can update a screen's target URL, HTTP method, headers, or body remotely without restarting the app:

### Endpoint: `POST /api/displays/:id/url`

#### Request Body:
```json
{
  "url": "https://emergency-broadcast.company.com",
  "httpMethod": "GET",
  "headers": {
    "Authorization": "Bearer alert-token-12345"
  },
  "persist": false
}
```

- **`persist: false`**: Temporarily shifts the display to the emergency broadcast. Upon reboot, it returns to the original URL in `config.json`.
- **`persist: true`**: Writes the new URL and headers to `config.json` permanently.
