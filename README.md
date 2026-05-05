# SimpleBoard

极简看板（Kanban）工具。原是单 HTML 应用，重构为 Next.js 框架，扩展 MongoDB 云端同步。

## 快速开始

```bash
# 安装依赖
pnpm install

# 配置 MongoDB 连接 (可选，用于云端同步)
cp .env.local.example .env.local
# 编辑 .env.local 填入 MONGODB_URI

# 开发模式
pnpm dev          # → http://localhost:3000

# 生产构建 + 启动
pnpm build
pnpm start
```

> 无需 MongoDB 也可正常使用，所有数据存储在浏览器 localStorage。

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 | 框架 (App Router) |
| TypeScript 5 | 类型安全 |
| React 19 | UI 组件 |
| pnpm | 包管理 |
| @dnd-kit 6 | 拖拽排序 |
| MongoDB Driver | 云端同步 |
| CSS | 原生样式 |

## 功能

### 看板管理
- 多看板支持（网格卡片视图，显示创建日期和统计）
- 看板拖拽排序、新建、删除
- 首页始终进入看板列表，点击卡片进入详情
- 每看板最多 4 个列表

### 列表 & 笔记
- 列表增删移动，左右互换位置
- 笔记拖拽跨列表移动，同列表内排序
- DONE / 已完成 列表自动记录完成日期并重置色点
- 3 色可选（无色 / 橙色 / 蓝色）
- 笔记 ops: 色点 → Collapse → Raw → Delete
- 双击原地编辑（看板标题、列表名、笔记内容）
- 编辑失焦自动保存
- URL 自动链接（鼠标悬停显示 pointer 指针）

### 主题 & 字体
- 暗色/亮色主题切换（右下角 ☾/☀ 按钮）
- 5 种字体: Barlow / IBM Plex / Open Sans / Segoe UI / Maven Pro

### 云端同步
- MongoDB Atlas 自动同步（每 30 秒）
- 设备指纹自动生成（localStorage `nb-device-id`）
- 同步状态指示: 灰色=未连接, 绿色=已同步, 闪烁=同步中
- 页面刷新以远程数据为主

### 导入/导出
- Logo 菜单 → Import/Export → Export boards（下载 JSON）
- Logo 菜单 → Import/Export → Import boards（上传 JSON 合并）

### 快捷键
- `Ctrl+Z` 撤销 / `Ctrl+Shift+Z` 重做
- `Enter` 确认 / `Escape` 取消 / `Tab` 缩进

### 帮助
- 页脚 [HELP] 链接打开帮助浮层
- 帮助页可返回看板列表

## 部署

```bash
# Vercel
vercel --prod

# 需要设置环境变量 MONGODB_URI
```

## 原始版本

原始单 HTML 版本保留在 `nullboard.html`。
