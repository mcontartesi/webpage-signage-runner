# Developer & Build Guide

This document covers project architecture, local development setup, code compilation, testing, and packaging installers for distribution.

---

## 🛠️ Technology Stack

- **Runtime:** [Electron 44](https://www.electronjs.org/) + [Node.js 22 LTS](https://nodejs.org/)
- **Language:** [TypeScript 7.0](https://www.typescriptlang.org/)
- **Build Tooling:** [esbuild 0.28](https://esbuild.github.io/) (High-speed bundler)
- **Validation:** [Zod 4.4](https://zod.dev/)
- **Testing:** [Vitest 4.1](https://vitest.dev/)
- **Packaging:** [electron-builder 26](https://www.electron.build/)

---

## 📂 Source Code Structure

```
webpage-signage-runner/
├── src/
│   ├── common/
│   │   ├── constants.ts       # IPC channels, default configurations, tokens
│   │   └── types.ts           # Zod schemas & TypeScript type interfaces
│   ├── main/
│   │   ├── autostart.ts       # Windows Registry & Linux Desktop Autostart
│   │   ├── config.ts          # Atomic file I/O & schema validation
│   │   ├── index.ts           # Electron main lifecycle & hotkey registration
│   │   ├── logger.ts          # Rotating structured file logger
│   │   ├── server.ts          # Embedded HTTP REST API & telemetry
│   │   ├── swagger.ts         # Embedded Swagger UI HTML & OpenAPI 3.0 JSON
│   │   ├── watchdog.ts        # Crash detection, retry timers, cache purging
│   │   └── window-manager.ts  # Multi-display bounds calculation & pinning
│   ├── preload/
│   │   ├── index.ts           # Context bridge for renderer scripts
│   │   └── setup.ts           # Secure IPC bridge for Setup Wizard
│   └── renderer/
│       ├── identify.html      # Visual monitor numbering overlay
│       ├── offline.html       # Offline fallback UI with circular countdown
│       ├── offline.ts         # Offline logic & online event listener
│       ├── setup.html         # Dark-mode setup wizard GUI
│       └── setup.ts           # Wizard state management & IPC communications
├── scripts/
│   ├── build.js               # esbuild compiler for main, preload, and renderer
│   ├── clean.js               # Build directory cleanup
│   └── dev.js                 # Live watch & automatic Electron restart
├── tests/
│   ├── config.test.ts         # Zod schema & config tests
│   └── watchdog.test.ts       # Retry logic & recovery tests
├── electron-builder.yml       # NSIS, AppImage, Deb, RPM packaging configuration
└── package.json
```

---

## 💻 Local Development Workflow

### 1. Prerequisites
- Node.js v20.x or v22.x LTS
- npm v10+

### 2. Installation
```bash
git clone https://github.com/mcontartesi/webpage-signage-runner.git
cd webpage-signage-runner
npm install
```

### 3. Start in Development Mode
```bash
npm run dev
```
*Starts esbuild in watch mode and automatically boots Electron.*

### 4. Run Automated Unit Tests
```bash
npm test
```

### 5. Type-Check Codebase
```bash
npm run typecheck
```

---

## 📦 Packaging & Distributables

Compile and bundle installers for your target operating systems:

```bash
# Build TypeScript and static assets to /dist
npm run build

# Package unpacked application directory (fast local testing)
npm run pack

# Package Windows NSIS Setup & Portable executable (.exe)
npm run dist:win

# Package Linux universal AppImage, Debian .deb, and Fedora .rpm
npm run dist:linux
```

All generated distribution files are written to the `release/` directory:
- `Webpage-Signage-Runner-Setup-1.0.0-x64.exe` (NSIS Installer)
- `Webpage-Signage-Runner-Portable-1.0.0-x64.exe` (Standalone Portable)
- `webpage-signage-runner-1.0.0-x64.AppImage` (Universal Linux)
- `webpage-signage-runner-1.0.0-x64.deb` (Debian/Ubuntu)
- `webpage-signage-runner-1.0.0-x64.rpm` (Fedora/RHEL)
