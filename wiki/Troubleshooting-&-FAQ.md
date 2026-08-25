# Troubleshooting & Frequently Asked Questions (FAQ)

Find quick solutions to common deployment, hardware, and configuration scenarios.

---

## ❓ Frequently Asked Questions

### Q: How do I exit kiosk mode or open the setup menu?
**A:** Press **`Ctrl + Shift + C`** (or **`CmdOrCtrl + Alt + S`**) on any keyboard connected to the kiosk machine. You can also trigger the setup window remotely via REST API by sending a POST request to `http://<kiosk-ip>:9191/api/setup`.

---

### Q: Why is the app showing an offline fallback screen?
**A:** The target URL failed to load. Check:
1. Is the kiosk connected to the local network or internet?
2. Is the destination web server running and reachable from the kiosk?
3. Check the error code displayed on the screen (e.g. `ERR_NAME_NOT_RESOLVED`, `ERR_CONNECTION_REFUSED`).
4. Look at the structured logs in the `logs/` directory for detailed error traces.

---

### Q: Port 9191 is already in use by another application. How do I change it?
**A:** Open `%APPDATA%\webpage-signage-runner\config.json` (Windows) or `~/.config/webpage-signage-runner/config.json` (Linux) and change the `api.port` field:
```json
{
  "api": {
    "enabled": true,
    "port": 9292,
    "host": "0.0.0.0"
  }
}
```

---

### Q: How can I display YouTube live streams or YouTube videos in kiosk mode?
**A:** You can set the target URL directly to `https://www.youtube.com` or to an embedded player URL such as:
```
https://www.youtube.com/embed/<VIDEO_ID>?autoplay=1&mute=1&loop=1&playlist=<VIDEO_ID>&controls=0
```

---

### Q: How do I prevent Windows from going to sleep or showing screensavers?
**A:** Webpage Signage Runner natively uses `electron.powerSaveBlocker` to prevent the OS and monitors from entering sleep or standby while running. Additionally, follow the power settings outlined in the [[Production Hardening Guide|Production-Hardening-&-Deployment]].

---

### Q: Where are log files stored?
- **Windows:** `%APPDATA%\webpage-signage-runner\logs\signage-YYYY-MM-DD.log`
- **Linux:** `~/.config/webpage-signage-runner/logs/signage-YYYY-MM-DD.log`

You can also click the **"Open Logs Folder"** button in the Setup Wizard to open the directory directly in your file explorer.

---

### Q: The web page scale is too small on my 4K / 8K TV. How do I fix it?
**A:** In the Setup Wizard (or in `config.json`), adjust the **`zoomFactor`** for that display to `1.25` (125%), `1.5` (150%), or `2.0` (200%).
