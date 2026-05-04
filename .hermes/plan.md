# Nullboard → Next.js 重构计划

> 使用 opencode 按阶段逐步实施

**目标：** 将 nullboard（单 HTML 看板工具）重构为 Next.js 应用，保留全部功能、样式和数据模型

**技术栈：** Next.js 14 (App Router) + pnpm + TypeScript + @dnd-kit (拖拽) + localStorage

**数据模型（保持不变）：** Board → List[] → Note[]

---

## 阶段 1：项目脚手架

- [ ] 1.1 初始化 Next.js 项目（pnpm create next-app）
- [ ] 1.2 配置 TypeScript strict mode
- [ ] 1.3 安装依赖（@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities）
- [ ] 1.4 复制原始 CSS 变量和基础样式
- [ ] 1.5 配置目录结构：`/app`, `/components`, `/lib`, `/types`, `/hooks`

## 阶段 2：数据层

- [ ] 2.1 定义 TypeScript 类型（Board, List, Note）
- [ ] 2.2 实现 localStorage 存储封装
- [ ] 2.3 实现序列化/反序列化（兼容原始格式）
- [ ] 2.4 创建 useBoardStore hook（React Context + useReducer）
- [ ] 2.5 实现示例数据生成

## 阶段 3：核心 UI 组件

- [ ] 3.1 BoardSelector（多看板切换）
- [ ] 3.2 BoardView（看板画布 + 列表列）
- [ ] 3.3 ListColumn（列表列 + 笔记卡片容器）
- [ ] 3.4 NoteCard（笔记卡片，拖拽手柄）
- [ ] 3.5 Toolbar（顶部工具栏）
- [ ] 3.6 AppLayout（整体布局）

## 阶段 4：编辑功能

- [ ] 4.1 原地编辑（双击进入）
- [ ] 4.2 Tab 键支持（缩进/格式化）
- [ ] 4.3 自动保存（内容变化时触发）
- [ ] 4.4 添加/删除笔记和列表

## 阶段 5：拖拽功能

- [ ] 5.1 列表内笔记拖拽排序
- [ ] 5.2 跨列表笔记拖拽
- [ ] 5.3 列表列拖拽排序
- [ ] 5.4 拖拽动画和过渡效果

## 阶段 6：特色功能

- [ ] 6.1 撤销/重做（历史栈）
- [ ] 6.2 笔记折叠/展开
- [ ] 6.3 链接自动识别（URL 高亮）
- [ ] 6.4 暗色/亮色主题切换
- [ ] 6.5 标签/颜色系统
- [ ] 6.6 导入/导出（JSON 格式兼容原始版）
- [ ] 6.7 归档/取消归档
- [ ] 6.8 备份管理

## 阶段 7：打磨

- [ ] 7.1 快捷键（Tab, Enter, Delete, Ctrl+Z）
- [ ] 7.2 响应式布局
- [ ] 7.3 错误边界和 Loading 状态

---

## 验证方法

1. `pnpm dev` 启动后功能正常
2. 原始数据的导入/导出兼容
3. 所有 CRUD 操作可正常工作
4. 拖拽排序无异常
5. 主题切换即时生效
6. `pnpm build` 构建成功
