"use client";

export interface Note {
  id: string;
  text: string;
  collapsed: boolean;
  raw: boolean;
  color: string;
  completedAt?: string;
}

export interface List {
  id: string;
  title: string;
  notes: Note[];
}

export interface Board {
  id: string;
  title: string;
  lists: List[];
  createdAt: string;
}

export type Theme = "light" | "dark";
export type Font =
  | "f-barlow"
  | "f-ibm-plex"
  | "f-open-sans"
  | "f-segoe-ui"
  | "f-maven-pro";

export interface BoardData {
  boards: Board[];
  activeBoardId: string;
  theme: Theme;
  font: Font;
}

export type BoardAction =
  | { type: "ADD_BOARD"; title?: string }
  | { type: "DELETE_BOARD"; boardId: string }
  | { type: "SWITCH_BOARD"; boardId: string }
  | { type: "REORDER_BOARDS"; boardIds: string[] }
  | { type: "ADD_LIST"; boardId: string; title?: string }
  | { type: "DELETE_LIST"; boardId: string; listId: string }
  | { type: "REORDER_LISTS"; boardId: string; listIds: string[] }
  | { type: "UPDATE_LIST_TITLE"; boardId: string; listId: string; title: string }
  | { type: "ADD_NOTE"; boardId: string; listId: string; text?: string }
  | { type: "DELETE_NOTE"; boardId: string; listId: string; noteId: string }
  | { type: "UPDATE_NOTE"; boardId: string; listId: string; noteId: string; text: string }
  | { type: "TOGGLE_COLLAPSE"; boardId: string; listId: string; noteId: string }
  | { type: "EXPAND_ALL_NOTES"; boardId: string }
  | { type: "COLLAPSE_ALL_NOTES"; boardId: string }
  | { type: "SET_COLOR"; boardId: string; listId: string; noteId: string; color: string }
  | { type: "REORDER_NOTES"; boardId: string; listId: string; noteIds: string[] }
  | { type: "MOVE_NOTE"; boardId: string; fromListId: string; toListId: string; noteId: string; index?: number }
  | { type: "TOGGLE_RAW"; boardId: string; listId: string; noteId: string }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "SET_FONT"; font: Font }
  | { type: "UPDATE_BOARD_TITLE"; boardId: string; title: string }
  | { type: "SET_BOARDS"; boards: Board[] }
  | { type: "UNDO" }
  | { type: "REDO" };
