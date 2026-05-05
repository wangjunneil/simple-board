# SimpleBoard

极简看板（Kanban）工具。原是单 HTML 应用，重构为 Next.js 框架，扩展 MongoDB 云端同步与密码认证。

## 快速开始

```bash
cp .env.example .env.local
# 编辑 .env.local 设置 ACCESS_PASSWORD
pnpm install
pnpm dev          # → http://localhost:3000
```

> 无需 MongoDB 也可正常使用，所有数据存储在浏览器 localStorage。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `ACCESS_PASSWORD` | 是 | 访问密码，多个用逗号分隔（如 `pass1,pass2`）。不同密码登录后数据完全隔离。 |
| `MONGODB_URI` | 否 | MongoDB Atlas 连接字符串。不设置则仅使用 localStorage。 |

```bash
# .env.local 示例
ACCESS_PASSWORD=mysecret
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
```

## 认证

- 首次访问自动跳转登录页，输入密码后签发 30 分钟有效期的 httpOnly Cookie
- 支持多密码：`ACCESS_PASSWORD=pass1,pass2,pass3`
- **多密码数据隔离**：每个密码通过 SHA-256 派生唯一 deviceId，localStorage 和 MongoDB 数据按 deviceId 命名空间隔离，不同密码登录后看到完全独立的数据
- 登出清除 Cookie，重新跳转登录页

## 云端同步（可选）

设置 MongoDB Atlas 连接串后自动启用：

```bash
# Vercel: Settings → Environment Variables → ADD
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
ACCESS_PASSWORD=mysecret
```

每 30 秒自动同步看板和偏好数据。同步指示：灰色=未连接，绿色=已同步，闪烁=同步中。页面刷新以远程数据为主，离线降级到 localStorage。

## 部署

### Vercel（推荐）

1. 导入 Git 仓库到 Vercel
2. Framework 自动检测为 Next.js
3. Settings → Environment Variables → 添加 `ACCESS_PASSWORD`（必填）和 `MONGODB_URI`（可选）
4. 自定义域名: Settings → Domains → 添加

```bash
# CLI 部署
pnpm i -g vercel
vercel --prod
```

### 本地生产构建

```bash
pnpm build
pnpm start       # → http://localhost:3000
```

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 框架 (App Router) |
| TypeScript 5 | 类型安全 |
| React 19 | UI 组件 |
| @dnd-kit 6 | 拖拽排序 |
| MongoDB Driver | 云端同步（可选） |
| HMAC-SHA256 | 密码认证 |
| CSS | 原生样式 |

## 功能

### 系统截图

| 登录 | 看板列表 | 看板详情 |
|------|----------|----------|
| ![登录](images/sb-1-login.png) | ![看板列表](images/sb-2-boards.png) | ![看板详情](images/sb-3-board.png) |

### 看板管理
- 多看板网格卡片视图（显示创建日期、列表/笔记统计）
- 看板拖拽排序、新建、删除
- 每看板最多 4 个列表

### 列表 & 笔记
- 列表增删、左右互换位置
- 笔记拖拽跨列表移动、同列表内排序
- DONE / 已完成 列表自动记录完成日期（yyyy/MM/dd）并重置色点
- 3 色可选（无色 / 橙色 / 蓝色）
- 笔记 ops: 色点 → Collapse → Raw → Delete
- 双击原地编辑、失焦自动保存
- URL 自动链接（hover 显示 pointer 指针）

### 主题 & 字体
- 暗色/亮色主题切换
- 5 种字体: Barlow / IBM Plex / Open Sans (默认) / Segoe UI / Maven Pro

### 撤销 & 快捷键
- `Ctrl+Z` 撤销 / `Ctrl+Shift+Z` 重做（最多 50 步）
- 详细快捷键参见页脚 [HELP] 帮助浮层

### 导入/导出
- Logo 菜单 → Import/Export（JSON 格式）

## 原始版本

原始单 HTML 版本保留在 `nullboard.html`。
