# 中文用户与部署完整指南 (Chinese User & Deployment Guide)

欢迎阅读 **Webpage Signage Runner** 官方中文用户指南。本软件是一款专为 Windows 和 Linux 平台打造的企业级、无人值守多显示器网页数字标牌（Digital Signage）与大屏展示信息亭编排器。

---

## 🌟 核心特性与优势

1. **智能多屏幕编排管理**：自动识别系统连接的所有物理显示器（`screen.getAllDisplays()`），为每块屏幕生成强位置绑定的独立全屏无边框展示窗口。
2. **热插拔动态自适应（Hot-Plug）**：在系统运行过程中拔插 HDMI/DP 显示线缆，程序自动重构窗口布局，无需重启应用。
3. **企业级 HTTP 请求与鉴权**：支持 `GET`、`POST` 和 `PUT` 请求，支持向页面请求注入自定义 HTTP 请求头（如 `Authorization: Bearer <Token>`、API 密钥）及 JSON 请求体。
4. **可视化深色模式配置向导（Dark Mode）**：首次启动或无配置时自动开启可视化向导，一键测试网址连通性。
5. **屏幕物理视觉定位（Identify Screens）**：点击按钮即可在所有实体屏幕上同步闪烁大号编号，快速区分物理显示器与显卡端口对应关系。
6. **7×24 小时高可用守护看门狗（Watchdog）**：
   - **离线倒计时备用屏**：网络中断时自动呈现离线诊断界面，带有实时倒计时与自动重试；网络恢复后即刻毫秒级自动重载。
   - **渲染进程异常自愈**：捕获 `render-process-gone` 或内存溢出（OOM）崩溃，自动重启故障展屏。
   - **深度缓存清理与强制硬刷新**：默认每 60 分钟清空 Chromium 磁盘/内存缓存、Service Workers 及 CacheStorage，并携带 `no-cache` 标头强制重新加载，杜绝内存泄漏。
7. **内置 REST API 与 Swagger UI 在线控制台（默认端口 9191）**：支持远程状态监控、实时屏幕 PNG 截图（`/api/displays/:id/screenshot`）、动态推送新 URL 与远程重启。
8. **硬件级防休眠锁**：通过 `powerSaveBlocker` 彻底阻止操作系统进入睡眠状态或关闭显示器。
9. **全局鼠标光标隐藏**：自动注入 CSS 规则隐藏鼠标指针，呈现专业商用大屏视觉效果。
10. **紧急管理解锁热键**：在任何时候按下 **`Ctrl + Shift + C`**（或 **`CmdOrCtrl + Alt + S`**），即可立即退出全屏模式并重新呼出配置向导。

---

## 📥 客户端直接下载

无需安装 Node.js，亦无需编译任何源码，直接下载即用型独立运行包：

### 🪟 Windows (10 / 11 / Server)
- **标准安装包：** `Webpage-Signage-Runner-Setup-1.1.2-x64.exe`
- **便携绿色版：** `Webpage-Signage-Runner-Portable-1.1.2-x64.exe`

### 🐧 Linux (Ubuntu, Debian, Fedora, Arch, Raspberry Pi OS)
- **AppImage 通用包：** `webpage-signage-runner-1.1.2-x64.AppImage`
- **Debian / Ubuntu 安装包：** `webpage-signage-runner-1.1.2-x64.deb`
- **Fedora / RHEL 安装包：** `webpage-signage-runner-1.1.2-x64.rpm`

👉 **[前往 GitHub Releases 查看所有历史版本](https://github.com/mcontartesi/webpage-signage-runner/releases)**

---

## 🚀 三步极速上手

1. **下载** 适合您操作系统的安装包或便携版。
2. **运行** 客户端。在未检测到配置文件时，系统将自动进入 **可视化配置向导**。
3. **配置并启动**：
   - 点击 **"Identify Screens"** 查看各屏幕分配的实体编号。
   - 分别输入各屏幕的目标网址（例如：YouTube 视频流、Grafana 仪表盘、商业广告页等）。
   - 点击 **"Save & Launch Kiosk Mode"** 即可一键进入全屏展屏模式。

---

## 🌐 远程管理：REST API 与 Swagger UI

在局域网内任意设备的浏览器中打开：
```
http://<标牌终端IP>:9191/
```

| 请求方法 | 端点路径 | 说明 |
|---|---|---|
| `GET` | `/` 或 `/docs` | Swagger UI 在线交互式调试控制台 |
| `GET` | `/health` | 高性能存活检测探针接口 |
| `GET` | `/api/status` | 获取系统遥测数据、内存占用及屏幕状态 |
| `GET` | `/api/displays/:id/screenshot` | 获取指定屏幕的实时 PNG 截屏画面 |
| `POST` | `/api/reload` | 强制清空缓存并立即刷新所有屏幕 |
| `POST` | `/api/displays/:id/url` | 动态热更新指定屏幕的网址或请求头 |
| `POST` | `/api/identify` | 在所有物理屏幕上全屏闪烁编号用于现场确认 |
| `POST` | `/api/setup` | 远程唤起图形化配置向导界面 |

---

## ⚙️ 配置文件存储路径 (`config.json`)

- **Windows:** `%APPDATA%\webpage-signage-runner\config.json`
- **Linux:** `~/.config/webpage-signage-runner/config.json`

---

## 👨‍💻 作者与技术支持

本软件由 **[Maximiliano Contartesi](https://github.com/mcontartesi)** 设计、开发并开源维护。
- 💼 **LinkedIn 领英主页:** [https://www.linkedin.com/in/maxiconta/](https://www.linkedin.com/in/maxiconta/)
- 🐙 **GitHub 主页:** [@mcontartesi](https://github.com/mcontartesi)
- ✉️ **电子邮箱:** maxiconta [at] gmail [dot] com
- 📝 **Medium 专栏:** [@maxiconta](https://medium.com/@maxiconta)
