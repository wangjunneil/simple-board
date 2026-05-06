"use client";

import { useEffect, useState, useCallback } from "react";

let registration: ServiceWorkerRegistration | null = null;

export function PwaRegistration() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleUpdate = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function register() {
      navigator.serviceWorker.register("/sw.js").then(function (reg) {
        registration = reg;

        reg.onupdatefound = function () {
          var installing = reg.installing;
          if (!installing) return;

          installing.onstatechange = function () {
            if (installing!.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          };
        };

        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }
      });
    }

    window.addEventListener("load", register);
    return function () {
      window.removeEventListener("load", register);
    };
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
