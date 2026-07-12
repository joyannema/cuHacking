import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";
import type { Profile } from "@/lib/types";

export default function SettingsScreen({
  profile,
  muted,
  onSignOut,
  onGoAccount,
  onToggleMute,
}: {
  profile: Profile;
  muted: boolean;
  onSignOut: () => void;
  onGoAccount: () => void;
  onToggleMute: () => void;
}) {
  const settingsRows = [
    { icon: "👤", label: "account", onClick: onGoAccount },
    { icon: "🔔", label: "notifications", onClick: () => {} },
    { icon: "🔒", label: "privacy", onClick: () => {} },
    { icon: "💬", label: "help & feedback", onClick: () => {} },
  ];
  const initial = (profile.name[0] || "A").toUpperCase();

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "oklch(0.93 0.015 75)",
        backgroundImage: PAPER_BG,
        backgroundSize: PAPER_BG_SIZE,
      }}
    >
      <PaperDecor />

      <div style={{ padding: "max(28px, env(safe-area-inset-top)) 20px 16px" }}>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, color: "oklch(0.24 0.02 55)", letterSpacing: "-0.02em" }}>
          settings
        </span>
      </div>

      <svg style={{ position: "absolute", top: 80, right: 26, opacity: 0.4, zIndex: 1 }} width="30" height="14" viewBox="0 0 30 14">
        <path d="M1 7 Q 8 0, 15 7 T 29 7" stroke="oklch(0.55 0.08 45)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="1 4.5" />
      </svg>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 150px" }}>
        <button
          onClick={onGoAccount}
          style={{
            width: "100%",
            boxSizing: "border-box",
            textAlign: "left",
            border: "1px solid oklch(0.88 0.015 70)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "oklch(0.98 0.01 80)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 22,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(155deg, oklch(0.74 0.15 45), oklch(0.66 0.16 30))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              color: "oklch(0.99 0.005 80)",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: "oklch(0.26 0.02 55)" }}>{profile.name}</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>@{profile.username}</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 4L17 12L9 20" stroke="oklch(0.65 0.02 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {settingsRows.map((row, i) => (
            <div
              key={row.label}
              onClick={row.onClick}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 2px",
                cursor: "pointer",
                borderBottom: i < settingsRows.length - 1 ? "1.4px dashed oklch(0.85 0.015 70)" : undefined,
              }}
            >
              <span style={{ fontSize: 16 }}>{row.icon}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "oklch(0.28 0.02 55)", flex: 1 }}>{row.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 4L17 12L9 20" stroke="oklch(0.65 0.02 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "15px 2px",
              borderTop: "1.4px dashed oklch(0.85 0.015 70)",
            }}
          >
            <span style={{ fontSize: 16 }}>{muted ? "🔇" : "🔊"}</span>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "oklch(0.28 0.02 55)", flex: 1 }}>
              mood tune sound
            </span>
            <button
              onClick={onToggleMute}
              aria-pressed={!muted}
              aria-label={muted ? "unmute mood tune" : "mute mood tune"}
              style={{
                width: 44,
                height: 26,
                borderRadius: 20,
                border: "none",
                padding: 3,
                cursor: "pointer",
                background: muted ? "oklch(0.85 0.015 70)" : "oklch(0.66 0.16 30)",
                display: "flex",
                justifyContent: muted ? "flex-start" : "flex-end",
                transition: "background 0.2s ease",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "oklch(0.99 0.005 80)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>
          </div>
        </div>

        <button
          onClick={onSignOut}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 26,
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "oklch(0.5 0.14 25)",
            background: "oklch(0.95 0.03 25)",
            border: "1.5px dashed oklch(0.65 0.1 25)",
            borderRadius: 16,
            padding: "14px 0",
            cursor: "pointer",
          }}
        >
          sign out
        </button>
      </div>
    </div>
  );
}
