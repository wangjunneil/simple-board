"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import type { Board, Note, List, BoardAction, Theme, Font } from "@/types";
import {
  saveBoards,
  loadBoards,
  saveActiveBoardId,
  loadActiveBoardId,
  saveTheme,
  loadTheme,
  saveFont,
  loadFont,
} from "@/lib/storage";

const DONE_LIST_PATTERN = /(done|completed|achieved|finished|已完成)/i;

export function isCompletedList(title: string): boolean {
  return DONE_LIST_PATTERN.test(title);
}

interface BoardState {
  boards: Board[];
  activeBoardId: string | null;
  theme: Theme;
  font: Font;
}

interface HistoryEntry {
  boards: Board[];
}

const MAX_HISTORY = 50;

function boardsReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "ADD_BOARD": {
      const newBoard: Board = {
        id: uuidv4(),
        title: action.title || "New Board",
        lists: [],
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        boards: [...state.boards, newBoard],
        activeBoardId: newBoard.id,
      };
    }
    case "DELETE_BOARD": {
      const boards = state.boards.filter((b) => b.id !== action.boardId);
      let activeBoardId = state.activeBoardId;
      if (action.boardId === state.activeBoardId) {
        activeBoardId = boards.length > 0 ? boards[boards.length - 1].id : null;
      }
      return { ...state, boards, activeBoardId };
    }
    case "SWITCH_BOARD":
      return { ...state, activeBoardId: action.boardId };
    case "REORDER_BOARDS": {
      const boardMap = new Map(state.boards.map((b) => [b.id, b]));
      const reordered = action.boardIds
        .map((id) => boardMap.get(id))
        .filter((b): b is Board => !!b);
      return { ...state, boards: reordered };
    }
    case "ADD_LIST": {
      const newList: List = {
        id: uuidv4(),
        title: action.title || "",
        notes: [],
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId ? { ...b, lists: [...b.lists, newList] } : b
        ),
      };
    }
    case "DELETE_LIST":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? { ...b, lists: b.lists.filter((l) => l.id !== action.listId) }
            : b
        ),
      };
    case "REORDER_LISTS": {
      return {
        ...state,
        boards: state.boards.map((b) => {
          if (b.id !== action.boardId) return b;
          const listMap = new Map(b.lists.map((l) => [l.id, l]));
          const reordered = action.listIds
            .map((id) => listMap.get(id))
            .filter((l): l is List => !!l);
          return { ...b, lists: reordered };
        }),
      };
    }
    case "UPDATE_LIST_TITLE":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId ? { ...l, title: action.title } : l
                ),
              }
            : b
        ),
      };
    case "ADD_NOTE": {
      const newNote: Note = {
        id: uuidv4(),
        text: action.text || "",
        collapsed: false,
        raw: false,
        color: "",
      };
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? { ...l, notes: [...l.notes, newNote] }
                    : l
                ),
              }
            : b
        ),
      };
    }
    case "DELETE_NOTE":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? { ...l, notes: l.notes.filter((n) => n.id !== action.noteId) }
                    : l
                ),
              }
            : b
        ),
      };
    case "UPDATE_NOTE":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? {
                        ...l,
                        notes: l.notes.map((n) =>
                          n.id === action.noteId ? { ...n, text: action.text } : n
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
    case "TOGGLE_COLLAPSE":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? {
                        ...l,
                        notes: l.notes.map((n) =>
                          n.id === action.noteId
                            ? { ...n, collapsed: !n.collapsed }
                            : n
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
    case "EXPAND_ALL_NOTES":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) => ({
                  ...l,
                  notes: l.notes.map((n) => ({ ...n, collapsed: false })),
                })),
              }
            : b
        ),
      };
    case "COLLAPSE_ALL_NOTES":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) => ({
                  ...l,
                  notes: l.notes.map((n) => ({ ...n, collapsed: true })),
                })),
              }
            : b
        ),
      };
    case "SET_COLOR":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? {
                        ...l,
                        notes: l.notes.map((n) =>
                          n.id === action.noteId
                            ? { ...n, color: action.color }
                            : n
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
    case "REORDER_NOTES": {
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) => {
                  if (l.id !== action.listId) return l;
                  const noteMap = new Map(l.notes.map((n) => [n.id, n]));
                  const reordered = action.noteIds
                    .map((id) => noteMap.get(id))
                    .filter((n): n is Note => !!n);
                  return { ...l, notes: reordered };
                }),
              }
            : b
        ),
      };
    }
    case "MOVE_NOTE": {
      let movedNote: Note | undefined;
      const boardsAfterRemove = state.boards.map((b) =>
        b.id === action.boardId
          ? {
              ...b,
              lists: b.lists.map((l) => {
                if (l.id === action.fromListId) {
                  const idx = l.notes.findIndex(
                    (n) => n.id === action.noteId
                  );
                  if (idx !== -1) {
                    movedNote = l.notes[idx];
                    return {
                      ...l,
                      notes: l.notes.filter((n) => n.id !== action.noteId),
                    };
                  }
                }
                return l;
              }),
            }
          : b
      );
      if (!movedNote) return state;

      const targetBoard = state.boards.find((b) => b.id === action.boardId);
      const targetList = targetBoard?.lists.find((l) => l.id === action.toListId);
      const isDoneList = targetList && isCompletedList(targetList.title);

      if (isDoneList) {
        movedNote = { ...movedNote, completedAt: new Date().toISOString(), color: "" };
      }

      return {
        ...state,
        boards: boardsAfterRemove.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) => {
                  if (l.id !== action.toListId) return l;
                  const notes = [...l.notes];
                  const idx =
                    action.index !== undefined ? action.index : notes.length;
                  notes.splice(idx, 0, movedNote!);
                  return { ...l, notes };
                }),
              }
            : b
        ),
      };
    }
    case "TOGGLE_RAW":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId
            ? {
                ...b,
                lists: b.lists.map((l) =>
                  l.id === action.listId
                    ? {
                        ...l,
                        notes: l.notes.map((n) =>
                          n.id === action.noteId
                            ? { ...n, raw: !n.raw }
                            : n
                        ),
                      }
                    : l
                ),
              }
            : b
        ),
      };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "SET_FONT":
      return { ...state, font: action.font };
    case "UPDATE_BOARD_TITLE":
      return {
        ...state,
        boards: state.boards.map((b) =>
          b.id === action.boardId ? { ...b, title: action.title } : b
        ),
      };
    case "SET_BOARDS":
      return { ...state, boards: action.boards };
    default:
      return state;
  }
}

