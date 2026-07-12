"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";

export interface AuthUser {
  userId: string;
  username: string;
}

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'IBM Plex Mono',monospace",
  fontSize: 13,
  color: "oklch(0.3 0.02 55)",
  background: "oklch(0.98 0.01 80)",
  border: "1.5px solid oklch(0.83 0.02 65)",
  borderRadius: 14,
  padding: "14px 16px",
  outline: "none",
};

export default function SigninScreen({ onSignIn }: { onSignIn: (user: AuthUser) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed");
        return;
      }

      onSignIn({ userId: data.userId, username: data.username });
    } catch {
      setError("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 68px",
        boxSizing: "border-box",
        backgroundColor: "oklch(0.93 0.015 75)",
        backgroundImage: PAPER_BG,
        backgroundSize: PAPER_BG_SIZE,
        animation: "screenIn 0.3s ease-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="synapse" width={320} height={70} style={{ width: 320, height: "auto" }} />

      <p
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11.5,
          color: "oklch(0.55 0.02 60)",
          textAlign: "center",
          lineHeight: 1.6,
          margin: "4px 0 32px",
          maxWidth: 260,
        }}
      >
        sign in to start filing your thoughts.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          style={inputStyle}
        />

        {error && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.55 0.12 25)", textAlign: "center" }}>
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "oklch(0.99 0.005 80)",
            background: loading ? "oklch(0.45 0.02 55)" : "oklch(0.26 0.02 55)",
            border: "none",
            borderRadius: 30,
            padding: "15px 0",
            cursor: loading ? "wait" : "pointer",
            marginTop: 4,
          }}
        >
          {loading ? "signing in…" : "sign in"}
        </button>
      </form>

      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "oklch(0.6 0.02 60)", marginTop: 22 }}>
        test account: person / hello
      </span>
    </div>
  );
}
