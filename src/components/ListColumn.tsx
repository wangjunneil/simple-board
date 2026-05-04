"use client";

import { useState, useCallback } from "react";
import type { List } from "@/types";
import { useBoardContext } from "@/hooks/use-board";
import NoteCard from "@/components/NoteCard";
import { useDroppable } from "@dnd-kit/core";

export default function ListColumn({
  list,
  boardId,
  isFirst,
  isLast,
  onMoveLeft,
  onMoveRight,
}: {
  list: List;
  boardId: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
}) {
  const { dispatch } = useBoardContext();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(list.title);

  const { setNodeRef, isOver } = useDroppable({
    id: `list-${list.id}`,
    data: { type: "list", boardId, listId: list.id, list },
  });

  const handleTitleDoubleClick = useCallback(() => {
    setTitleText(list.title);
    setEditingTitle(true);
  }, [list.title]);

  const handleTitleBlur = useCallback(() => {
    setEditingTitle(false);
    if (titleText !== list.title) {
      dispatch({
        type: "UPDATE_LIST_TITLE",
        boardId,
        listId: list.id,
        title: titleText,
      });
    }
  }, [titleText, list.title, boardId, list.id, dispatch]);

  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setTitleText(list.title);
        setEditingTitle(false);
      }
    },
    [list.title]
  );

  const handleAddNote = useCallback(() => {
    dispatch({ type: "ADD_NOTE", boardId, listId: list.id });
  }, [boardId, list.id, dispatch]);

  const handleDeleteList = useCallback(() => {
    if (confirm(`Delete list "${list.title || "Untitled"}" and all its notes?`)) {
      dispatch({ type: "DELETE_LIST", boardId, listId: list.id });
    }
  }, [boardId, list.id, list.title, dispatch]);

  return (
    <div className="list" ref={setNodeRef} style={{ opacity: isOver ? 0.85 : undefined }}>
      <div className={`head ${editingTitle ? "editing" : ""}`}>
        <div className="text" onDoubleClick={handleTitleDoubleClick}>
          {list.title || <span style={{ color: "#999", fontStyle: "italic" }}>Untitled</span>}
        </div>
        {editingTitle && (
          <input
            className="edit"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            placeholder="List title"
            autoFocus
          />
        )}
        <div className="menu">
          <span className="teaser" />
          <div className="bulk">
            <a href="#" onClick={(e) => { e.preventDefault(); handleAddNote(); }}>
              Add note
            </a>
            {!isFirst && (
              <a
                href="#"
                className="mov-list-l half"
                onClick={(e) => { e.preventDefault(); onMoveLeft?.(); }}
              >
                Move left
              </a>
            )}
            {!isLast && (
              <a
                href="#"
                className="mov-list-r half"
                onClick={(e) => { e.preventDefault(); onMoveRight?.(); }}
              >
                Move right
              </a>
            )}
            <a
              href="#"
              className="warn"
              onClick={(e) => { e.preventDefault(); handleDeleteList(); }}
            >
              Delete list
            </a>
          </div>
        </div>
      </div>
      <div className="notes">
        {list.notes.map((note) => (
          <NoteCard key={note.id} note={note} boardId={boardId} listId={list.id} />
        ))}
        {list.notes.length === 0 && (
          <div
            className="note"
            style={{
              background: "transparent",
              boxShadow: "none",
              cursor: "pointer",
              color: "#999",
              fontStyle: "italic",
              textAlign: "center",
              padding: "10px 0",
            }}
            onClick={handleAddNote}
          >
            Add a note
          </div>
        )}
      </div>
    </div>
  );
}
