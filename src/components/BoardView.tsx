"use client";

import { useState, useCallback } from "react";
import type { Board, Note } from "@/types";
import { useBoardContext } from "@/hooks/use-board";
import ListColumn from "@/components/ListColumn";
import BoardList from "@/components/BoardList";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";

function NoteDragOverlay({ note }: { note?: Note }) {
  if (!note) return null;
  const classNames = ["note", note.collapsed ? "collapsed" : "", note.raw ? "raw" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <div
      className={classNames}
      style={{
        borderLeft: note.color ? `3px solid ${note.color}` : undefined,
        opacity: 0.9,
        transform: "rotate(3deg)",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
      }}
    >
      <div className="text">{note.text || "Empty note"}</div>
    </div>
  );
}

export default function BoardView() {
  const { state, dispatch, undo, redo } = useBoardContext();
  const currentBoard: Board | undefined = state.boards.find(
    (b) => b.id === state.activeBoardId
  );
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleTitleDoubleClick = useCallback(() => {
    if (!currentBoard) return;
    setTitleText(currentBoard.title);
    setEditingTitle(true);
  }, [currentBoard]);

  const handleTitleBlur = useCallback(() => {
    setEditingTitle(false);
    if (!currentBoard) return;
    if (titleText !== currentBoard.title) {
      dispatch({
        type: "UPDATE_BOARD_TITLE",
        boardId: currentBoard.id,
        title: titleText,
      });
    }
  }, [currentBoard, titleText, dispatch]);

  const handleAddList = useCallback(() => {
    if (!currentBoard) return;
    dispatch({ type: "ADD_LIST", boardId: currentBoard.id });
  }, [currentBoard, dispatch]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over || !currentBoard) return;

      const activeData = active.data.current;
      if (!activeData || activeData.type !== "note") return;

      const activeNoteId = active.id as string;
      const activeListId = activeData.listId as string;

      const overData = over.data.current;
      let overListId: string | undefined;

      if (overData?.type === "note") {
        overListId = overData.listId as string;
      } else if (overData?.type === "list") {
        overListId = overData.listId as string;
      }

      if (!overListId || overListId === activeListId) return;

      const overIndex = (() => {
        if (overData?.type === "note") {
          const overNoteId = over.id as string;
          const toList = currentBoard.lists.find((l) => l.id === overListId);
          if (toList) {
            return toList.notes.findIndex((n) => n.id === overNoteId);
          }
        }
        return undefined;
      })();

      dispatch({
        type: "MOVE_NOTE",
        boardId: currentBoard.id,
        fromListId: activeListId,
        toListId: overListId,
        noteId: activeNoteId,
        index: overIndex,
      });
    },
    [currentBoard, dispatch]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over || !currentBoard) return;

      const activeData = active.data.current;
      if (!activeData || activeData.type !== "note") return;

      const activeNoteId = active.id as string;
      const activeListId = activeData.listId as string;
      const overData = over.data.current;

      if (overData?.type === "note") {
        const overListId = overData.listId as string;

        if (activeListId === overListId) {
          const overNoteId = over.id as string;
          const list = currentBoard.lists.find((l) => l.id === activeListId);
          if (!list) return;
          const oldIndex = list.notes.findIndex((n) => n.id === activeNoteId);
          const newIndex = list.notes.findIndex((n) => n.id === overNoteId);
          if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;
          const newNoteIds = arrayMove(
            list.notes.map((n) => n.id),
            oldIndex,
            newIndex
          );
          dispatch({
            type: "REORDER_NOTES",
            boardId: currentBoard.id,
            listId: activeListId,
            noteIds: newNoteIds,
          });
        }
      }
    },
    [currentBoard, dispatch]
  );

  if (!currentBoard) {
    return <BoardList />;
  }

  const allNoteIds = currentBoard.lists.flatMap((l) => l.notes.map((n) => n.id));

  const findNoteById = (id: string): Note | undefined => {
    for (const l of currentBoard.lists) {
      const note = l.notes.find((n) => n.id === id);
      if (note) return note;
    }
    return undefined;
  };

  const activeNote = activeId ? findNoteById(activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="board">
        <div className={`head ${editingTitle ? "editing" : ""}`}>
          <div className="text" onDoubleClick={handleTitleDoubleClick}>
            {currentBoard.title}
          </div>
          {editingTitle && (
            <input
              className="edit"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setEditingTitle(false);
                }
              }}
              placeholder="Board title"
              autoFocus
            />
          )}
          <div className="menu">
            <span className="teaser" />
            <div className="bulk">
              <a
                href="#"
                className="undo-board"
                onClick={(e) => {
                  e.preventDefault();
                  undo();
                }}
              >
                Undo
              </a>
              <a
                href="#"
                className="redo-board"
                onClick={(e) => {
                  e.preventDefault();
                  redo();
                }}
              >
                Redo
              </a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleAddList();
                }}
              >
                Add list
              </a>
            </div>
          </div>
        </div>
        <SortableContext items={allNoteIds} strategy={verticalListSortingStrategy}>
          <div className="lists">
            {currentBoard.lists.map((list, idx) => (
              <ListColumn
                key={list.id}
                list={list}
                boardId={currentBoard.id}
                isFirst={idx === 0}
                isLast={idx === currentBoard.lists.length - 1}
                onMoveLeft={() => {
                  if (idx > 0) {
                    const listIds = currentBoard.lists.map((l) => l.id);
                    const newListIds = arrayMove(listIds, idx, idx - 1);
                    dispatch({
                      type: "REORDER_LISTS",
                      boardId: currentBoard.id,
                      listIds: newListIds,
                    });
                  }
                }}
                onMoveRight={() => {
                  if (idx < currentBoard.lists.length - 1) {
                    const listIds = currentBoard.lists.map((l) => l.id);
                    const newListIds = arrayMove(listIds, idx, idx + 1);
                    dispatch({
                      type: "REORDER_LISTS",
                      boardId: currentBoard.id,
                      listIds: newListIds,
                    });
                  }
                }}
              />
            ))}
          </div>
        </SortableContext>
      </div>
      <DragOverlay>
        {activeNote ? <NoteDragOverlay note={activeNote} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
