# Guía Completa de Usuario y Despliegue en Español

Bienvenido a la guía oficial en español de **Webpage Signage Runner**, el orquestador de cartelería digital (Digital Signage Kiosk) multi-monitor para Windows y Linux de grado empresarial.

---

## 🌟 Características Principales

1. **Gestión Multi-Monitor Avanzada**: Detecta automáticamente todas las pantallas físicas conectadas (`screen.getAllDisplays()`) y proyecta ventanas independientes fijadas a las coordenadas exactas de cada pantalla.
2. **Soporte Hot-Plug**: Maneja la conexión y desconexión de monitores en caliente sin reiniciar la aplicación.
3. **Peticiones HTTP Avanzadas**: Soporta métodos `GET`, `POST` y `PUT` con cabeceras personalizadas (`Authorization: Bearer <token>`, claves API) y cuerpo de datos (payload JSON).
4. **Asistente Visual Inicial (Dark Mode)**: Configura pantallas fácilmente en una interfaz oscura moderna y prueba URLs con un solo clic.
5. **Identificación Visual de Pantallas**: Muestra números grandes superpuestos en cada monitor para saber cuál pantalla corresponde a cada salida de video.
6. **Watchdog y Autorecuperación 24/7**:
   - Pantalla offline con temporizador animado y reconexión automática instantánea cuando vuelve la red.
   - Recuperación automática ante fallos de proceso o memoria (OOM).
   - Purga periódica de la caché de Chromium para evitar fugas de memoria en funcionamiento continuo.
7. **API HTTP REST Embebida con Swagger UI (Puerto 9191)**: Monitoreo en tiempo real, capturas de pantalla remotas (`/screenshot`), cambio dinámico de URLs y reinicios remotos.
8. **Inhibición de Suspensión**: Bloquea el apagado de pantallas y protector de pantalla mediante `powerSaveBlocker`.
9. **Ocultamiento de Cursor**: Suprime el cursor del mouse automáticamente en todas las pantallas.
10. **Atajo de Emergencia**: Presiona **`Ctrl + Shift + C`** o **`CmdOrCtrl + Alt + S`** para salir del modo kiosk y abrir la configuración.

---

## 📥 Descargas Directas

No necesitas instalar Node.js ni compilar código. Descarga los ejecutables listos para usar:

### Windows (10 / 11 / Server)
- **Instalador:** `Webpage-Signage-Runner-Setup-1.0.0-x64.exe`
- **Portable:** `Webpage-Signage-Runner-Portable-1.0.0-x64.exe`

### Linux (Ubuntu, Debian, Fedora, Arch, Raspberry Pi OS)
- **AppImage:** `webpage-signage-runner-1.0.0-x64.AppImage`
- **Debian / Ubuntu:** `webpage-signage-runner-1.0.0-x64.deb`
- **Fedora / RHEL:** `webpage-signage-runner-1.0.0-x64.rpm`

---

## 🚀 Inicio Rápido en 3 Pasos

1. **Descarga** el archivo correspondiente a tu sistema operativo.
2. **Ejecuta** la aplicación. Al no haber configuración previa, se abrirá el **Asistente de Configuración**.
3. **Configura y Lanza**:
   - Presiona **"Identify Screens"** para ver los números de cada pantalla.
   - Escribe la URL de cada pantalla (ej: `https://www.youtube.com`, dashboards de Grafana o paneles internos).
   - Haz clic en **"Save & Launch Kiosk Mode"**.

---

## 🌐 Control Remoto: API REST y Swagger UI

Accede a la documentación interactiva abriendo en cualquier navegador de tu red:
```
http://<ip-del-kiosk>:9191/
```

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` o `/docs` | Interfaz interactiva Swagger UI |
| `GET` | `/health` | Chequeo rápido de disponibilidad |
| `GET` | `/api/status` | Métricas del sistema, memoria y estado de pantallas |
| `GET` | `/api/displays/:id/screenshot` | Captura de pantalla en tiempo real en formato PNG |
| `POST` | `/api/reload` | Recarga todas las pantallas limpiando la memoria caché |
| `POST` | `/api/displays/:id/url` | Cambia la URL o cabeceras de una pantalla en vivo |
| `POST` | `/api/identify` | Muestra los números de identificación en las pantallas |
| `POST` | `/api/setup` | Abre el asistente de configuración remotamente |

---

## ⚙️ Ubicación del Archivo de Configuración (`config.json`)

- **Windows:** `%APPDATA%\webpage-signage-runner\config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

---

## 👨‍💻 Autor y Contacto

Creado y mantenido por **[Maximiliano Contartesi](https://github.com/mcontartesi)**.
- 💼 **LinkedIn:** [maxiconta](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub:** [@mcontartesi](https://github.com/mcontartesi)
- ✉️ **Correo:** maxiconta [at] gmail [dot] com
