import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";

export default function SigninScreen({ onSignIn }: { onSignIn: () => void }) {
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
          margin: "26px 0 40px",
          maxWidth: 260,
        }}
      >
        speak your stream of consciousness — we&apos;ll file it away for you.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
        <button
          onClick={onSignIn}
          style={{
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "oklch(0.99 0.005 80)",
            background: "oklch(0.26 0.02 55)",
            border: "none",
            borderRadius: 30,
            padding: "15px 0",
            cursor: "pointer",
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.69 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"
            />
          </svg>
          Continue with GitHub
        </button>
        <button
          onClick={onSignIn}
          style={{
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 15,
            color: "oklch(0.3 0.02 55)",
            background: "oklch(0.98 0.01 80)",
            border: "1.5px solid oklch(0.83 0.02 65)",
            borderRadius: 30,
            padding: "15px 0",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
          </svg>
          Continue with Google
        </button>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "oklch(0.6 0.02 60)", marginTop: 22 }}>
        by continuing you agree to our terms
      </span>
    </div>
  );
}
