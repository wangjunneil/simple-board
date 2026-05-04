# Nullboard Next.js 重写 — 实施方案

> 用 Next.js (App Router) + TypeScript + pnpm 重写，保留所有功能、数据和样式。

---

## 阶段 1: 项目脚手架 (5 任务)

### 任务 1.1: 初始化 Next.js 项目

**命令：**
```bash
cd /Users/wangjun/Workspace
pnpm create next-app nullboard-next --typescript --tailwind --eslint --app --src-dir
cd nullboard-next
pnpm add uuid
pnpm add -D @types/uuid
```

**验证：** `pnpm dev` 能打开空白页面

---

### 任务 1.2: 添加依赖

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
pnpm add clsx
pnpm add -D @types/clsx
```

---

### 任务 1.3: 复制字体文件

```bash
mkdir -p src/app/fonts
cp /Users/wangjun/Workspace/nullboard/extras/Barlow-*.woff src/app/fonts/
cp /Users/wangjun/Workspace/nullboard/extras/IBMPlexSans-*.woff src/app/fonts/
cp /Users/wangjun/Workspace/nullboard/extras/OpenSans-*.woff src/app/fonts/
cp /Users/wangjun/Workspace/nullboard/extras/MavenPro-*.woff src/app/fonts/
cp /Users/wangjun/Workspace/nullboard/extras/favicon-16.png src/app/favicon.ico
```

---

### 任务 1.4: 配置全局样式和字体

**文件：** `src/app/globals.css` — 迁移原始 nullboard 中的 CSS（约 1400 行）

- 从 `nullboard.html` 中第 52-1450 行复制 CSS 到 `globals.css`
- 将 `@font-face` 路径指向 `/fonts/Barlow-*.woff` 等
- 添加 Tailwind 指令在顶部：`@tailwind base; @tailwind components; @tailwind utilities;`

**验证：** 页面能加载字体和基础样式

---

### 任务 1.5: 项目目录结构

```
src/
├── app/
│   ├── layout.tsx          # 根布局（加载 CSS、字体）
│   ├── page.tsx            # 主页面（客户端组件）
│   └── fonts/              # .woff 字体文件
├── components/
│   ├── App.tsx             # 顶层应用组件
│   ├── BoardSelector.tsx   # 看板列表侧栏
│   ├── Board.tsx           # 单个看板
│   ├── BoardHeader.tsx     # 看板标题 + 操作按钮
│   ├── List.tsx            # 列表列
│   ├── ListHeader.tsx      # 列表标题 + 操作
│   ├── Note.tsx            # 卡片
│   ├── ConfigPanel.tsx     # 设置面板（字体/主题/缩放）
│   └── ExportImport.tsx    # 导出/导入
├── lib/
│   ├── storage.ts          # localStorage 封装
│   ├── types.ts            # Board/List/Note 类型
│   └── store.ts            # 全局状态管理
```

---

## 阶段 2: 数据层 (5 任务)

### 任务 2.1: 定义 TypeScript 类型

**文件：** `src/lib/types.ts`

```typescript
export interface Note {
  text: string;
  raw: boolean;
  min: boolean;
}

export interface List {
  title: string;
  notes: Note[];
}

export interface Board {
  format: number;
  id: number;
  revision: number;
  title: string;
  lists: List[];
}

export interface BoardMeta {
  title: string;
  current: number;
  history: number[];
}

export interface AppConfig {
  board: number | null;
  fontSize: number;
  lineHeight: number;
  listWidth: number;
  fontFamily: string;
  darkTheme: boolean;
  maxUndo: number;
}
```

---

### 任务 2.2: localStorage 封装

**文件：** `src/lib/storage.ts`

```typescript
const PREFIX = 'nullboard.';

