# SimpleBoard

极简看板（Kanban）工具。原是单 HTML 应用，重构为 Next.js 框架，扩展 MongoDB 云端同步。

## 快速开始

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

> 无需 MongoDB 也可正常使用，所有数据存储在浏览器 localStorage。

## 云端同步（可选）

设置 MongoDB Atlas 连接串：

```bash
# Vercel: Settings → Environment Variables → 添加
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# 本地: 创建 .env.local
echo 'MONGODB_URI=...' > .env.local
```

同步使用固定 deviceId `"nb-global"`，所有设备共享同一份数据。每 30 秒自动同步，绿色圆点表示连接成功。

## 部署

### Vercel（推荐）

1. 导入 Git 仓库到 Vercel
2. Framework 自动检测为 Next.js
3. 可选：设置 `MONGODB_URI` 环境变量
4. 自定义域名: Settings → Domains → 添加

```bash
# CLI 部署
pnpm i -g vercel
vercel --prod
```

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 框架 (App Router) |
| TypeScript 5 | 类型安全 |
| React 19 | UI 组件 |
| @dnd-kit 6 | 拖拽排序 |
| MongoDB Driver | 云端同步 |
| CSS | 原生样式 |

## 功能

### 看板管理
- 多看板网格卡片视图（显示创建日期、列表/笔记统计）
- 看板拖拽排序、新建、删除
- 首页始终进入看板列表
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
- 暗色/亮色主题切换（右下角 ☾/☀ 按钮）
- 5 种字体: Barlow / IBM Plex / Open Sans / Segoe UI / Maven Pro

### 云端同步
- MongoDB Atlas 每 30 秒自动同步
- 固定 deviceId 跨设备共享数据
- 同步指示: 灰色=未连接, 绿色=已同步, 闪烁=同步中
- 页面刷新以远程数据为主，离线降级到 localStorage

### 导入/导出 & 帮助
- Logo 菜单 → Import/Export（JSON 格式）
- 页脚 [HELP] 打开帮助浮层，包含完整操作说明和快捷键
- `Ctrl+Z` 撤销 / `Ctrl+Shift+Z` 重做

## 原始版本

原始单 HTML 版本保留在 `nullboard.html`。
