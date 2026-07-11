import type { CSSProperties } from "react";
import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";
import type { Profile } from "@/lib/types";

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: 14,
  color: "oklch(0.26 0.02 55)",
  background: "oklch(0.98 0.01 80)",
  border: "1.5px solid oklch(0.85 0.015 70)",
  borderRadius: 12,
  padding: "11px 13px",
  outline: "none",
};

export default function AccountScreen({
  draftProfile,
  accountSaved,
  onNameChange,
  onUsernameChange,
  onEmailChange,
  onBioChange,
  onSave,
  onGoSettings,
}: {
  draftProfile: Profile;
  accountSaved: boolean;
  onNameChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSave: () => void;
  onGoSettings: () => void;
}) {
  const initial = (draftProfile.name[0] || "A").toUpperCase();

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

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "max(28px, env(safe-area-inset-top)) 20px 10px" }}>
        <button
          onClick={onGoSettings}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "none",
            background: "oklch(0.9 0.015 70)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M15 4L7 12L15 20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: "oklch(0.24 0.02 55)", letterSpacing: "-0.02em" }}>
          edit profile
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              background: "linear-gradient(155deg, oklch(0.74 0.15 45), oklch(0.66 0.16 30))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 700,
              color: "oklch(0.99 0.005 80)",
              fontSize: 24,
            }}
          >
            {initial}
          </div>
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10.5,
              color: "oklch(0.5 0.1 45)",
              marginTop: 8,
              borderBottom: "1.4px dashed oklch(0.6 0.1 45)",
            }}
          >
            change photo
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.05em", color: "oklch(0.5 0.03 60)", textTransform: "uppercase" }}>
              name
            </span>
            <input value={draftProfile.name} onChange={(e) => onNameChange(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.05em", color: "oklch(0.5 0.03 60)", textTransform: "uppercase" }}>
              username
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 2, background: "oklch(0.98 0.01 80)", border: "1.5px solid oklch(0.85 0.015 70)", borderRadius: 12, padding: "11px 13px" }}>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: "oklch(0.55 0.02 60)" }}>@</span>
              <input
                value={draftProfile.username}
                onChange={(e) => onUsernameChange(e.target.value.replace(/\s/g, ""))}
                style={{ flex: 1, fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, color: "oklch(0.26 0.02 55)", background: "transparent", border: "none", outline: "none" }}
              />
            </div>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.05em", color: "oklch(0.5 0.03 60)", textTransform: "uppercase" }}>
              email
            </span>
            <input value={draftProfile.email} onChange={(e) => onEmailChange(e.target.value)} style={inputStyle} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: "0.05em", color: "oklch(0.5 0.03 60)", textTransform: "uppercase" }}>
              bio
            </span>
            <textarea
              value={draftProfile.bio}
              onChange={(e) => onBioChange(e.target.value)}
              style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
            />
          </label>
        </div>

        {accountSaved && (
          <p style={{ fontFamily: "'Caveat',cursive", fontSize: 16, color: "oklch(0.45 0.12 150)", textAlign: "center", margin: "14px 0 0" }}>saved ✓</p>
        )}

        <button
          onClick={onSave}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 22,
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "oklch(0.99 0.005 80)",
            background: "oklch(0.3 0.02 55)",
            border: "none",
            borderRadius: 16,
            padding: "14px 0",
            cursor: "pointer",
          }}
        >
          save changes
        </button>
      </div>
    </div>
  );
}
