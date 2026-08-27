<div align="center">

# Webpage Signage Runner

**Orquestador de Cartelería Digital (Digital Signage) y Kiosco Multi-Pantalla de Grado Empresarial para Windows y Linux.**

[![Release: v1.1.2](https://img.shields.io/badge/Release-v1.1.2-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8?logo=googlechrome&logoColor=white)](https://mcontartesi.github.io/webpage-signage-runner/)
[![Wiki Documentation](https://img.shields.io/badge/Documentaci%C3%B3n-GitHub%20Wiki-blueviolet?logo=gitbook&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/wiki)
[![Downloads](https://img.shields.io/badge/Descargas-Windows%20%7C%20Linux-10b981?logo=windows&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-44.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Plataforma-Windows%20%7C%20Linux-lightgrey)](DEPLOYMENT.md)
[![Creado por Maximiliano Contartesi](https://img.shields.io/badge/Autor-Maximiliano%20Contartesi-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi)

<p align="center">
  <b>🌐 Language / Idioma / 语言:</b><br>
  <a href="README.md"><b>English</b></a> •
  <a href="README.es.md"><b>Español</b></a> •
  <a href="README.zh-CN.md"><b>简体中文</b></a>
</p>

<p align="center">
  <a href="https://mcontartesi.github.io/webpage-signage-runner/"><b>🌐 Demo Interactiva en Vivo</b></a> •
  <a href="https://github.com/mcontartesi/webpage-signage-runner/wiki"><b>📚 Wiki Oficial en GitHub</b></a> •
  <a href="#-descargas-directas-ejecutables-autocontenidos"><b>📥 Descargas Directas</b></a> •
  <a href="#-caracter%C3%ADsticas-principales">Características</a> •
  <a href="#-api-rest-y-swagger-ui-embebida">API REST</a> •
  <a href="#-sobre-el-autor-y-creador">Sobre el Autor</a>
</p>

</div>

---

## 📌 Descripción General y Propuesta de Valor

**Webpage Signage Runner** es una aplicación de señalización digital (Digital Signage) y kiosco interactivo multi-pantalla de código abierto, diseñada y desarrollada por el arquitecto de software **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

Diseñado específicamente para operar 24/7 sin supervisión humana en entornos comerciales de alta exigencia, tiendas retail, video walls corporativos, terminales aeroportuarias, centros de control y recepción de empresas, Webpage Signage Runner transforma cualquier ordenador estándar con Windows o Linux en un reproductor de cartelería digital autónomo, robusto y autorreparable, eliminando suscripciones SaaS costosas y dependencias de hardware propietario.

### 🌟 ¿Por qué elegir Webpage Signage Runner?
- **100% Código Abierto y Cero Costes de Suscripción:** Licencia MIT libre para despliegues comerciales y privados.
- **Orquestación Multi-Monitor Agnóstica al Hardware:** Mapea vistas web independientes a pantalla completa y sin bordes en las coordenadas exactas de cada monitor físico, con soporte Hot-Plug.
- **Peticiones HTTP Avanzadas y Autenticación Corporativa:** Soporte nativo de métodos `GET`, `POST` y `PUT` con inyección de cabeceras de autorización (`Authorization: Bearer <token>`, claves de API, tokens secretos) y payloads JSON personalizados.
- **Watchdog de Memoria y Purga Profunda de Caché:** Purga automática periódica de la caché de Chromium (disco, memoria, Service Workers y CacheStorage) y recarga forzada cada 60 minutos con cabeceras no-caché para prevenir saturación de memoria y visualización de datos obsoletos.
- **Resiliencia y Pantalla Offline con Reintento Automático:** Detección de caídas de red con interfaz visual de diagnóstico y cuenta regresiva animada, reconexión instantánea y recuperación automática ante fallos de renderizado (OOM / crashes).
- **API REST Embebida con Swagger UI:** Servidor de control local integrado en el puerto `9191` con explorador interactivo Swagger UI, capturas de pantalla remotas en tiempo real (PNG), health checks y actualización dinámica de contenido.

---

## 📥 Descargas Directas (Ejecutables Autocontenidos)

> **¡No requiere conocimientos técnicos de programación ni instalación de Node.js!** Descarga el archivo compilado para tu sistema operativo, configúralo en segundos y comienza a emitir contenido en modo kiosco.

### 🪟 Windows (Windows 10 / 11 / Windows Server)

| Tipo de Paquete | Archivo | Descripción | Enlace de Descarga |
|---|---|---|---|
| **Instalador Setup** | `Webpage-Signage-Runner-Setup-1.1.2-x64.exe` | Instalador estándar con accesos directos e inicio automático en Windows | [⬇️ Descargar Instalador](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Setup-1.1.2-x64.exe) |
| **Ejecutable Portable** | `Webpage-Signage-Runner-Portable-1.1.2-x64.exe` | Archivo portable autocontenido (ejecución directa desde USB o carpeta sin instalación) | [⬇️ Descargar Portable](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Portable-1.1.2-x64.exe) |

### 🐧 Linux (Ubuntu, Debian, Fedora, RHEL, Arch, Raspberry Pi OS x64)

| Formato de Paquete | Archivo | Descripción | Enlace de Descarga |
|---|---|---|---|
| **AppImage** | `webpage-signage-runner-1.1.2-x64.AppImage` | Binario universal autocontenido compatible con todas las distribuciones Linux | [⬇️ Descargar AppImage](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.AppImage) |
| **Debian / Ubuntu** | `webpage-signage-runner-1.1.2-x64.deb` | Paquete nativo `.deb` para Ubuntu, Debian, Linux Mint y derivados | [⬇️ Descargar .deb](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.deb) |
| **Fedora / RHEL** | `webpage-signage-runner-1.1.2-x64.rpm` | Paquete nativo `.rpm` para Fedora, CentOS, RHEL y Rocky Linux | [⬇️ Descargar .rpm](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.rpm) |
| **Tarball** | `webpage-signage-runner-1.1.2-x64.tar.gz` | Archivo comprimido portable para despliegues personalizados | [⬇️ Descargar .tar.gz](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.tar.gz) |

👉 **[Ver todas las versiones y registros de cambios en GitHub Releases](https://github.com/mcontartesi/webpage-signage-runner/releases)**

---

## ⚡ Guía de Inicio Rápido en 3 Pasos

```
+--------------------+      +--------------------+      +--------------------+
| 1. Descargar App   | ---> | 2. Asistente Setup | ---> | 3. Modo Kiosco 24/7|
| (Windows / Linux)  |      | (Configurar URLs)  |      | (Multi-Pantalla)   |
+--------------------+      +--------------------+      +--------------------+
```

1. **Descargar y Ejecutar**: Obtén el instalador o AppImage arriba e inicia la aplicación.
2. **Configurar Pantallas**: En el primer inicio, se abre automáticamente el **Asistente de Configuración (Dark Mode)**:
   - Detecta y muestra todos los monitores físicos con su resolución y coordenadas.
   - Haz clic en **"Identify Screens"** para proyectar números gigantes sobre cada pantalla física.
   - Ingresa las URLs deseadas (por ejemplo: `https://www.youtube.com`, tableros Grafana, PowerBI, aplicaciones web corporativas).
   - Opcionalmente configura parámetros HTTP (cabeceras, tokens Bearer, payloads POST).
3. **Lanzar Modo Kiosco**: Haz clic en **"Save & Launch Kiosk Mode"**. La app se fijará inmediatamente a pantalla completa sin marcos en cada monitor físico.

> [!TIP]
> **Atajo de Desbloqueo de Emergencia:** Presiona **`Ctrl + Shift + C`** (o **`CmdOrCtrl + Alt + S`**) en cualquier teclado conectado para desbloquear el modo kiosco y abrir nuevamente el asistente de configuración.

---

## ✨ Características Principales

### 🖥️ Orquestación Dinámica Multi-Monitor
- Detección automática y continua de todas las pantallas físicas conectadas (`screen.getAllDisplays()`).
- Creación de ventanas `BrowserWindow` independientes, sin marcos, siempre visibles (always-on-top) y fijadas a las coordenadas exactas de cada monitor.
- **Soporte Hot-Plug:** Conexión y desconexión de pantallas en caliente (`display-added`, `display-removed`) sin caídas ni necesidad de reiniciar el servicio.
- Herramienta de identificación visual para verificar la correspondencia física de cada pantalla durante instalaciones en campo.

### 🔐 Peticiones HTTP Avanzadas y Autenticación Corporativa
- Soporte para métodos `GET`, `POST` y `PUT` configurables individualmente por monitor.
- Inyección de cabeceras HTTP personalizadas para endpoints protegidos:
  - `Authorization: Bearer <token-jwt>`
  - `X-Api-Key: <clave-empresa>`
  - `Content-Type: application/json`
- Soporte de cuerpos de petición JSON y codificados para feeds dinámicos de métricas y turneros.

### 🛡️ Watchdog 24/7 y Purga Profunda de Caché
- **Resiliencia ante Caídas de Red:** Si se pierde la conexión, la pantalla cambia automáticamente a una interfaz de **Fallo Fuera de Línea (Offline UI)** con diagnósticos y temporizador animado de reintento.
- **Reconexión Inmediata:** Detecta automáticamente el restablecimiento de la red (`navigator.onLine`) y recarga la página al instante.
- **Autorrecuperación de Procesos Colgados o Caídos:** Captura eventos de `render-process-gone` y bloqueos por falta de memoria (OOM) para reiniciar la ventana afectada sin reiniciar el sistema operativo.
- **Recarga Forzada Periódica y Purga de Caché:** Cada 60 minutos (configurable mediante `reloadIntervalMinutes`), purga por completo la caché de Chromium (disco, memoria, CacheStorage y Service Workers), ejecutando una recarga dura con cabeceras `Cache-Control: no-cache`.

### 📡 Servidor API REST Embebido y Swagger UI
- Servidor HTTP ligero integrado en el puerto `9191`.
- **Swagger UI Interactivo:** Accesible en `http://<ip-kiosco>:9191/` o `/docs` para probar peticiones y consultar esquemas en vivo.
- **Especificación OpenAPI 3.0:** Disponible en formato JSON en `/openapi.json`.
- **Capturas de Pantalla Remotas en Vivo:** Endpoint `/api/displays/:id/screenshot` para obtener capturas PNG en tiempo real del estado de cada pantalla.
- **Seguridad mediante Token Bearer y CORS:** Autenticación configurable para despliegues en red corporativa.

### ⚙️ Integración con el Sistema Operativo
- **Inhibidor de Salvapantallas y Suspensión:** Evita el apagado de monitores y el modo reposo mediante `electron.powerSaveBlocker`.
- **Ocultamiento del Cursor del Ratón:** Inyección de reglas CSS (`* { cursor: none !important; }`) para pantallas táctiles y exhibidores comerciales.
- **Arranque Automático:** Integración nativa con el inicio de sesión en Windows (LoginItems) y Linux (`.desktop` / `systemd`).

---

## 🏗️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph HostOS["Sistema Operativo Anfitrión (Windows / Linux)"]
        Power["Bloqueador de Reposo y Salvapantallas"]
        AutoStart["Integración de Inicio Automático"]
        Hotkeys["Atajo Global de Emergencia (Ctrl+Shift+C)"]
    end

    subgraph MainProcess["Proceso Principal Electron (Node.js & TypeScript)"]
        WM["Gestor de Ventanas y Pantallas"]
        CM["Gestor de Configuración (Zod)"]
        WD["Watchdog y Purgador de Caché"]
        API["API REST y Swagger UI Embebida (:9191)"]
        Log["Logger Estructurado con Rotación Diaria"]
    end

    subgraph Hardware["Monitores Físicos"]
        D1["Monitor Físico 1"]
        D2["Monitor Físico 2"]
        DN["Monitor Físico N"]
    end

    subgraph Renderers["Renderers de Chromium y Vistas"]
        UI1["Ventana Kiosk 1"]
        UI2["Ventana Kiosk 2"]
        UIN["Ventana Kiosk N"]
        Offline["Pantalla Offline con Reintento"]
        Setup["Asistente de Configuración (Dark Mode)"]
    end

    HostOS --> MainProcess
    WM -->|"Fija Coordenadas"| D1
    WM -->|"Fija Coordenadas"| D2
    WM -->|"Fija Coordenadas"| DN
    WM --> UI1
    WM --> UI2
    WM --> UIN
    WD -->|"Ante Caída de Red / Crash"| Offline
    CM -->|"Primer Inicio"| Setup
    API -->|"Control Remoto"| WM
```

---

## 📡 API REST y Swagger UI Embebida

Webpage Signage Runner incluye un servidor HTTP REST (puerto `9191` por defecto) diseñado para la administración remota centralizada y la observabilidad del sistema.

### Explorador Interactivo
Abre `http://localhost:9191/` (o `http://<ip-kiosco>:9191/docs`) en cualquier navegador web para acceder a la interfaz interactiva de Swagger UI.

### Resumen de Endpoints REST

| Método | Endpoint | Descripción | Parámetros / Payload |
|---|---|---|---|
| `GET` | `/` o `/docs` | Interfaz interactiva Swagger UI | - |
| `GET` | `/openapi.json` | Especificación JSON OpenAPI 3.0 | - |
| `GET` | `/health` | Sonda de disponibilidad de alta velocidad (`{"status":"ok"}`) | - |
| `GET` | `/api/status` | Telemetría completa, consumo de memoria, uptime y estado de pantallas | - |
| `POST` | `/api/reload` | Ejecuta purga de caché y recarga forzada en todas las pantallas | - |
| `POST` | `/api/displays/:id/reload` | Recarga forzada de una pantalla específica por ID | - |
| `POST` | `/api/displays/:id/url` | Actualiza la URL, método HTTP, cabeceras o payload en caliente | `{"url":"...","httpMethod":"GET"}` |
| `GET` | `/api/displays/:id/screenshot` | Captura y retorna una imagen PNG en vivo de la pantalla indicada | Retorna binario `image/png` |
| `POST` | `/api/identify` | Muestra números gigantes de identificación en todos los monitores | - |
| `POST` | `/api/setup` | Abre remotamente el Asistente de Configuración | - |

> Para consultar ejemplos completos de peticiones con `curl`, cabeceras y esquemas de respuesta, revisa [API.md](API.md).

---

## ⚙️ Referencia de Configuración (`config.json`)

El archivo de configuración se almacena en el directorio de datos de usuario del sistema operativo:
- **Windows:** `%APPDATA%\webpage-signage-runner\config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

### Ejemplo Comentado de `config.json`

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
    "authToken": "secreto-api-kiosco-12345",
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
      "label": "Video Wall Recepción Principal (YouTube Stream)",
      "url": "https://www.youtube.com",
      "httpMethod": "GET",
      "headers": {
        "Authorization": "Bearer token-kiosco-recepcion",
        "X-Custom-Station": "recepcion-wall-01"
      },
      "reloadIntervalMinutes": 60,
      "retryIntervalSeconds": 10,
      "hideCursor": true,
      "zoomFactor": 1.0,
      "enabled": true
    },
    {
      "id": 2,
      "label": "Panel de Analítica Operativa (POST)",
      "url": "https://dashboard.empresa.interna/kiosk",
      "httpMethod": "POST",
      "headers": {
        "Authorization": "Bearer token-metricas-9988",
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

## 🛠️ Guía para Desarrolladores y Compilación

### Requisitos Previos
- [Node.js](https://nodejs.org/) v20.x o v22.x LTS
- npm v10+

### 1. Clonar el Repositorio
```bash
git clone https://github.com/mcontartesi/webpage-signage-runner.git
cd webpage-signage-runner
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Ejecutar en Modo Desarrollo
```bash
npm run dev
```

### 4. Compilar y Empaquetar Binarios
```bash
# Verificación de tipos TypeScript
npm run typecheck

# Compilar código TypeScript y recursos estáticos
npm run build

# Ejecutar pruebas unitarias automatizadas
npm test

# Empaquetar instaladores por plataforma
npm run dist:win    # Genera instalador NSIS .exe y versión Portable .exe para Windows
npm run dist:linux  # Genera paquetes AppImage, .deb, .rpm y .tar.gz para Linux
```

---

## 🏢 Despliegue en Producción y Hardening del SO

Para instrucciones detalladas sobre cómo configurar Windows AutoLogon, Windows Shell Launcher, servicios systemd en Linux y entorno kiosk en Wayland/X11:
👉 **[Consulta la Guía de Despliegue en Producción (DEPLOYMENT.md)](DEPLOYMENT.md)**

---

## 👤 Sobre el Autor y Creador

**Webpage Signage Runner** fue diseñado, creado y publicado en código abierto por **[Maximiliano Contartesi](https://github.com/mcontartesi)**.

**Maximiliano Contartesi** es un Arquitecto de Soluciones e Ingeniero de Software Principal especializado en aplicaciones de escritorio de alta disponibilidad, arquitecturas resilientes con Node.js y Electron, plataformas cloud empresariales y sistemas de señalización digital / IoT para entornos desatendidos.

### 🌐 Contacto y Redes de Maximiliano Contartesi
- 💼 **Perfil en LinkedIn:** [https://www.linkedin.com/in/maxiconta/](https://www.linkedin.com/in/maxiconta/)
- 🐙 **Perfil en GitHub:** [@mcontartesi](https://github.com/mcontartesi)
- 📝 **Publicaciones en Medium:** [@maxiconta](https://medium.com/@maxiconta)
- ✉️ **Correo Profesional:** `maxiconta@gmail.com`
- 🌐 **Demo Interactiva del Proyecto:** [https://mcontartesi.github.io/webpage-signage-runner/](https://mcontartesi.github.io/webpage-signage-runner/)
- 📚 **Wiki Oficial en GitHub:** [https://github.com/mcontartesi/webpage-signage-runner/wiki](https://github.com/mcontartesi/webpage-signage-runner/wiki)

---

## 📄 Licencia y Contribuciones

- **Licencia:** Distribuido bajo la **Licencia MIT**. Consulta [LICENSE](LICENSE) para más detalles.
- **Contribuciones:** ¡Contribuciones, reporte de problemas y pull requests son bienvenidos! Por favor revisa [CONTRIBUTING.md](CONTRIBUTING.md) antes de enviar cambios.

<div align="center">
  <sub>Desarrollado con ❤️ por <b>Maximiliano Contartesi</b>. Construido para garantizar máxima fiabilidad 24/7 en cartelería digital crítica.</sub>
</div>
