# Nullboard — Next.js 重构版

极简看板（Kanban）工具。原是单 HTML 应用，现重构为 Next.js 框架。

## 快速开始

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev          # → http://localhost:3000

# 生产构建 + 启动
pnpm build        # 构建静态文件
pnpm start        # 启动生产服务器
```

> **注意**: 开发模式（Turbopack HMR）通过 ngrok 穿透时可能不工作，请使用 `pnpm build && pnpm start` 生产模式。

## 部署

### Vercel

```bash
# 直接连接 Git 仓库部署，或使用 Vercel CLI
vercel --prod
```

### 静态导出（可选）

```bash
pnpm build
# 输出在 .next/ 目录
```

该应用是纯客户端 SPA，所有数据存储在浏览器 localStorage，部署时无需后端服务。

## 技术栈

| 技术 | 版本 |
|------|------|
| Next.js | 16 (App Router) |
| TypeScript | 5 (strict) |
| React | 19 |
| pnpm | 10 |
| @dnd-kit | 6 (拖拽) |
| uuid | 14 |

## 完整功能清单

### ✅ 已实现

| 功能 | 操作方式 |
|------|----------|
| 多看板管理 | Config 面板 → Boards 列表切换、新增、删除 |
| 列表 CRUD | 标题菜单 → Add note / Move left-right / Delete list |
| 笔记 CRUD | 双击编辑、≡ 菜单 → Collapse/Raw/Delete |
| 笔记拖拽排序 | 鼠标拖拽（同列表和跨列表） |
| 列表拖拽排序 | 鼠标拖拽左右移动 |
| 原地编辑 | 双击看板标题/列表名/笔记内容 |
| 自动保存 | 编辑失焦后自动写入 localStorage |
| 折叠/展开 | 笔记 ≡ 菜单 → Collapse |
| Raw 纯文本模式 | 笔记 ≡ 菜单 → Raw / Card |
| 颜色标记 | 笔记 ≡ 菜单 → Yellow/Green/Blue/Red/No color |
| 暗色/亮色主题 | Config → Preferences → Dark mode / Light mode |
| 5 种字体切换 | Config → Preferences → Barlow/IBM Plex/Open Sans/Segoe UI/Maven Pro |
| URL 自动链接 | 笔记中输入 http(s):// URL 自动变为可点击链接 |
| 撤销/重做 | Ctrl+Z / Ctrl+Shift+Z（或 Board 菜单 Undo/Redo） |
| 导入看板 | Config → Import / Export boards（JSON 格式） |
| 键盘快捷键 | Ctrl+Z 撤销, Ctrl+Shift+Z 重做 |
| 错误边界 | 组件崩溃时显示友好错误提示 + Reload 按钮 |
| 示例数据 | 首次打开自动创建示例看板 |

### ❌ 未实现（原版已有）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| 字体大小调整 | +/- 按钮调整字号，实时显示数值 | 中 |
| 行高调整 | +/- 按钮调整行高 | 低 |
| 列表宽度调整 | +/- 按钮调整列宽（200~400px） | 低 |
| Ctrl+Y 重做 | 快捷键，目前只有 Ctrl+Shift+Z | 低 |
| Ctrl+Enter 新增笔记 | 编辑完成直接添加下一条笔记 | 中 |
| Shift+Enter 保存退出 | 原版保存并退出编辑模式 | 低 |
| Tab 切换编辑焦点 | 跳到上一个/下一个笔记编辑框 | 中 |
| Alt+Arrow 折叠/展开 | 编辑中的快捷键操作 | 低 |
| Alt+R 切换 Raw | 编辑中的快捷键 | 低 |
| Ctrl+Shift+8 插入 • | 编辑中插入项目符号 | 低 |
| Reveal 链接模式 | 按 CapsLock/Ctrl 高亮所有链接 | 中 |
| 反引号文件链接 | `` `text` `` → `file:///text` 链接 | 低 |
| Scroller 同步滚动 | 列表溢出时双滚动条同步 | 低 |
| Crowded 自适应 | 列表过多时自动限制最大宽度 | 中 |
| Undo/Redo 按钮显隐 | 无操作时隐藏按钮 | 低 |
| Auto-backup 备份 | 本地+远程自动备份到服务器 | 低 |
| 备份状态指示器 | Config 面板显示备份状态 | 低 |
| About / License 弹窗 | 原版 Logo 菜单中的信息弹窗 | 低 |
| 版本更新通知 | 新版本时显示更新标记 | 低 |
| 看板拖拽排序 | Config 面板中拖拽调整顺序 | 低 |

## 原始版本

原始单 HTML 版本保留在 `nullboard.html`，可在浏览器直接打开运行。
