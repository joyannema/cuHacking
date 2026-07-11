import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";

const SETTINGS_ROWS = [
  { icon: "👤", label: "account" },
  { icon: "🔔", label: "notifications" },
  { icon: "🔒", label: "privacy" },
  { icon: "💬", label: "help & feedback" },
];

export default function SettingsScreen({ onSignOut }: { onSignOut: () => void }) {
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "oklch(0.98 0.01 80)",
            border: "1px solid oklch(0.88 0.015 70)",
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
            }}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: "oklch(0.26 0.02 55)" }}>alex rivera</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>alex@synapse.app</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {SETTINGS_ROWS.map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 2px",
                borderBottom: i < SETTINGS_ROWS.length - 1 ? "1.4px dashed oklch(0.85 0.015 70)" : undefined,
              }}
            >
              <span style={{ fontSize: 16 }}>{row.icon}</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "oklch(0.28 0.02 55)", flex: 1 }}>{row.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 4L17 12L9 20" stroke="oklch(0.65 0.02 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
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
