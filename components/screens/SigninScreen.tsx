"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import PaperDecor from "../PaperDecor";
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
        padding: "64px 34px 0",
        boxSizing: "border-box",
        backgroundColor: "oklch(0.93 0.015 75)",
        backgroundImage: PAPER_BG,
        backgroundSize: PAPER_BG_SIZE,
        animation: "screenIn 0.3s ease-out",
      }}
    >
      <PaperDecor />

      <svg style={{ position: "absolute", top: 100, left: 34, opacity: 0.5 }} width="18" height="18" viewBox="0 0 18 18">
        <path d="M9 0 L11 7 L18 9 L11 11 L9 18 L7 11 L0 9 L7 7 Z" fill="oklch(0.72 0.13 55)" />
      </svg>
      <svg style={{ position: "absolute", top: 150, right: 40, opacity: 0.45 }} width="34" height="16" viewBox="0 0 34 16">
        <path d="M1 8 Q 8 0, 17 8 T 33 8" stroke="oklch(0.6 0.1 45)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 5" />
      </svg>
      <svg style={{ position: "absolute", bottom: 210, left: 44, opacity: 0.4 }} width="16" height="16" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="6.5" stroke="oklch(0.5 0.1 300)" strokeWidth="1.6" fill="none" strokeDasharray="2 3.4" />
      </svg>
      <svg style={{ position: "absolute", top: 250, left: 60, opacity: 0.35 }} width="26" height="26" viewBox="0 0 26 26">
        <path
          d="M13 2 C13 8 20 6 20 13 C20 20 13 18 13 24 C13 18 6 20 6 13 C6 6 13 8 13 2 Z"
          stroke="oklch(0.55 0.1 320)"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="1.5 3"
        />
      </svg>

      <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 34, color: "oklch(0.24 0.02 55)", letterSpacing: "-0.03em" }}>
        synapse
      </span>
      <p style={{ fontFamily: "'Caveat',cursive", fontSize: 21, color: "oklch(0.5 0.05 45)", margin: "6px 0 0" }}>
        it just listens, and organizes
      </p>
      <p
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: 11.5,
          color: "oklch(0.55 0.02 60)",
          textAlign: "center",
          lineHeight: 1.6,
          margin: "26px 0 32px",
          maxWidth: 260,
        }}
      >
        sign in to start filing your thoughts.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
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
