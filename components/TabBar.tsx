import type { ReactNode } from "react";

export default function TabBar({
  active,
  onHome,
  onTodos,
  onCapture,
  onJournal,
  onSettings,
  muted,
  onToggleMute,
  moodLabel,
}: {
  active: "stream" | "todos" | "journal" | "settings";
  onHome: () => void;
  onTodos: () => void;
  onCapture: () => void;
  onJournal: () => void;
  onSettings: () => void;
  muted: boolean;
  onToggleMute: () => void;
  moodLabel: string;
}) {
  const navIcon = (
    isActive: boolean,
    onClick: () => void,
    icon: (stroke: string, strokeWidth: number) => ReactNode
  ) => {
    const stroke = isActive ? "oklch(0.28 0.02 55)" : "oklch(0.4 0.03 60)";
    const strokeWidth = isActive ? 2 : 1.8;
    return (
      <button
        onClick={onClick}
        style={{
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: `1.5px solid ${isActive ? "oklch(0.75 0.03 65)" : "oklch(0.8 0.02 65)"}`,
          background: isActive ? "oklch(0.99 0.01 80)" : "oklch(0.98 0.01 80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {icon(stroke, strokeWidth)}
      </button>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 132,
        background: "linear-gradient(to top, oklch(0.93 0.015 75) 55%, transparent)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: 26,
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14, pointerEvents: "auto" }}>
        {navIcon(active === "stream", onHome, (stroke, sw) => (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <path d="M4 11L12 4L20 11" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 10V20H18V10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}

        {navIcon(active === "todos", onTodos, (stroke, sw) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke={stroke} strokeWidth={sw} />
            <path d="M9 3h6v2.5H9z" fill={stroke} />
            <path d="M8.5 12l1.8 1.8L15 9.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ))}

        <button
          onClick={onCapture}
          style={{
            width: 78,
            height: 78,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            top: -6,
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(155deg, oklch(0.74 0.15 45), oklch(0.66 0.16 30))",
              boxShadow: "0 8px 22px oklch(0.6 0.16 35 / 0.45), 0 2px 6px rgba(0,0,0,0.12)",
              animation: "blobMorph 6s ease-in-out infinite, blobPulse 3.2s ease-in-out infinite",
            }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="oklch(0.99 0.005 80)" />
              <path d="M5 11a7 7 0 0 0 14 0" stroke="oklch(0.99 0.005 80)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <line x1="12" y1="18" x2="12" y2="22" stroke="oklch(0.99 0.005 80)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </button>

        {navIcon(active === "journal", onJournal, (stroke, sw) => (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5.5c-2-1.1-4.3-1.4-6.5-1v12.5c2.2-0.4 4.5-0.1 6.5 1c2-1.1 4.3-1.4 6.5-1V4.5c-2.2-0.4-4.5-0.1-6.5 1z"
              stroke={stroke}
              strokeWidth={sw === 2 ? 1.6 : 1.6}
              strokeLinejoin="round"
              fill="none"
            />
            <path d="M12 5.5v12.5" stroke={stroke} strokeWidth="1.4" />
          </svg>
        ))}

        {navIcon(active === "settings", onSettings, (stroke, sw) => (
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.6" stroke={stroke} strokeWidth={sw} />
            <path d="M4.5 19.5c1.4-3.8 4.3-5.7 7.5-5.7s6.1 1.9 7.5 5.7" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          right: 40,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: "rotate(-2.5deg)",
            background: "repeating-linear-gradient(45deg, oklch(0.88 0.05 19 / 0.85) 0 4px, oklch(0.94 0.03 19 / 0.7) 4px 8px)",
            borderRadius: 3,
            padding: "10px 16px 9px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
          }}
        >
          <button
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "50%",
              border: "1.5px solid oklch(0.98 0.01 80 / 0.7)",
              background: "oklch(0.98 0.01 80 / 0.55)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 10v4h4l5 5V5L8 10H4z" fill="oklch(0.35 0.03 60)" />
              {muted ? (
                <path d="M16 9l5 5M21 9l-5 5" stroke="oklch(0.35 0.03 60)" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M16.5 8.5a5 5 0 0 1 0 7" stroke="oklch(0.35 0.03 60)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              )}
            </svg>
          </button>

          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 8.5,
                color: "oklch(0.32 0.03 60)",
                whiteSpace: "nowrap",
              }}
            >
              now playing your recent mood
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "oklch(0.24 0.03 55)",
                textTransform: "capitalize",
              }}
            >
              {moodLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
