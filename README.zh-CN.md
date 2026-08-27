<div align="center">

# Webpage Signage Runner

**企业级、无人值守多显示器数字标牌（Digital Signage）与大屏展示信息亭编排器（支持 Windows 和 Linux）。**

[![Release: v1.1.2](https://img.shields.io/badge/Release-v1.1.2-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-38bdf8?logo=googlechrome&logoColor=white)](https://mcontartesi.github.io/webpage-signage-runner/)
[![Wiki Documentation](https://img.shields.io/badge/Wiki%E6%96%87%E6%A1%A3-GitHub%20Wiki-blueviolet?logo=gitbook&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/wiki)
[![Downloads](https://img.shields.io/badge/Downloads-Windows%20%7C%20Linux-10b981?logo=windows&logoColor=white)](https://github.com/mcontartesi/webpage-signage-runner/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-44.0-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux-lightgrey)](DEPLOYMENT.md)
[![Created By Maximiliano Contartesi](https://img.shields.io/badge/Author-Maximiliano%20Contartesi-0ea5e9?logo=github&logoColor=white)](https://github.com/mcontartesi)

<p align="center">
  <b>🌐 语言 / Language / Idioma:</b><br>
  <a href="README.md"><b>English</b></a> •
  <a href="README.es.md"><b>Español</b></a> •
  <a href="README.zh-CN.md"><b>简体中文</b></a>
</p>

<p align="center">
  <a href="https://mcontartesi.github.io/webpage-signage-runner/"><b>🌐 在线交互式演示 (Live Demo)</b></a> •
  <a href="https://github.com/mcontartesi/webpage-signage-runner/wiki"><b>📚 官方 GitHub Wiki 文档</b></a> •
  <a href="#-快速下载独立运行包"><b>📥 客户端下载</b></a> •
  <a href="#-核心特性与优势">核心特性</a> •
  <a href="#-内置-http-rest-api--swagger-ui">REST API</a> •
  <a href="#-关于作者与架构师">关于作者</a>
</p>

</div>

---

## 📌 项目概述与核心价值

**Webpage Signage Runner** 是一款生产级、全开源、无人值守的多屏幕网页数字标牌与信息发布管理软件，由解决方案架构师与首席软件工程师 **[Maximiliano Contartesi](https://github.com/mcontartesi)** 设计并主导开发。

本软件专为商用展示、连锁零售、商业综合体、机场候机屏、工业大屏监控、企业展厅数据看板（如 Grafana / PowerBI）及多屏拼接视频墙（Video Wall）等 7×24 小时高可用场景量身打造。借助 Webpage Signage Runner，您可以直接将普通的 Windows 或 Linux PC 转换为高度稳定、具备故障自愈能力的专业数字标牌终端，彻底摆脱高昂的商业 SaaS 订阅费用与专有硬件捆绑。

### 🌟 为什么选择 Webpage Signage Runner？
- **100% 开源且零订阅成本：** 基于宽松的 MIT 开源协议，个人与企业均可免费商用。
- **硬件无关的多屏幕自适应编排：** 自动枚举系统物理显示器，将独立的无边框全屏网页窗口无缝绑定到精确屏幕坐标，原生支持屏幕热插拔（Hot-Plug）。
- **企业级 HTTP 认证与高级请求：** 每个显示器可独立配置 `GET`、`POST`、`PUT` 请求方法，支持注入自定义鉴权头（`Authorization: Bearer <Token>`、`X-Api-Key`）与自定义请求体（JSON Payload）。
- **7×24 小时深度缓存清理与内存防泄漏看门狗：** 默认每 60 分钟深度清理 Chromium 磁盘与内存缓存、Service Workers 及 CacheStorage，并执行强制硬刷新（附带 `no-cache` 标头），彻底杜绝网页内存溢出与页面内容陈旧。
- **故障自愈与离线备用倒计时界面：** 网络中断时自动切换为科技感离线诊断界面，带有实时倒计时与自动重试逻辑；网络恢复时毫秒级自动重载；渲染进程异常或 OOM 时自动拉起恢复。
- **嵌入式 REST API 与 Swagger UI 在线调试：** 内置高性能本地控制服务器（默认端口 `9191`），支持 Swagger UI 在线交互文档、实时屏幕远程截图（PNG 格式）、健康检查探针及远程动态投屏。

---

## 📥 快速下载（独立运行包）

> **无需任何编程知识或 Node.js 环境！** 下载对应操作系统的免安装或安装版客户端，双击启动即可进入配置向导。

### 🪟 Windows 客户端（支持 Windows 10 / 11 / Windows Server）

| 软件包类型 | 文件名称 | 说明 | 下载链接 |
|---|---|---|---|
| **标准安装包** | `Webpage-Signage-Runner-Setup-1.1.2-x64.exe` | 包含桌面快捷方式、开始菜单及开机自启配置的 Windows 安装向导 | [⬇️ 下载 Windows 安装包](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Setup-1.1.2-x64.exe) |
| **便携绿色版** | `Webpage-Signage-Runner-Portable-1.1.2-x64.exe` | 单文件免安装绿色版，支持直接放入 U 盘或任意目录运行 | [⬇️ 下载 Windows 便携版](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/Webpage-Signage-Runner-Portable-1.1.2-x64.exe) |

### 🐧 Linux 客户端（支持 Ubuntu, Debian, Fedora, RHEL, Arch, Raspberry Pi OS x64）

| 格式类型 | 文件名称 | 说明 | 下载链接 |
|---|---|---|---|
| **AppImage** | `webpage-signage-runner-1.1.2-x64.AppImage` | 通用独立可执行格式（适用于各大主流 Linux 发行版） | [⬇️ 下载 AppImage](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.AppImage) |
| **Debian / Ubuntu** | `webpage-signage-runner-1.1.2-x64.deb` | 适用于 Ubuntu、Debian、Linux Mint 等系统的原生 `.deb` 安装包 | [⬇️ 下载 .deb](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.deb) |
| **Fedora / RHEL** | `webpage-signage-runner-1.1.2-x64.rpm` | 适用于 Fedora、CentOS、RHEL、Rocky Linux 的原生 `.rpm` 安装包 | [⬇️ 下载 .rpm](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.rpm) |
| **压缩归档** | `webpage-signage-runner-1.1.2-x64.tar.gz` | 便携二进制 Tar 压缩包，方便自动化脚本部署 | [⬇️ 下载 .tar.gz](https://github.com/mcontartesi/webpage-signage-runner/releases/latest/download/webpage-signage-runner-1.1.2-x64.tar.gz) |

👉 **[前往 GitHub Releases 查看所有历史版本与更新日志](https://github.com/mcontartesi/webpage-signage-runner/releases)**

---

## ⚡ 三步极速上手指南

```
+-------------------+      +-------------------+      +-------------------+
| 1. 下载客户端     | ---> | 2. 初始化配置向导 | ---> | 3. 进入 24/7 标牌模式|
| (Windows / Linux) |      | (设置 URL 及 API) |      | (多屏无边框全屏)  |
+-------------------+      +-------------------+      +-------------------+
```

1. **下载并启动：** 从上方下载适合您系统的安装包或便携版并运行。
2. **可视化配置向导：** 首次启动时，程序将自动开启深色模式（Dark Mode）**配置向导**：
   - 自动识别所有物理显示器，展示当前分辨率及坐标布局。
   - 点击 **"Identify Screens"（识别屏幕）** 按钮，将在所有实体屏幕上同步闪烁醒目的大号编号。
   - 输入每个屏幕所需呈现的目标网址（例如：YouTube 视频流、Grafana 仪表盘、商业广告页、企业门户等）。
   - 可选：展开高级选项配置 HTTP 请求头（如 Bearer Token）或 POST Payload。
3. **一键锁定展屏：** 点击 **"Save & Launch Kiosk Mode"（保存并启动信息亭）**，程序立即将独立窗口置顶全屏锁定至各个物理显示器。

> [!TIP]
> **紧急解锁快捷键：** 在任何时候按下键盘组合键 **`Ctrl + Shift + C`**（或 **`CmdOrCtrl + Alt + S`**），即可立即解锁退出全屏并重新调出配置向导窗口。

---

## ✨ 核心特性与优势

### 🖥️ 动态多屏幕智能编排
- 采用 Electron `screen.getAllDisplays()` 深度接口，精准感知多显卡与多显示器拓扑。
- 为每台物理显示器生成独立、无边框、强位置绑定的置顶 `BrowserWindow` 实例。
- **热插拔自适应：** 运行过程中插拔 HDMI/DP 线缆（`display-added`, `display-removed`）自动响应，不会崩溃或挂起。
- 一键屏幕视觉标号功能，大幅简化工程人员在弱电安装与多屏拼接时的物理屏幕定位。

### 🔐 完备的 HTTP 请求与企业级鉴权
- 突破传统标牌软件仅支持普通 GET 请求的限制，全功能支持 `GET`、`POST` 和 `PUT`。
- 自定义 HTTP 标头注入：
  - `Authorization: Bearer <Token>`
  - `X-Api-Key: <企业密钥>`
  - `Content-Type: application/json`
- 支持向企业内部 API 发送 JSON 或表单格式的请求体，实现按屏幕 ID 动态获取个性化看板数据。

### 🛡️ 7×24 小时高可用守护看门狗与深度缓存清空
- **网络中断自愈：** 断网时自动呈现科技质感的 **离线后备界面**，显示网络诊断信息与倒计时重试动画。
- **即时重连机制：** 监听系统网络恢复事件（`navigator.onLine`），网络畅通时毫秒级自动重载目标页面。
- **崩溃与 OOM 自动恢复：** 实时监控 `render-process-gone` 和 `unresponsive` 事件，自动重启故障网页实例，无需人工干预或重启系统。
- **定时全量硬刷新与缓存清除：** 默认每 **60 分钟**（可通过 `reloadIntervalMinutes` 自定义）彻底清空 Chromium 磁盘与内存缓存、Service Workers 和 CacheStorage，并附带防缓存响应头执行强制重新加载，确保前端发布新版本后立即生效且长期运行不爆内存。

### 📡 内置 REST API 与 Swagger UI
- 内置轻量级本地 HTTP 控制服务（默认端口 `9191`）。
- **Swagger UI 交互式文档：** 浏览器访问 `http://<设备IP>:9191/` 或 `/docs` 即可在线测试全部接口。
- **OpenAPI 3.0 规范：** 通过 `/openapi.json` 提供标准化机器可读文档。
- **远程实时截屏：** 通过 `/api/displays/:id/screenshot` 接口实时获取对应屏幕的 PNG 截图，实现远程大屏巡检。
- **安全认证与跨域：** 支持配置 Bearer Token 鉴权与 CORS 跨域访问控制。

### ⚙️ 深度操作系统集成
- **阻止屏幕休眠与节能锁：** 基于 `electron.powerSaveBlocker` 确保展屏长期点亮不黑屏。
- **全局鼠标隐藏：** 动态注入 CSS 规则（`* { cursor: none !important; }`），保持商业大屏的专业视觉观感。
- **开机自启无缝集成：** 原生适配 Windows（注册表与启动项）及 Linux（`systemd` 与 `.desktop` 文件）。

---

## 🏗️ 核心系统架构图

```mermaid
flowchart TD
    subgraph HostOS["操作系统底层 (Windows / Linux)"]
        Power["电源管理与防休眠锁 (PowerSaveBlocker)"]
        AutoStart["系统开机自启集成"]
        Hotkeys["全局紧急热键 (Ctrl+Shift+C)"]
    end

    subgraph MainProcess["Electron 主控制进程 (Node.js & TypeScript)"]
        WM["窗口与多屏拓扑管理器"]
        CM["配置管理器 (基于 Zod 严密校验)"]
        WD["看门狗与深度缓存清理器"]
        API["嵌入式 REST API 与 Swagger UI (:9191)"]
        Log["结构化日志与 7 天自动轮转"]
    end

    subgraph Hardware["物理显示器硬件"]
        D1["物理显示器 1"]
        D2["物理显示器 2"]
        DN["物理显示器 N"]
    end

    subgraph Renderers["Chromium 渲染进程与视图"]
        UI1["无边框展屏窗口 1"]
        UI2["无边框展屏窗口 2"]
        UIN["无边框展屏窗口 N"]
        Offline["离线倒计时备用屏"]
        Setup["深色模式可视化配置向导"]
    end

    HostOS --> MainProcess
    WM -->|"精确坐标绑定"| D1
    WM -->|"精确坐标绑定"| D2
    WM -->|"精确坐标绑定"| DN
    WM --> UI1
    WM --> UI2
    WM --> UIN
    WD -->|"网络异常 / 进程崩溃"| Offline
    CM -->|"首次运行引导"| Setup
    API -->|"远程运维与监控"| WM
```

---

## 📡 内置 HTTP REST API 与 Swagger UI 接口说明

Webpage Signage Runner 内置 HTTP REST 远程控制服务（默认端口 `9191`），可用于与企业集中监控系统、中控平台或自动化脚本联动。

### 交互式接口文档
在同一局域网任意浏览器中访问 `http://<标牌机IP>:9191/`（或 `/docs`）即可打开 Swagger UI 交互式控制台。

### REST API 端点速查表

| 请求方法 | 端点路径 | 功能描述 | 请求参数 / Payload |
|---|---|---|---|
| `GET` | `/` 或 `/docs` | 交互式 Swagger UI API 在线调试文档 | - |
| `GET` | `/openapi.json` | OpenAPI 3.0 标准 JSON 规范文件 | - |
| `GET` | `/health` | 高性能存活检测探针接口 (`{"status":"ok"}`) | - |
| `GET` | `/api/status` | 获取节点完整遥测数据（内存占用、运行时间、显示器状态） | - |
| `POST` | `/api/reload` | 强制清空缓存并立即刷新所有屏幕 | - |
| `POST` | `/api/displays/:id/reload` | 强制刷新指定 ID 的物理显示屏 | - |
| `POST` | `/api/displays/:id/url` | 动态热更新指定屏幕的网址、HTTP 方法、请求头或 Payload | `{"url":"...","httpMethod":"GET"}` |
| `GET` | `/api/displays/:id/screenshot` | 实时捕获该屏幕正在呈现的画面（返回 PNG 二进制流） | 返回 `image/png` |
| `POST` | `/api/identify` | 在所有物理屏幕上全屏闪烁编号用于现场确认 | - |
| `POST` | `/api/setup` | 远程唤起图形化配置向导界面 | - |

> 详细的 API 调用示例、Token 认证配置及 `curl` 脚本请参见 [API.md](API.md)。

---

## ⚙️ 配置文件说明 (`config.json`)

系统配置文件保存在操作系统的用户数据目录中：
- **Windows:** `%APPDATA%\webpage-signage-runner\config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

### `config.json` 完整配置范例

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
      "label": "企业大厅主拼接屏 (YouTube 直播流)",
      "url": "https://www.youtube.com",
      "httpMethod": "GET",
      "headers": {
        "Authorization": "Bearer lobby-kiosk-token",
        "X-Custom-Station": "lobby-screen-01"
      },
      "reloadIntervalMinutes": 60,
      "retryIntervalSeconds": 10,
      "hideCursor": true,
      "zoomFactor": 1.0,
      "enabled": true
    },
    {
      "id": 2,
      "label": "生产运营监控看板 (POST 请求)",
      "url": "https://metrics.internal.corp/kiosk",
      "httpMethod": "POST",
      "headers": {
        "Authorization": "Bearer metrics-api-token-9988",
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

## 🛠️ 开发者指南与构建说明

### 前置环境
- [Node.js](https://nodejs.org/) v20.x 或 v22.x LTS
- npm v10+

### 1. 克隆代码仓库
```bash
git clone https://github.com/mcontartesi/webpage-signage-runner.git
cd webpage-signage-runner
```

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发模式运行
```bash
npm run dev
```

### 4. 编译与打包独立二进制程序
```bash
# TypeScript 语法与类型校验
npm run typecheck

# 编译 TypeScript 与静态前端渲染资源
npm run build

# 运行自动化单元测试
npm test

# 跨平台构建打包
npm run dist:win    # 生成 Windows 安装包 (.exe) 与便携版 (.exe)
npm run dist:linux  # 生成 Linux AppImage, .deb, .rpm 与 .tar.gz
```

---

## 🏢 生产环境部署与系统安全加固

针对 Windows AutoLogon（自动免密登录）、Windows Shell Launcher（专用外壳程序替代 Explorer）、Linux systemd 服务及 Wayland/X11 纯净信息亭环境的完整部署指南：
👉 **[点击阅读生产环境部署指南 (DEPLOYMENT.md)](DEPLOYMENT.md)**

---

## 👤 关于作者与架构师

**Webpage Signage Runner** 由架构师 **[Maximiliano Contartesi](https://github.com/mcontartesi)** 独立构思、架构设计并作为开源项目发布维护。

**Maximiliano Contartesi** 是一名资深的解决方案架构师（Solutions Architect）与首席软件工程师（Principal Software Engineer），在高可用桌面应用开发、分布式 Node.js / Electron 架构体系、工业级 IoT / Kiosk 展屏无人值守系统以及现代云计算平台领域拥有深厚的工程实践经验。

### 🌐 联络与社交主页 (Maximiliano Contartesi)
- 💼 **LinkedIn 领英主页:** [https://www.linkedin.com/in/maxiconta/](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub 主页:** [@mcontartesi](https://github.com/mcontartesi)
- 📝 **Medium 技术专栏:** [@maxiconta](https://medium.com/@maxiconta)
- ✉️ **商务与技术联络邮箱:** `maxiconta@gmail.com`
- 🌐 **项目在线演示:** [https://mcontartesi.github.io/webpage-signage-runner/](https://mcontartesi.github.io/webpage-signage-runner/)
- 📚 **GitHub 官方 Wiki:** [https://github.com/mcontartesi/webpage-signage-runner/wiki](https://github.com/mcontartesi/webpage-signage-runner/wiki)

---

## 📄 开源许可证与社区贡献

- **开源协议：** 遵循 **MIT License**。详情请查阅 [LICENSE](LICENSE) 文件。
- **参与贡献：** 非常欢迎社区开发者提交 Issue、提出新功能建议或贡献 Pull Request！在提交代码前，请先查阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

<div align="center">
  <sub>由 <b>Maximiliano Contartesi</b> 倾心打造。致力于为关键任务数字标牌提供 7×24 小时坚如磐石的稳定性。</sub>
</div>
