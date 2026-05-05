"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveDeviceId } from "@/lib/storage";

export default function LoginPage() {
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined" && window.location.hostname === "simple-board-snowy.vercel.app") {
      return "admin123";
    }
    return "";
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.deviceId) {
          saveDeviceId(data.deviceId);
        }
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>SimpleBoard</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter access password"
            autoFocus
            disabled={loading}
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
