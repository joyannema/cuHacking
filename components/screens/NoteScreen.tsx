import PaperDecor from "../PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE, CATEGORY_PALETTE, CLIP_PRESETS } from "@/lib/data";
import type { Note } from "@/lib/types";

export default function NoteScreen({
  note,
  categoryLabel,
  onClose,
  onDelete,
}: {
  note: Note;
  categoryLabel: string;
  onClose: () => void;
  onDelete: () => void;
}) {
  const pal = CATEGORY_PALETTE[note.colorIdx % CATEGORY_PALETTE.length];
  const clip = CLIP_PRESETS[note.id % CLIP_PRESETS.length];
  const hue = 80 + note.colorIdx * 40;

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(28px, env(safe-area-inset-top)) 20px 10px" }}>
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
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 22px 40px", WebkitOverflowScrolling: "touch" }}>
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
          <p
            style={{
              margin: "16px 0 18px",
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 19,
              lineHeight: 1.65,
              color: "oklch(0.22 0.02 55)",
              fontWeight: 500,
              whiteSpace: "pre-wrap",
            }}
          >
            {note.text}
          </p>
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
