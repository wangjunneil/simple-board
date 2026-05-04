"use client";

import { useCallback, useState } from "react";
import { useBoardContext } from "@/hooks/use-board";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Board } from "@/types";

function SortableBoardItem({
  board,
  isActive,
  onSelect,
  onDelete,
}: {
  board: Board;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: board.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const totalLists = board.lists.length;
  const totalNotes = board.lists.reduce((sum, l) => sum + l.notes.length, 0);
  const createdDate = new Date(board.createdAt);
  const formattedDate = createdDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      ref={setNodeRef}
      className={`board-card${isActive ? " active" : ""}`}
      style={style}
      onClick={onSelect}
    >
      <div className="board-card-content">
        <div className="board-card-title">{board.title || "Untitled"}</div>
        <div className="board-card-meta">
          <span className="board-card-drag" {...attributes} {...listeners}>
            &#9776;
          </span>
          <span>创建于: {formattedDate}</span>
          <span className="meta-sep">·</span>
          <span>{totalLists} 个列表</span>
          <span className="meta-sep">·</span>
          <span>{totalNotes} 个笔记</span>
        </div>
      </div>
      <button
        className="board-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete board"
      >
        ×
      </button>
    </div>
  );
}

export default function BoardList() {
  const { state, dispatch } = useBoardContext();
  const [addingBoard, setAddingBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleSelectBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "SWITCH_BOARD", boardId });
    },
    [dispatch]
  );

  const handleDeleteBoard = useCallback(
    (board: Board) => {
      if (confirm(`Delete board "${board.title || "Untitled"}" and all its lists?`)) {
        dispatch({ type: "DELETE_BOARD", boardId: board.id });
      }
    },
    [dispatch]
  );

  const handleAddBoard = useCallback(() => {
    if (addingBoard) {
      const title = newBoardTitle.trim() || "New Board";
      dispatch({ type: "ADD_BOARD", title });
      setAddingBoard(false);
      setNewBoardTitle("");
    } else {
      setAddingBoard(true);
    }
  }, [addingBoard, newBoardTitle, dispatch]);

  const handleCancelAdd = useCallback(() => {
    setAddingBoard(false);
    setNewBoardTitle("");
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = state.boards.findIndex((b) => b.id === active.id);
      const newIndex = state.boards.findIndex((b) => b.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const newBoardIds = arrayMove(
        state.boards.map((b) => b.id),
        oldIndex,
        newIndex
      );
      dispatch({ type: "REORDER_BOARDS", boardIds: newBoardIds });
    },
    [state.boards, dispatch]
  );

  const boardIds = state.boards.map((b) => b.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="board-list-page">
        <div className="board-list-header">
          <h2>Boards</h2>
        </div>
        <SortableContext items={boardIds} strategy={verticalListSortingStrategy}>
          <div className="board-cards">
            {state.boards.map((board) => (
              <SortableBoardItem
                key={board.id}
                board={board}
                isActive={board.id === state.activeBoardId}
                onSelect={() => handleSelectBoard(board.id)}
                onDelete={() => handleDeleteBoard(board)}
              />
            ))}
          </div>
        </SortableContext>
        {addingBoard ? (
          <div className="board-add-form">
            <input
              className="board-add-input"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddBoard();
                if (e.key === "Escape") handleCancelAdd();
              }}
              placeholder="Board title"
              autoFocus
            />
            <div className="board-add-actions">
              <a href="#" onClick={(e) => { e.preventDefault(); handleAddBoard(); }}>
                Create
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); handleCancelAdd(); }}>
                Cancel
              </a>
            </div>
          </div>
        ) : (
          <a
            href="#"
            className="board-add-btn"
            onClick={(e) => {
              e.preventDefault();
              handleAddBoard();
            }}
          >
            + New Board
          </a>
        )}
        <style jsx>{`
          .board-list-page {
            max-width: 600px;
            margin: 60px auto 0;
            padding: 20px;
          }
          .board-list-header h2 {
            margin: 0 0 20px;
            font-size: 22px;
            font-weight: 600;
            text-align: center;
          }
          .board-cards {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
          }
          .board-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            background: #fff;
            cursor: pointer;
            transition: border-color 0.15s, box-shadow 0.15s;
          }
          .board-card:hover {
            border-color: #bbb;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
          .board-card.active {
            border-color: #4a90d9;
            background: #f5f8ff;
            box-shadow: 0 2px 8px rgba(74, 144, 217, 0.15);
          }
          .board-card-content {
            flex: 1;
            min-width: 0;
          }
          .board-card-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .board-card-meta {
            font-size: 12px;
            color: #888;
            display: flex;
            align-items: center;
            gap: 4px;
            flex-wrap: wrap;
          }
          .meta-sep {
            color: #ccc;
          }
          .board-card-drag {
            cursor: grab;
            opacity: 0.4;
            margin-right: 6px;
            font-size: 14px;
            user-select: none;
          }
          .board-card-drag:hover {
            opacity: 0.7;
          }
          .board-card-delete {
            background: none;
            border: none;
            color: #c33;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
            opacity: 0;
            transition: opacity 0.15s, background 0.15s;
          }
          .board-card:hover .board-card-delete {
            opacity: 0.6;
          }
          .board-card-delete:hover {
            opacity: 1 !important;
            background: rgba(204, 51, 51, 0.1);
          }
          .board-add-btn {
            display: block;
            text-align: center;
            padding: 12px 16px;
            border: 1px dashed #ccc;
            border-radius: 6px;
            text-decoration: none;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            transition: border-color 0.15s, color 0.15s;
          }
          .board-add-btn:hover {
            border-color: #999;
            color: #333;
          }
          .board-add-form {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          .board-add-input {
            flex: 1;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
          }
          .board-add-actions a {
            margin-left: 8px;
            font-size: 13px;
          }
          .theme-dark .board-card {
            border-color: #444;
            background: #2a2a2a;
          }
          .theme-dark .board-card:hover {
            border-color: #555;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          }
          .theme-dark .board-card.active {
            border-color: #5a9fd4;
            background: #1e3a52;
            box-shadow: 0 2px 8px rgba(90, 159, 212, 0.2);
          }
          .theme-dark .board-card-title {
            color: #eee;
          }
          .theme-dark .board-card-meta {
            color: #888;
          }
          .theme-dark .meta-sep {
            color: #555;
          }
          .theme-dark .board-add-btn {
            border-color: #555;
            color: #aaa;
          }
          .theme-dark .board-add-input {
            background: #333;
            border-color: #555;
            color: #ddd;
          }
        `}</style>
      </div>
    </DndContext>
  );
}
