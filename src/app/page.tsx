"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BoardProvider, useBoardContext } from "@/hooks/use-board";
import BoardView from "@/components/BoardView";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSync } from "@/hooks/use-sync";
import type { SyncStatus } from "@/hooks/use-sync";
import type { Board, Font, Theme } from "@/types";

function HelpOverlay({ onClose, onGoBoards }: { onClose: () => void; onGoBoards: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="overlay help-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <a
          href="#"
          className="help-go-boards"
          onClick={(e) => {
            e.preventDefault();
            onGoBoards();
          }}
        >
          &larr; Go to board list
        </a>
        <h2>Help</h2>

        <h3>Basic Operations</h3>
        <ul>
          <li><b>Create board:</b> Click <i>+ New Board</i> on the boards list page</li>
          <li><b>Open board:</b> Click a board card</li>
          <li><b>Add list:</b> Hover board title &rarr; <i>Add list</i></li>
          <li><b>Add note:</b> Double-click at the bottom of a list, then type and press Enter</li>
          <li><b>Edit note:</b> Double-click a note</li>
          <li><b>Edit board title:</b> Double-click the board title</li>
          <li><b>Edit list title:</b> Double-click the list title</li>
          <li><b>Move note:</b> Drag a note between lists</li>
          <li><b>Reorder notes:</b> Drag to reorder within a list</li>
          <li><b>Reorder lists:</b> Click &lt; Move &gt; on a list</li>
          <li><b>Reorder boards:</b> Drag board cards on the list page</li>
          <li><b>Delete note:</b> Hover note &rarr; <i>Delete</i></li>
          <li><b>Delete list:</b> Hover list menu &rarr; <i>Delete list</i></li>
          <li><b>Delete board:</b> Click <i>DEL</i> on board card</li>
          <li><b>Collapse note:</b> Hover note &rarr; <i>Collapse</i></li>
          <li><b>Raw note:</b> Hover note &rarr; <i>Raw</i> (bold, no card)</li>
          <li><b>Color note:</b> Hover note &rarr; color dots (no color / orange / blue)</li>
          <li><b>Return to board list:</b> Click <i>Boards</i> in the logo menu</li>
        </ul>

        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><kbd>Ctrl+Z</kbd> Undo</li>
          <li><kbd>Ctrl+Shift+Z</kbd> Redo</li>
          <li><kbd>Enter</kbd> Confirm / Save</li>
          <li><kbd>Escape</kbd> Cancel editing / Close dialogs</li>
          <li><kbd>Tab</kbd> Create new note (when on the last note)</li>
          <li><kbd>E</kbd> Toggle expand/collapse all notes</li>
        </ul>

        <h3>Import / Export</h3>
        <ul>
          <li><b>Export:</b> Hover logo &rarr; <i>Import/Export &gt; Export boards</i> downloads a JSON file</li>
          <li><b>Import:</b> Hover logo &rarr; <i>Import/Export &gt; Import boards</i> adds boards from a JSON file</li>
        </ul>

        <h3>Sync</h3>
        <p>
          Boards and preferences sync to MongoDB every 30 seconds.
          A green dot next to the logo means successfully synced. Blinking means syncing in progress.
        </p>
      </div>
    </div>
  );
}