function createInitialState(): BoardState {
  const boards = typeof localStorage !== "undefined" ? loadBoards() : [];
  const theme = typeof localStorage !== "undefined" && loadTheme() || "light";
  const font = typeof localStorage !== "undefined" && loadFont() || "f-open-sans";

  if (boards.length === 0) {
    const defaultBoard: Board = {
      id: uuidv4(),
      title: "SimpleBoard",
      lists: [
        {
          id: uuidv4(),
          title: "To Do",
          notes: [
            {
              id: uuidv4(),
              text: "Welcome to SimpleBoard! Double-click to edit.",
              collapsed: false,
              raw: false,
              color: "",
            },
            {
              id: uuidv4(),
              text: "Click ≡ for note options",
              collapsed: false,
              raw: false,
              color: "",
            },
          ],
        },
        {
          id: uuidv4(),
          title: "In Progress",
          notes: [
            {
              id: uuidv4(),
              text: "A raw note (bold, no card)",
              collapsed: false,
              raw: true,
              color: "",
            },
          ],
        },
        {
          id: uuidv4(),
          title: "Done",
          notes: [],
        },
      ],
      createdAt: new Date().toISOString(),
    };
    return {
      boards: [defaultBoard],
      activeBoardId: null,
      theme,
      font,
    };
  }

  return {
    boards,
    activeBoardId: null,
    theme,
    font,
  };
}

