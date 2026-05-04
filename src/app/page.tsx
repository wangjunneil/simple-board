"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { BoardProvider, useBoardContext } from "@/hooks/use-board";
import BoardView from "@/components/BoardView";
import ErrorBoundary from "@/components/ErrorBoundary";
import type { Board, Font } from "@/types";

function Logo() {
  const { state, dispatch } = useBoardContext();

  return (
    <div className="logo">
      <a href="#" onClick={(e) => e.preventDefault()}>
        SimpleBoard
      </a>
      <div className="bulk">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: "SWITCH_BOARD", boardId: "" });
          }}
        >
          Boards
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            dispatch({ type: "ADD_BOARD" });
          }}
        >
          New board
        </a>
      </div>
    </div>
  );
}

function Config() {
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

  const handleThemeToggle = useCallback(() => {
    dispatch({
      type: "SET_THEME",
      theme: state.theme === "light" ? "dark" : "light",
    });
  }, [state.theme, dispatch]);

  const handleSetFont = useCallback(
    (font: Font) => {
      dispatch({ type: "SET_FONT", font });
    },
    [dispatch]
  );

  const handleSwitchBoard = useCallback(
    (boardId: string) => {
      dispatch({ type: "SWITCH_BOARD", boardId });
    },
    [dispatch]
  );

  const handleDeleteBoard = useCallback(
    (boardId: string) => {
      if (confirm("Delete this board forever?")) {
        dispatch({ type: "DELETE_BOARD", boardId });
      }
    },
    [dispatch]
  );

  const currentBoard = state.boards.find(
    (b) => b.id === state.activeBoardId
  );

  return (
    <div className="config">
      <div className="teaser">
        <i>Config</i>
        <u>backups</u>
      </div>
      <div className="bulk">
        <div className="section">
          <div className="title"><u>Boards</u></div>
          <div className="details boards">
            {state.boards.map((board) => (
              <a
                key={board.id}
                href="#"
                className={`load-board${board.id === state.activeBoardId ? " active" : ""}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleSwitchBoard(board.id);
                }}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  handleDeleteBoard(board.id);
                }}
              >
                {board.title}
              </a>
            ))}
          </div>
        </div>
        <div className="section">
          <div className="title"><u>Import / Export</u></div>
          <div className="details">
            <a href="#" onClick={(e) => { e.preventDefault(); handleExport(); }}>
              Export boards
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); handleImport(); }}>
              Import boards
            </a>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="section">
          <div className="title"><u>Preferences</u></div>
          <div className="details">
            <a
              href="#"
              className="switch-theme"
              onClick={(e) => {
                e.preventDefault();
                handleThemeToggle();
              }}
            >
              <i>Dark mode</i>
              <b>Light mode</b>
            </a>
            <div className="ui-prefs">
              <div className="f-prefs">
                <table>
                  <tbody>
                    {(
                      [
                        ["f-barlow", "Barlow"],
                        ["f-ibm-plex", "IBM Plex"],
                        ["f-open-sans", "Open Sans"],
                        ["f-segoe-ui", "Segoe UI"],
                        ["f-maven-pro", "Maven Pro"],
                      ] as [Font, string][]
                    ).map(([fontKey, label]) => (
                      <tr key={fontKey} className={`ui-${fontKey}`}>
                        <td className="name">{label}</td>
                        <td className="val">
                          <a
                            href="#"
                            className={`switch-font${state.font === fontKey ? " active" : ""}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSetFont(fontKey);
                            }}
                          >
                            {state.font === fontKey ? "active" : "set"}
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <Config />
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