export function getItem<T>(name: string): T | null {
  const raw = localStorage.getItem(PREFIX + name);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setItem<T>(name: string, val: T): boolean {
  try {
    localStorage.setItem(PREFIX + name, JSON.stringify(val));
    return true;
  } catch { return false; }
}

export function removeItem(name: string): void {
  localStorage.removeItem(PREFIX + name);
}
```

---

### 任务 2.3: Board 存储逻辑

**文件：** `src/lib/storage.ts`（追加）

```typescript
export function saveBoard(board: Board): boolean {
  const meta = getMeta(board.id);
  const rev = board.revision + 1;
  board.revision = rev;
  
  const key = `board.${board.id}.${rev}`;
  const ok = setItem(key, board);
  
  meta.current = rev;
  meta.history.push(rev);
  // 保留最近 maxUndo 个版本
  if (meta.history.length > 50) meta.history.shift();
  setMeta(board.id, meta);
  
  return ok;
}

export function loadBoard(boardId: number, revision?: number): Board | null {
  const meta = getMeta(boardId);
  const rev = revision ?? meta.current;
  const key = `board.${boardId}.${rev}`;
  return getItem<Board>(key);
}
```

---

### 任务 2.4: Board 元数据管理

```typescript
function getMeta(boardId: number): BoardMeta {
  const raw = localStorage.getItem(PREFIX + 'meta.' + boardId);
  return raw ? JSON.parse(raw) : { title: '', current: 0, history: [] };
}

function setMeta(boardId: number, meta: BoardMeta): void {
  localStorage.setItem(PREFIX + 'meta.' + boardId, JSON.stringify(meta));
}
```

---

### 任务 2.5: 配置存储

```typescript
export function loadConfig(): AppConfig {
  return getItem<AppConfig>('config') ?? defaultConfig;
}

export function saveConfig(config: AppConfig): boolean {
  return setItem('config', config);
}
```

---

## 阶段 3: 核心 UI 组件 (6 任务)

### 任务 3.1: 根布局 + 主页面

**文件：** `src/app/layout.tsx`
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

**文件：** `src/app/page.tsx`
```tsx
'use client';
import App from '@/components/App';
export default function Home() { return <App />; }
```

---

### 任务 3.2: 顶层 App 组件

**文件：** `src/components/App.tsx`

- 管理所有状态（boards, currentBoard, config 等）
- 使用 React Context 或 zustand 共享状态
- 挂载时从 localStorage 加载数据

```tsx
'use client';
import { useState, useEffect } from 'react';
import { loadConfig, loadBoard, getBoardsList } from '@/lib/storage';
import BoardSelector from './BoardSelector';
import Board from './Board';
import ConfigPanel from './ConfigPanel';

export default function App() {
  const [config, setConfig] = useState(AppConfig);
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);

  useEffect(() => {
    setConfig(loadConfig());
    // 加载 boards 列表
  }, []);
  
  return (
    <div className={config.darkTheme ? 'dark' : ''}>
      <BoardSelector boards={boards} onSelect={...} />
      {currentBoard && <Board board={currentBoard} />}
      <ConfigPanel config={config} onChange={setConfig} />
    </div>
  );
}
```

---

### 任务 3.3: BoardSelector

**文件：** `src/components/BoardSelector.tsx`

- 显示所有看板的列表
- 点击切换看板
- "+" 按钮新建看板

---

### 任务 3.4: Board 组件

**文件：** `src/components/Board.tsx`

- 渲染 BoardHeader + List 列表
- 水平滚动容器
- DndContext 拖拽上下文

---

### 任务 3.5: List 组件

**文件：** `src/components/List.tsx`

- 渲染 ListHeader + Note 列表
- 每个列表固定宽度（可配置）
- SortableContext 支持拖拽排序

---

### 任务 3.6: Note 组件

**文件：** `src/components/Note.tsx`

- 渲染卡片内容
- 支持折叠（.min）、原始样式（.raw）
- 链接自动识别和高亮
- Draggable 拖拽

---

## 阶段 4: 编辑功能 (4 任务)

### 任务 4.1: 原地编辑（双击编辑）

- 双击 Board 标题、List 标题、Note 文本进入编辑模式
- 编辑时显示 `<textarea>` 或 `<input>`
- 失去焦点（blur）时自动保存
- textarea 自动调整高度

### 任务 4.2: Tab 导航

- 编辑 Note 时按 Tab 跳到下一个 Note
- Shift+Tab 跳到上一个

### 任务 4.3: 快速添加 Note

- List 底部/顶部"+"按钮添加新的 Note
- Ctrl+Enter 快速添加

### 任务 4.4: 自动保存

- 任何编辑操作触发 `saveBoard()`
- 保存时更新 revision 和 history

---

## 阶段 5: 拖拽 (4 任务)

### 任务 5.1: 引入 @dnd-kit

- 在 Board 组件中包裹 `<DndContext>`
- 定义 drag 和 drop 处理器
- 监听 `onDragEnd` 更新数据

### 任务 5.2: Note 拖拽（列表内排序）

- 每个 Note 使用 `useSortable`
- 拖拽时显示占位符
- 拖拽完成后更新列表顺序

### 任务 5.3: Note 跨列表拖拽

- 检测拖拽到的目标列表
- 从源列表移除，添加到目标列表
- 自动保存

### 任务 5.4: List 排序

- 整个 List 列可拖拽重新排序
- 使用 `sortableKeyboardCoordinates`

---

## 阶段 6: 特色功能 (8 任务)

### 任务 6.1: 撤销/重做

- 基于 localStorage 中的 revision history
- 撤销 = 加载上一个 revision
- 重做 = 加载下一个 revision
- 保留 50 个版本

### 任务 6.2: 卡片折叠/展开

- 点击 Note 的折叠按钮切换 `.min`
- 折叠后只显示第一行文本
- 保存到 `note.min` 属性

### 任务 6.3: 原始样式切换

- 点击 Note 的 raw 按钮切换 `.raw`
- 改变卡片背景和字体样式
- 保存到 `note.raw` 属性

### 任务 6.4: 链接自动识别

- Note 文本中正则匹配 `https?://`
- 链接使用特殊样式（下划线、脉冲动画）
- CapsLock 键按下时高亮所有链接
- 右键菜单打开链接

