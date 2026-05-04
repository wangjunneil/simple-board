"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Note } from "@/types";
import { useBoardContext } from "@/hooks/use-board";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return part;
  });
}

export default function NoteCard({
  note,
  boardId,
  listId,
}: {
  note: Note;
  boardId: string;
  listId: string;
}) {
  const { dispatch } = useBoardContext();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: note.id,
    data: { type: "note", boardId, listId, note },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        editText.length,
        editText.length
      );
    }
  }, [editing]);

  const handleDoubleClick = useCallback(() => {
    setEditText(note.text);
    setEditing(true);
  }, [note.text]);

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (editText !== note.text) {
      dispatch({
        type: "UPDATE_NOTE",
        boardId,
        listId,
        noteId: note.id,
        text: editText,
      });
    }
  }, [editText, note.text, boardId, listId, note.id, dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditText(note.text);
        setEditing(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newText = editText.slice(0, start) + "\t" + editText.slice(end);
        setEditText(newText);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 1;
        });
      }
    },
    [note.text, editText]
  );

  const handleDelete = useCallback(() => {
    dispatch({ type: "DELETE_NOTE", boardId, listId, noteId: note.id });
  }, [boardId, listId, note.id, dispatch]);

  const handleToggleCollapse = useCallback(() => {
    dispatch({ type: "TOGGLE_COLLAPSE", boardId, listId, noteId: note.id });
  }, [boardId, listId, note.id, dispatch]);

  const handleToggleRaw = useCallback(() => {
    dispatch({ type: "TOGGLE_RAW", boardId, listId, noteId: note.id });
  }, [boardId, listId, note.id, dispatch]);

  const handleSetColor = useCallback(
    (color: string) => {
      dispatch({ type: "SET_COLOR", boardId, listId, noteId: note.id, color });
    },
    [boardId, listId, note.id, dispatch]
  );

  const colorOptions = [
    { value: "", label: "No color" },
    { value: "#fc3", label: "Yellow" },
    { value: "#6c6", label: "Green" },
    { value: "#69f", label: "Blue" },
    { value: "#f66", label: "Red" },
    { value: "#c6c", label: "Purple" },
    { value: "#f90", label: "Orange" },
    { value: "#f9c", label: "Pink" },
  ];

  const classNames = [
    "note",
    editing ? "editing" : "",
    note.collapsed ? "collapsed" : "",
    note.raw ? "raw" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={setNodeRef} className={classNames} style={{ ...style, ...(note.color ? { borderLeft: `3px solid ${note.color}` } : {}) }}>
      <div className="text" onDoubleClick={handleDoubleClick}>
        {note.text ? renderTextWithLinks(note.text) : <span style={{ color: "#999", fontStyle: "italic" }}>Empty note</span>}
      </div>
      {editing && (
        <textarea
          ref={textareaRef}
          className="edit"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          rows={3}
        />
      )}
      <div className="ops">
        <span className="teaser" {...attributes} {...listeners} style={{ cursor: "grab" }} />
        <div className="bulk" style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "nowrap" }}>
          <a href="#" onClick={(e) => { e.preventDefault(); handleToggleCollapse(); }}>
            {note.collapsed ? "Expand" : "Collapse"}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleToggleRaw(); }}>
            {note.raw ? "Card" : "Raw"}
          </a>
          {colorOptions.map((opt) => (
            <button
              key={opt.value}
              title={opt.label}
              onClick={(e) => { e.preventDefault(); handleSetColor(opt.value); }}
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                border: "none",
                background: opt.value === "" ? "transparent" : opt.value,
                cursor: "pointer",
                padding: 0,
                margin: 0,
                boxShadow: opt.value === "" ? "inset 0 0 0 1.5px #999" : "none",
                outline: note.color === opt.value ? "2px solid #fff" : "none",
                flexShrink: 0,
              }}
            />
          ))}
          <a href="#" className="warn" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
            Delete
          </a>
        </div>
      </div>
    </div>
  );
}
