"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useBoardContext } from "@/hooks/use-board";
import { loadDeviceId } from "@/lib/storage";

export type SyncStatus = "idle" | "syncing" | "synced" | "error";

export function useSync() {
  const { state, dispatch } = useBoardContext();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const deviceIdRef = useRef<string>("");
  const stateRef = useRef(state);
  const redirectedRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const doSync = useCallback(async () => {
    if (!deviceIdRef.current) return;
    setSyncStatus("syncing");
    try {
      const { boards, activeBoardId, theme, font } = stateRef.current;
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceIdRef.current,
          boards,
          activeBoardId,
          theme,
          font,
        }),
      });
      if (res.ok) {
        setSyncStatus("synced");
      } else {
        if (res.status === 401 && !redirectedRef.current) {
          redirectedRef.current = true;
          window.location.href = "/login?reason=session_expired";
          return;
        }
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
  }, []);

  useEffect(() => {
    const did = loadDeviceId() || "";
    deviceIdRef.current = did;

    let isCancelled = false;

    const loadFromServer = async () => {
      try {
        const [prefsRes, boardsRes] = await Promise.all([
          fetch(`/api/preferences?deviceId=${did}`),
          fetch(`/api/boards?deviceId=${did}`),
        ]);

        if (!isCancelled && prefsRes.status === 401 && !redirectedRef.current) {
          redirectedRef.current = true;
          window.location.href = "/login?reason=session_expired";
          return;
        }

        if (!isCancelled && boardsRes.status === 401 && !redirectedRef.current) {
          redirectedRef.current = true;
          window.location.href = "/login?reason=session_expired";
          return;
        }

        if (!isCancelled && prefsRes.ok) {
          const prefDoc = await prefsRes.json();
          if (prefDoc) {
            if (prefDoc.theme) {
              dispatch({ type: "SET_THEME", theme: prefDoc.theme });
            }
            if (prefDoc.font) {
              dispatch({ type: "SET_FONT", font: prefDoc.font });
            }
          }
        }

        if (!isCancelled && boardsRes.ok) {
          const boardsDoc = await boardsRes.json();
          if (boardsDoc?.boards) {
            dispatch({ type: "SET_BOARDS", boards: boardsDoc.boards });
          }
        }
      } catch {
        /* offline - keep localStorage values */
      }
    };

    loadFromServer();

    const initialTimer = setTimeout(() => {
      doSync();
      const interval = setInterval(doSync, 30_000);
      return () => clearInterval(interval);
    }, 5_000);
    return () => {
      isCancelled = true;
      clearTimeout(initialTimer);
    };
  }, []);

  return syncStatus;
}
