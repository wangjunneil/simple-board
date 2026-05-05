"use client";

import type { Board, Theme, Font } from "@/types";

const STORAGE_KEYS = {
  BOARDS: "nb-boards",
  ACTIVE_BOARD: "nb-active-board",
  THEME: "nb-theme",
  FONT: "nb-font",
} as const;

export function saveBoards(boards: Board[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  } catch (e) {
    console.error("Failed to save boards:", e);
  }
}

export function loadBoards(): Board[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOARDS);
    if (!data) return [];
    const boards: Board[] = JSON.parse(data);
    return boards.map((b) => ({
      ...b,
      createdAt: b.createdAt || new Date(2024, 0, 1).toISOString(),
    }));
  } catch (e) {
    console.error("Failed to load boards:", e);
    return [];
  }
}

export function saveActiveBoardId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_BOARD, id);
}

export function loadActiveBoardId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_BOARD);
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

export function loadTheme(): Theme | null {
  const val = localStorage.getItem(STORAGE_KEYS.THEME);
  if (val === "dark" || val === "light") return val;
  return null;
}

export function saveFont(font: Font): void {
  localStorage.setItem(STORAGE_KEYS.FONT, font);
}

export function loadFont(): Font | null {
  const val = localStorage.getItem(STORAGE_KEYS.FONT);
  const fonts: Font[] = [
    "f-barlow",
    "f-ibm-plex",
    "f-open-sans",
    "f-segoe-ui",
    "f-maven-pro",
  ];
  return fonts.includes(val as Font) ? (val as Font) : null;
}

const DEVICE_ID_KEY = "nb-device-id";

export function loadDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function saveDeviceId(id: string): void {
  localStorage.setItem(DEVICE_ID_KEY, id);
}
