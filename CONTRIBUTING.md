# Contributing to Webpage Signage Runner

Thank you for your interest in contributing to **Webpage Signage Runner**! This is an open-source project created and maintained by **Maximiliano Contartesi**.

---

## Development Workflow

### Prerequisites
- [Node.js](https://nodejs.org/) v20+ or v22+
- npm v10+

### Setup
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/mcontartesi/webpage-signage-runner.git
   cd webpage-signage-runner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start in development mode with live watch:
   ```bash
   npm run dev
   ```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Compiles source files and launches Electron with live watch |
| `npm run build` | Bundles Main, Preload, and Renderer processes via esbuild |
| `npm run typecheck` | Validates TypeScript types across the entire project |
| `npm test` | Executes unit tests with Vitest |
| `npm run pack` | Creates unpacked Electron distributions in `release/` |
| `npm run dist:win` | Packages Windows NSIS and Portable installers |
| `npm run dist:linux` | Packages Linux AppImage, `.deb`, `.rpm`, and `.tar.gz` |

---

## Coding Standards
- **Strict TypeScript**: Avoid `any` where possible; use explicit types and Zod schemas.
- **Context Isolation**: Always keep `contextIsolation: true` and `nodeIntegration: false` in Electron windows.
- **Defensive Error Handling**: Catch all process rejections and failed loads.
- **Testing**: Add unit tests in `tests/` for any new logic or configuration options.

---

## Submitting Pull Requests
1. Create a descriptive feature branch (`git checkout -b feature/my-enhancement`).
2. Ensure all tests and typechecks pass (`npm run typecheck && npm test && npm run build`).
3. Commit your changes with clear commit messages.
4. Push to your branch and open a Pull Request.

---

## License
By contributing to Webpage Signage Runner, you agree that your contributions will be licensed under the [MIT License](LICENSE).
