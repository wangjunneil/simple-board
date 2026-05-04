# Nullboard — Next.js 重构版

## 项目概述

Nullboard 是一款极简的本地存储看板（Kanban）工具。本项目将原始的单一 HTML 应用（`nullboard.html`）重构为 Next.js 16 + TypeScript + pnpm 架构，保留所有原始功能和样式。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript (strict mode)
- **构建工具**: pnpm + Turbopack
- **状态管理**: React Context + useReducer
- **拖拽**: @dnd-kit (core, sortable, utilities)
- **存储**: localStorage (客户端持久化)
- **样式**: 原生 CSS (保留原始 nullboard 全部样式 + 暗色主题)

## 目录结构

```
nullboard/
├── src/
│   ├── app/
│   │   ├── globals.css      # 全局样式（从原版提取）
│   │   ├── layout.tsx       # 根布局
│   │   └── page.tsx         # 主页面（BoardProvider 入口）
│   ├── components/
│   │   ├── BoardView.tsx    # 看板主视图 + @dnd-kit DndContext
│   │   ├── ListColumn.tsx   # 列表列（可排序笔记容器）
│   │   ├── NoteCard.tsx     # 笔记卡片（编辑、拖拽、ops 菜单）
│   │   └── ErrorBoundary.tsx # 错误边界
│   ├── hooks/
│   │   └── use-board.ts    # BoardProvider / useBoardContext 导出
│   ├── lib/
│   │   ├── board-store.tsx  # 状态管理（useReducer + 撤销/重做）
│   │   └── storage.ts      # localStorage 封装
│   └── types/
│       └── index.ts        # Board, List, Note 类型 + 全部 Action
├── extras/                  # 字体文件、图标（保留原始资源）
├── nullboard.html           # 原始单 HTML 版本（未修改）
├── AGENTS.md                # 本文件
└── README.md                # 使用说明
```

## 数据流

1. `BoardProvider` 通过 `useReducer` 管理全局状态
2. `createInitialState()` 从 localStorage 加载数据和配置
3. 每次 `dispatch` 后 `useEffect` 自动持久化到 localStorage
4. 所有操作记录到历史栈（最多 50 步），支持撤销/重做

## 核心类型

- `Board` → `List[]` → `Note[]`（与原版数据模型一致）
- `Note`: id, text, collapsed, raw, color
- `List`: id, title, notes
- `Board`: id, title, lists
