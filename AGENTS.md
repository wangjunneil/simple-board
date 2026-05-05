# SimpleBoard — Next.js 重构版

## 项目概述

SimpleBoard 是一款极简的本地存储看板（Kanban）工具。本项目将原始的单一 HTML 应用（`nullboard.html`）重构为 Next.js 16 + TypeScript + pnpm 架构，并扩展了 MongoDB 云端同步与密码认证能力。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (strict mode)
- **构建工具**: pnpm + Turbopack
- **状态管理**: React Context + useReducer（含撤销/重做历史栈，最多 50 步）
- **拖拽**: @dnd-kit (core, sortable, utilities)
- **存储**: localStorage (客户端持久化) + MongoDB Atlas (云端同步)
- **数据库**: MongoDB Node.js Driver（动态导入），集合前缀 `sb_`
- **认证**: HMAC-SHA256 Token + httpOnly Cookie，支持多密码
- **样式**: 原生 CSS (保留原始 nullboard 全部样式 + 暗色主题)
- **部署**: Vercel (优先) / Cloudflare Pages

## 目录结构

```
simple-board/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts           # POST 登录, DELETE 登出
│   │   │   ├── boards/route.ts         # GET/POST 看板数据 (sb_boards)
│   │   │   └── preferences/route.ts    # GET/POST 用户偏好 (sb_preferences)
│   │   ├── login/
│   │   │   └── page.tsx                # 登录页（纯卡片 UI）
│   │   ├── globals.css                 # 全局样式（原版 + 新组件）
│   │   ├── layout.tsx                  # 根布局 + metadata/favicon
│   │   └── page.tsx                    # 主页面（BoardProvider 入口、Logo、TopBar、HelpOverlay）
│   ├── components/
│   │   ├── BoardList.tsx               # 看板列表页（网格卡片、排序、新增/删除）
│   │   ├── BoardView.tsx               # 看板详情视图（列表 + 笔记拖拽）
│   │   ├── ListColumn.tsx              # 列表列（可排序笔记容器）
│   │   ├── NoteCard.tsx                # 笔记卡片（编辑、拖拽、ops 菜单）
│   │   └── ErrorBoundary.tsx           # 错误边界
│   ├── hooks/
│   │   ├── use-board.ts                # BoardProvider / useBoardContext 导出
│   │   └── use-sync.ts                 # MongoDB 同步 hook（30s 间隔）
│   ├── lib/
│   │   ├── auth.ts                     # Token 签名/验证, 多密码匹配, deviceId 派生
│   │   ├── board-store.tsx             # 状态管理（useReducer + 撤销/重做）
│   │   ├── mongodb.ts                  # MongoDB 客户端（懒加载，可选依赖）
│   │   └── storage.ts                  # localStorage 封装（按 deviceId 隔离）
│   ├── middleware.ts                   # 全局认证中间件（httpOnly Cookie 校验）
│   └── types/
│       └── index.ts                    # Board, List, Note 类型 + 全部 Action
├── public/
│   ├── extras/                         # 字体文件（Barlow, IBM Plex, Open Sans, Maven Pro）
│   ├── favicon.ico / *.png             # Favicon 及 PWA 图标
│   └── site.webmanifest                # Web App Manifest
├── .env.example                        # 环境变量模板（可提交 Git）
├── nullboard.html                      # 原始单 HTML 版本（未修改）
├── AGENTS.md                           # 本文件
└── README.md                           # 使用说明
```

## 数据流

1. `BoardProvider` 通过 `useReducer` 管理全局状态（boards, activeBoardId, theme, font）
2. `createInitialState()` 从 localStorage 加载数据作为首屏占位；`activeBoardId: null` 默认进入看板列表
3. 挂载后 `useSync` 并行从 MongoDB 拉取看板数据和用户偏好，以远程数据为主覆盖本地
4. 历史栈（最多 50 步）记录每次 boards 变更，支持 Ctrl+Z / Ctrl+Shift+Z 撤销重做
5. 每次 `dispatch` 后 `useEffect` 自动持久化到 localStorage
6. 同步 hook 每 30 秒自动将 boards + preferences 同步到 MongoDB

## 认证流程

1. 用户访问任意页面 → 中间件检查 `sb-auth` Cookie → 无/无效则重定向到 `/login`
2. 登录页输入密码 → POST `/api/auth` → 服务端匹配 `ACCESS_PASSWORD`（支持逗号分隔多密码）
3. 匹配成功 → 签发 HMAC-SHA256 Token（30 分钟有效期）→ 写入 httpOnly Cookie
4. 登录响应同时返回 `deviceId`（基于匹配密码的 SHA-256 派生）→ 客户端存入 localStorage
5. 中间件每次请求刷新 Cookie 有效期（renewal）
6. 登出 → DELETE `/api/auth` → 清除 Cookie，前端转向 `/login`

### 多密码数据隔离

- `ACCESS_PASSWORD=pass1,pass2,pass3` 允许多组密码登录
- 每个密码派生唯一 `deviceId`（`"nb-" + SHA-256(pwd).slice(0, 16)`）
- localStorage 按键 `{deviceId}-nb-boards` / `{deviceId}-nb-theme` 等命名空间隔离
- MongoDB 文档按 `deviceId` 字段查询，不同密码读写不同文档
- 不同密码登录后看到完全独立的数据

## MongoDB 数据模型

- **sb_boards**: `{ deviceId, boards, activeBoardId, theme, font, updatedAt }`
- **sb_preferences**: `{ deviceId, theme, font, updatedAt }`
- `deviceId` 由登录密码 SHA-256 派生，不同密码 = 不同数据命名空间
- 页面刷新时 MongoDB 为主数据源，离线或不可用时 fallback 到 localStorage
- MongoDB 驱动采用动态 `import("mongodb")`，无配置时静默降级

## 核心类型

- `Board`: id, title, lists, createdAt
- `List`: id, title, notes
- `Note`: id, text, collapsed, raw, color, completedAt?
- `Theme`: "light" | "dark"
- `Font`: "f-barlow" | "f-ibm-plex" | "f-open-sans" | "f-segoe-ui" | "f-maven-pro"

## 功能要点

- 首页为看板列表页（网格卡片），点击进入看板详情
- 每看板最多 4 个列表，满额时 Add list 禁用
- DONE/已完成 列表中的笔记自动显示完成日期（yyyy/MM/dd）、重置色点
- 3 色可选（无色 / 橙色 #f90 / 蓝色 #69f）
- 笔记 ops 菜单顺序: 色点 → Collapse → Raw → Delete
- 同步状态圆点: 灰色=未同步, 绿色=已同步, 闪烁=同步中
- 顶部栏: GitHub 链接 → 主题切换（☾/☀）→ 登出
- Logo 菜单集成 Boards / Import-Export / Font
- 底部版权 (Since 2026 – 2036) + [HELP] 帮助入口
- Help 浮层含完整操作说明、快捷键、可一键跳转看板列表
- 密码认证（多密码支持，数据隔离）

## 部署注意

- **Vercel**: 导入 Git 仓库，在 Settings → Environment Variables 中设置 `ACCESS_PASSWORD`（必填）和 `MONGODB_URI`（可选）
- **Cloudflare Pages**: 需注意 MongoDB 驱动使用 `await import("mongodb")` 动态导入，API 路由导出 `handler` 兼容 OpenNext
- `public/extras/` 为真实目录（含字体），非符号链接
- `.env.example` 为环境变量模板，可安全提交 Git
