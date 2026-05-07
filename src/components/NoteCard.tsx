"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { Note } from "@/types";
import { useBoardContext } from "@/hooks/use-board";
import { isCompletedList } from "@/lib/board-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function renderInline(
  text: string,
  baseKey: number
): { nodes: React.ReactNode[]; nextKey: number } {
  const nodes: React.ReactNode[] = [];
  let pos = 0;
  let key = baseKey;

  while (pos < text.length) {
    const remaining = text.slice(pos);
    const urlIdx = remaining.search(/https?:\/\/[^\s<]+/);
    const boldIdx = remaining.search(/\*\*(.+?)\*\*/);
    const strikeIdx = remaining.search(/~~(.+?)~~/);

    const candidates: { idx: number; type: string }[] = [];
    if (urlIdx >= 0) candidates.push({ idx: urlIdx, type: "url" });
    if (boldIdx >= 0) candidates.push({ idx: boldIdx, type: "bold" });
    if (strikeIdx >= 0) candidates.push({ idx: strikeIdx, type: "strike" });
    candidates.sort((a, b) => a.idx - b.idx);

    if (candidates.length === 0) {
      nodes.push(<React.Fragment key={key++}>{text.slice(pos)}</React.Fragment>);
      break;
    }

    const first = candidates[0];

    if (first.idx > 0) {
      nodes.push(
        <React.Fragment key={key++}>
          {text.slice(pos, pos + first.idx)}
        </React.Fragment>
      );
    }

    if (first.type === "url") {
      const m = /https?:\/\/[^\s<]+/.exec(remaining)!;
      const url = m[0];
      nodes.push(
        <a key={key++} href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      );
      pos += first.idx + url.length;
    } else if (first.type === "bold") {
      const m = /\*\*(.+?)\*\*/.exec(remaining)!;
      const inner = renderInline(m[1], key);
      key = inner.nextKey;
      nodes.push(<strong key={key++}>{inner.nodes}</strong>);
      pos += first.idx + m[0].length;
    } else {
      const m = /~~(.+?)~~/.exec(remaining)!;
      const inner = renderInline(m[1], key);
      key = inner.nextKey;
      nodes.push(<del key={key++}>{inner.nodes}</del>);
      pos += first.idx + m[0].length;
    }
  }

  return { nodes, nextKey: key };
}

function renderNoteText(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    if (/^-\s/.test(lines[i])) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^-\s/.test(lines[i])) {
        const content = lines[i].replace(/^-\s/, "");
        const rendered = renderInline(content, key);
        key = rendered.nextKey;
        items.push(<li key={key++}>{rendered.nodes}</li>);
        i++;
      }
      nodes.push(
        <ul key={key++} style={{ paddingLeft: "1.2em", margin: "0.2em 0" }}>
          {items}
        </ul>
      );
    } else {
      const textLines: string[] = [];
      while (i < lines.length && !/^-\s/.test(lines[i])) {
        textLines.push(lines[i]);
        i++;
      }
      const rendered = renderInline(textLines.join("\n"), key);
      key = rendered.nextKey;
      nodes.push(
        <span key={key++} style={{ whiteSpace: "pre-wrap" }}>
          {rendered.nodes}
        </span>
      );
    }
  }

  return <>{nodes}</>;
}

export default function NoteCard({
  note,
  boardId,
  listId,
  listTitle,
}: {
  note: Note;
  boardId: string;
  listId: string;
  listTitle: string;
}) {
  const { dispatch } = useBoardContext();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(note.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isCompleted = isCompletedList(listTitle);

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
    disabled: editing,
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

  useEffect(() => {
    if (editing && textareaRef.current) {
      const ta = textareaRef.current;
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [editText, editing]);

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
    { value: "#f90", label: "Orange" },
    { value: "#69f", label: "Blue" },
  ];

  const classNames = [
    "note",
    editing ? "editing" : "",
    note.collapsed ? "collapsed" : "",
    note.raw ? "raw" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const noteStyle: React.CSSProperties = {
    ...style,
    ...(note.color ? { borderLeft: `3px solid ${note.color}` } : {}),
    ...(isCompleted ? { textDecoration: "line-through", color: "#999" } : {}),
  };

  let completedDateStr = "";
  if (isCompleted && note.completedAt) {
    const d = new Date(note.completedAt);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    completedDateStr = `${yyyy}/${mm}/${dd}`;
  }

  return (
    <div ref={setNodeRef} className={classNames} {...attributes} {...listeners} style={noteStyle}>
      <div className="text" onDoubleClick={handleDoubleClick}>
        {note.text ? renderNoteText(note.text) : <span style={{ color: "#999", fontStyle: "italic" }}>Empty note</span>}
      </div>
      {completedDateStr && (
        <div className="note-completed-date">{completedDateStr}</div>
      )}
      {editing && (
        <textarea
          ref={textareaRef}
          className="edit"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      )}
      <div className="ops">
        <span className="teaser" />
        <div className="bulk">
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
          <span style={{ color: "#bbb", padding: "0 2px" }}>|</span>
          <a href="#" onClick={(e) => { e.preventDefault(); handleToggleCollapse(); }}>
            {note.collapsed ? "Expand" : "Collapse"}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleToggleRaw(); }}>
            {note.raw ? "Card" : "Raw"}
          </a>
          <a href="#" className="warn" onClick={(e) => { e.preventDefault(); handleDelete(); }}>
            Delete
          </a>
        </div>
      </div>
    </div>
  );
}
