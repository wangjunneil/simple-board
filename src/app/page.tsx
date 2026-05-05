"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { BoardProvider, useBoardContext } from "@/hooks/use-board";
import BoardView from "@/components/BoardView";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useSync } from "@/hooks/use-sync";
import type { SyncStatus } from "@/hooks/use-sync";
import type { Board, Font } from "@/types";

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
    <div className="logo">
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

function ThemeToggle() {
  const { state, dispatch } = useBoardContext();

  const handleToggleTheme = useCallback(() => {
    dispatch({
      type: "SET_THEME",
      theme: state.theme === "light" ? "dark" : "light",
    });
  }, [state.theme, dispatch]);

  return (
    <div className="theme-toggle">
      <button onClick={handleToggleTheme}>
        {state.theme === "light" ? "\u263E" : "\u2600"}
      </button>
    </div>
  );
}

function NullboardAppInner() {
  const { undo, redo, dispatch } = useBoardContext();
  const syncStatus = useSync();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "z" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        undo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleGoBoards = useCallback(() => {
    setShowHelp(false);
    dispatch({ type: "SWITCH_BOARD", boardId: "" });
  }, [dispatch]);

  return (
    <>
      <Logo syncStatus={syncStatus} onShowHelp={() => setShowHelp(true)} />
      <BoardView />
      <ThemeToggle />
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