### 任务 6.5: 暗色主题

- ConfigPanel 中添加暗色主题开关
- 切换到暗色时在根元素添加 `class="dark"`
- CSS 变量控制颜色

### 任务 6.6: 偏好设置

- ConfigPanel：字体选择、字号、行高、列宽
- 实时调整并保存到 localStorage

### 任务 6.7: JSON 导出/导入

- 导出：序列化当前 Board 为 JSON → 下载 .json 文件
- 导入：上传 .json 文件 → 解析 → 添加到 boards 列表

### 任务 6.8: 备份代理支持

- 保留原有的 backup agent 接口
- 添加 WebDAV / 本地文件系统备份选项

---

## 阶段 7: 打磨 (3 任务)

### 任务 7.1: 键盘快捷键

- Ctrl+Z / Ctrl+Y — 撤销/重做
- CapsLock — 显示链接
- Tab — 切换 Note
- Ctrl+N — 新建 Note
- Ctrl+Shift+N — 新建 List

### 任务 7.2: 错误处理

- localStorage 满时提示
- JSON 解析失败时友好提示
- 数据格式兼容旧版本

### 任务 7.3: 示例数据

- 首次使用时生成示例 Board
- 展示所有功能

---

## 验证方案

每个阶段完成后：
1. `pnpm build` — 确保编译无错误
2. `pnpm dev` — 手动测试功能
3. 对比原始 `nullboard.html` 的功能完整性

## 风险与注意事项

- @dnd-kit 与原始拖拽行为可能有细微差异 — 需要单独测试
- localStorage 数据格式必须与原始版本兼容，确保用户现有数据不丢失
- 原始 CSS 中大量使用 `>` 子选择器和嵌套选择器 — 迁移到 CSS Modules 时需注意
- 原有 jQuery 的 `$.fn` 扩展需要替换为原生 DOM API
