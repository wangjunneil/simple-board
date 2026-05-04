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

  return (
    <div
      ref={setNodeRef}
      className={`board-card${isActive ? " active" : ""}`}
      {...attributes}
      {...listeners}
      style={style}
      onClick={onSelect}
    >
      <div className="board-card-title">{board.title || "Untitled"}</div>
      <button
        className="board-card-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete board"
      >
        DEL
      </button>
      <div className="board-card-meta">
        {totalLists} lists · {totalNotes} notes
      </div>
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
      </div>
    </DndContext>
  );
}