interface BoardContextValue {
  state: BoardState;
  dispatch: React.Dispatch<BoardAction>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(boardsReducer, undefined, createInitialState);
  const historyRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const initialisedRef = useRef(false);

  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const effectiveTheme: "light" | "dark" =
    state.theme === "auto" ? (systemDark ? "dark" : "light") : state.theme;

  useEffect(() => {
    saveBoards(state.boards);
    saveActiveBoardId(state.activeBoardId || "");
    saveTheme(state.theme);
    saveFont(state.font);
  }, [state]);

  useEffect(() => {
    document.documentElement.classList.remove(
      "theme-light",
      "theme-dark",
      "f-barlow",
      "f-ibm-plex",
      "f-open-sans",
      "f-segoe-ui",
      "f-maven-pro"
    );
    document.documentElement.classList.add(
      `theme-${effectiveTheme}`,
      state.font
    );
  }, [effectiveTheme, state.font]);

  useEffect(() => {
    if (!initialisedRef.current) {
      initialisedRef.current = true;
      return;
    }
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    historyRef.current.push({ boards: JSON.parse(JSON.stringify(state.boards)) });
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current.shift();
    }
    futureRef.current = [];
    setCanUndo(true);
    setCanRedo(false);
  }, [state.boards]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const skipHistoryRef = useRef(false);

  const undo = useCallback(() => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current.push({
      boards: JSON.parse(JSON.stringify(state.boards)),
    });
    const mergedBoards = [
      ...prev.boards.filter((b: Board) =>
        state.boards.some((sb: Board) => sb.id === b.id)
      ),
      ...prev.boards.filter(
        (b: Board) => !state.boards.some((sb: Board) => sb.id === b.id)
      ),
      ...state.boards.filter(
        (b: Board) => !prev.boards.some((pb: Board) => pb.id === b.id)
      ),
    ];
    skipHistoryRef.current = true;
    dispatch({ type: "SET_BOARDS", boards: mergedBoards });
    const restoredActiveId = prev.boards.some(
      (b: Board) => b.id === state.activeBoardId
    )
      ? state.activeBoardId
      : prev.boards[prev.boards.length - 1]?.id || state.activeBoardId;
    if (restoredActiveId) {
      dispatch({ type: "SWITCH_BOARD", boardId: restoredActiveId });
    }
    requestAnimationFrame(() => {
      setCanUndo(historyRef.current.length > 0);
      setCanRedo(true);
    });
  }, [state]);

  const redo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push({
      boards: JSON.parse(JSON.stringify(state.boards)),
    });
    const mergedBoards = [
      ...next.boards.filter((b: Board) =>
        state.boards.some((sb: Board) => sb.id === b.id)
      ),
      ...next.boards.filter(
        (b: Board) => !state.boards.some((sb: Board) => sb.id === b.id)
      ),
      ...state.boards.filter(
        (b: Board) => !next.boards.some((nb: Board) => nb.id === b.id)
      ),
    ];
    skipHistoryRef.current = true;
    dispatch({ type: "SET_BOARDS", boards: mergedBoards });
    const restoredActiveId = next.boards.some(
      (b: Board) => b.id === state.activeBoardId
    )
      ? state.activeBoardId
      : next.boards[next.boards.length - 1]?.id || state.activeBoardId;
    if (restoredActiveId) {
      dispatch({ type: "SWITCH_BOARD", boardId: restoredActiveId });
    }
    requestAnimationFrame(() => {
      setCanRedo(futureRef.current.length > 0);
      setCanUndo(true);
    });
  }, [state]);

  return (
    <BoardContext.Provider
      value={{ state, dispatch, undo, redo, canUndo, canRedo }}
    >
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext(): BoardContextValue {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error("useBoardContext must be used within BoardProvider");
  return ctx;
}
