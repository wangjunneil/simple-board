"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { BoardProvider, useBoardContext } from "@/hooks/use-board";
import BoardView from "@/components/BoardView";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { Board, Font } from "@/types";

function Logo() {
  const { state, dispatch } = useBoardContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const { undo, redo } = useBoardContext();

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

  return (
    <>
      <Logo />
      <BoardView />
      <ThemeToggle />
      <div className="footer">
        @Copyright <a href="https://wangjun.dev">Calvin Wang</a>{" "}Since 2026 &ndash; 2036
      </div>
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
