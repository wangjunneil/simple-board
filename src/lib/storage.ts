"use client";

import type { Board, Theme, Font } from "@/types";

const DEVICE_ID_KEY = "nb-device-id";

function getDeviceId(): string {
  return localStorage.getItem(DEVICE_ID_KEY) || "";
}

function key(base: string): string {
  const did = getDeviceId();
  return did ? `${did}-${base}` : base;
}

export function saveBoards(boards: Board[]): void {
  try {
    localStorage.setItem(key("nb-boards"), JSON.stringify(boards));
  } catch (e) {
    console.error("Failed to save boards:", e);
  }
}

export function loadBoards(): Board[] {
  try {
    const data = localStorage.getItem(key("nb-boards"));
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
  localStorage.setItem(key("nb-active-board"), id);
}

export function loadActiveBoardId(): string | null {
  return localStorage.getItem(key("nb-active-board"));
}

export function saveTheme(theme: Theme): void {
  localStorage.setItem(key("nb-theme"), theme);
}

export function loadTheme(): Theme | null {
  const val = localStorage.getItem(key("nb-theme"));
  if (val === "dark" || val === "light" || val === "auto") return val;
  return null;
}

export function saveFont(font: Font): void {
  localStorage.setItem(key("nb-font"), font);
}

export function loadFont(): Font | null {
  const val = localStorage.getItem(key("nb-font"));
  const fonts: Font[] = [
    "f-barlow",
    "f-ibm-plex",
    "f-open-sans",
    "f-segoe-ui",
    "f-maven-pro",
  ];
  return fonts.includes(val as Font) ? (val as Font) : null;
}

export function loadDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}

export function saveDeviceId(id: string): void {
  localStorage.setItem(DEVICE_ID_KEY, id);
}
