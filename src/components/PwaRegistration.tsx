"use client";

import { useEffect, useState, useCallback } from "react";

export function PwaRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleUpdate = useCallback(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((reg) => {
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });

      if (reg.waiting && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }
    });
  }, []);

  if (!updateAvailable) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      display: "flex",
      justifyContent: "center",
      padding: "10px 16px",
      background: "#f0f4ff",
      borderTop: "1px solid #b8d4fe",
      fontSize: "13px",
      color: "#333",
      gap: "12px",
      alignItems: "center",
    }}>
      <span>A new version is available.</span>
      <button
        onClick={handleUpdate}
        style={{
          padding: "4px 14px",
          background: "#4a90d9",
          color: "#fff",
          border: "none",
          borderRadius: "3px",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Refresh
      </button>
    </div>
  );
}
