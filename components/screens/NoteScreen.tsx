import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE, CATEGORY_PALETTE, CLIP_PRESETS, generateTitle } from "@/lib/data";
import type { Note } from "@/lib/types";

export default function NoteScreen({
  note,
  categoryLabel,
  onClose,
  onDelete,
  onRegenerateTitle,
  onTitleBlur,
  onBodyBlur,
  onTogglePhoto,
  onVoiceAppend,
}: {
  note: Note;
  categoryLabel: string;
  onClose: () => void;
  onDelete: () => void;
  onRegenerateTitle: () => void;
  onTitleBlur: (text: string) => void;
  onBodyBlur: (text: string) => void;
  onTogglePhoto: () => void;
  onVoiceAppend: () => void;
}) {
  const pal = CATEGORY_PALETTE[note.colorIdx % CATEGORY_PALETTE.length];
  const clip = CLIP_PRESETS[note.id % CLIP_PRESETS.length];
  const hue = 80 + note.colorIdx * 40;
  const title = note.title || generateTitle(note.text, note._titleSeed);

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(28px, env(safe-area-inset-top)) 40px 10px" }}>
        <button
          onClick={onClose}
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
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>{note.time}</span>
        <div style={{ width: 36 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 44px 40px", WebkitOverflowScrolling: "touch" }}>
        <div
          style={{
            position: "relative",
            background: "oklch(0.985 0.008 80)",
            clipPath: clip,
            padding: "22px 20px 20px",
            boxShadow: "0 6px 18px rgba(90,60,30,0.12)",
          }}
        >
          <div style={{ position: "absolute", inset: 7, border: "1.4px dashed oklch(0.82 0.02 70)", pointerEvents: "none" }} />
          <div
            style={{
              position: "absolute",
              top: -9,
              left: 30,
              width: 50,
              height: 16,
              background: `repeating-linear-gradient(45deg, oklch(0.88 0.05 ${hue} / 0.85) 0 4px, oklch(0.94 0.03 ${hue} / 0.7) 4px 8px)`,
              borderRadius: 2,
              transform: "rotate(-3deg)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            }}
          />
          <span
            style={{
              display: "inline-block",
              fontFamily: "'IBM Plex Mono',monospace",
              fontWeight: 500,
              fontSize: 11,
              letterSpacing: "0.02em",
              color: pal.fg,
              background: pal.bg,
              borderRadius: 20,
              padding: "4px 11px",
            }}
          >
            {categoryLabel}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
            <div
              key={`title-${note.id}-${title}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onTitleBlur(e.currentTarget.textContent || "")}
              style={{
                flex: 1,
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 19,
                fontWeight: 700,
                color: "oklch(0.2 0.02 55)",
                outline: "none",
              }}
            >
              {title}
            </div>
            <button
              onClick={onRegenerateTitle}
              title="regenerate title"
              style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: "50%",
                border: "1.4px solid oklch(0.85 0.015 70)",
                background: "oklch(0.97 0.01 80)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M20 12a8 8 0 1 1-2.6-5.9" stroke="oklch(0.45 0.03 60)" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 4v5h-5" stroke="oklch(0.45 0.03 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div
            key={`body-${note.id}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onBodyBlur(e.currentTarget.textContent || "")}
            style={{
              margin: "10px 0 18px",
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 16,
              lineHeight: 1.6,
              color: "oklch(0.26 0.02 55)",
              fontWeight: 500,
              whiteSpace: "pre-wrap",
              outline: "none",
              minHeight: 60,
            }}
          >
            {note.text}
          </div>

          {note.photo && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "oklch(0.94 0.02 250)",
                border: "1px dashed oklch(0.7 0.05 250)",
                borderRadius: 9,
                padding: "7px 10px",
                width: "fit-content",
                marginBottom: 14,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="2" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
                <circle cx="12" cy="13" r="3.2" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
                <path d="M8 6l1.5-2h5L16 6" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
              </svg>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.35 0.06 250)" }}>photo attached</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {note.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'IBM Plex Mono',monospace",
                  fontSize: 11,
                  color: "oklch(0.45 0.03 60)",
                  background: "oklch(0.95 0.01 75 / 0.7)",
                  borderRadius: 5,
                  padding: "3px 8px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
            <button
              onClick={onTogglePhoto}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: `1.5px solid ${note.photo ? "oklch(0.6 0.1 250)" : "oklch(0.8 0.02 65)"}`,
                background: note.photo ? "oklch(0.92 0.03 250)" : "oklch(0.98 0.01 80)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
                <circle cx="12" cy="13" r="3.6" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
                <path d="M8 6l1.5-2h5L16 6" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
              </svg>
            </button>
            <button
              onClick={onVoiceAppend}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(155deg, oklch(0.74 0.15 45), oklch(0.66 0.16 30))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="oklch(0.99 0.005 80)" />
                <path d="M5 11a7 7 0 0 0 14 0" stroke="oklch(0.99 0.005 80)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="oklch(0.99 0.005 80)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>add a photo or speak more</span>
          </div>
        </div>

        <button
          onClick={onDelete}
          style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: 24,
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "oklch(0.5 0.14 25)",
            background: "oklch(0.95 0.03 25)",
            border: "1.5px dashed oklch(0.65 0.1 25)",
            borderRadius: 16,
            padding: "12px 0",
            cursor: "pointer",
          }}
        >
          delete note
        </button>
      </div>
    </div>
  );
}