function Logo({ syncStatus, onShowHelp }: { syncStatus: SyncStatus; onShowHelp: () => void }) {
  const { state, dispatch } = useBoardContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dotClass =
    syncStatus === "synced"
      ? "sync-dot synced"
      : syncStatus === "syncing"
      ? "sync-dot syncing"
      : "sync-dot";

  const handleExport = useCallback(() => {
    const data = JSON.stringify(state.boards, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simpleboard-boards.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state.boards]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const importedBoards = JSON.parse(reader.result as string) as Board[];
          if (!Array.isArray(importedBoards)) throw new Error("Invalid format");
          const existingIds = new Set(state.boards.map((b) => b.id));
          const newBoards = importedBoards.filter((b) => !existingIds.has(b.id));
          if (newBoards.length === 0) return;
          dispatch({ type: "SET_BOARDS", boards: [...state.boards, ...newBoards] });
        } catch {
          alert("Invalid board file.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [state.boards, dispatch]
  );

  const handleSetFont = useCallback(
    (font: Font) => dispatch({ type: "SET_FONT", font }),
    [dispatch]
  );

  const fonts: [Font, string][] = [
    ["f-barlow", "Barlow"],
    ["f-ibm-plex", "IBM Plex"],
    ["f-open-sans", "Open Sans"],
    ["f-segoe-ui", "Segoe UI"],
    ["f-maven-pro", "Maven Pro"],
  ];

  const fontLabels: Record<Font, string> = {
    ["f-barlow"]: "Barlow",
    ["f-ibm-plex"]: "IBM Plex",
    ["f-open-sans"]: "Open Sans",
    ["f-segoe-ui"]: "Segoe UI",
    ["f-maven-pro"]: "Maven Pro",
  };

  return (
    <div className="logo" tabIndex={0}>
      <a href="#" onClick={(e) => e.preventDefault()}>
        SimpleBoard
        <span className={dotClass} title={
          syncStatus === "synced"
            ? "Synced"
            : syncStatus === "syncing"
            ? "Syncing..."
            : "Not synced"
        } />
      </a>
      <div className="bulk">
        <a
          href="#"
          className="menu-first"
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: "SWITCH_BOARD", boardId: "" });
          }}
        >
          Boards
        </a>
        <div className="menu-group">
          <span className="menu-label">Import/Export</span>
          <div className="menu-items">
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport(); }}>
              Export boards
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleImport(); }}>
              Import boards
            </a>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <div className="menu-group">
          <span className="menu-label">Font: {fontLabels[state.font]}</span>
          <div className="menu-items">
            {fonts.map(([fontKey, label]) => (
              <a
                key={fontKey}
                href="#"
                className={`switch-font${state.font === fontKey ? " active" : ""}`}
                onClick={(e) => { e.preventDefault(); handleSetFont(fontKey); }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  const { state, dispatch } = useBoardContext();
  const router = useRouter();

  const handleToggleTheme = useCallback(() => {
    const next: Theme =
      state.theme === "light" ? "dark" : state.theme === "dark" ? "auto" : "light";
    dispatch({ type: "SET_THEME", theme: next });
  }, [state.theme, dispatch]);

  const handleLogout = useCallback(async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <div className="top-bar">
      <button
        className="top-bar-btn"
        onClick={() => window.open("https://github.com/wangjunneil/simple-board", "_blank")}
        title="GitHub"
      >
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </button>
      <button className="top-bar-btn" onClick={handleToggleTheme}
        title={state.theme === "light" ? "Theme: Light" : state.theme === "dark" ? "Theme: Dark" : "Theme: Auto (follows system)"}>
        {state.theme === "light" ? "\u263E" : state.theme === "dark" ? "\u2600" : "\u25D0"}
      </button>
      <button className="top-bar-btn" onClick={handleLogout} title="Logout">
        <svg viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" fillRule="evenodd" d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z"/>
          <path fill="currentColor" fillRule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
        </svg>
      </button>
    </div>
  );
}

function NullboardAppInner() {
  const { state, undo, redo, dispatch } = useBoardContext();
  const syncStatus = useSync();
  const [showHelp, setShowHelp] = useState(false);

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const editing = tag === "input" || tag === "textarea";

      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      } else if (e.key === "e" && !editing && stateRef.current.activeBoardId) {
        e.preventDefault();
        const board = stateRef.current.boards.find(
          (b) => b.id === stateRef.current.activeBoardId
        );
        const anyCollapsed = board?.lists.some((l) =>
          l.notes.some((n) => n.collapsed)
        );
        if (anyCollapsed) {
          dispatch({ type: "EXPAND_ALL_NOTES", boardId: stateRef.current.activeBoardId });
        } else {
          dispatch({ type: "COLLAPSE_ALL_NOTES", boardId: stateRef.current.activeBoardId });
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, dispatch]);

  const handleGoBoards = useCallback(() => {
    setShowHelp(false);
    dispatch({ type: "SWITCH_BOARD", boardId: "" });
  }, [dispatch]);

  return (
    <>
      <Logo syncStatus={syncStatus} onShowHelp={() => setShowHelp(true)} />
      <BoardView />
      <TopBar />
      <div className="footer">
        @Copyright <a href="https://wangjun.dev">Calvin Wang</a>{" "}(Since 2026 &ndash; 2036)
        {" "}&nbsp;
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setShowHelp(true);
          }}
        >
          [HELP]
        </a>
      </div>
      {showHelp && (
        <HelpOverlay
          onClose={() => setShowHelp(false)}
          onGoBoards={handleGoBoards}
        />
      )}
    </>
  );
}

export default function NullboardPage() {
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    if (typeof localStorage !== "undefined") {
      setInitialising(false);
    }
  }, []);

  if (initialising) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <BoardProvider>
      <ErrorBoundary>
        <NullboardAppInner />
      </ErrorBoundary>
    </BoardProvider>
  );
}
