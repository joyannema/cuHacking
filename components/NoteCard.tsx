import { CATEGORY_LABELS, CATEGORY_PALETTE, CLIP_PRESETS, seededRand } from "@/lib/data";
import type { Note } from "@/lib/types";

export default function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  const pal = CATEGORY_PALETTE[note.colorIdx % CATEGORY_PALETTE.length];
  const rot = seededRand(note.id * 3 + 1, -3.2, 3.2);
  const mb = seededRand(note.id * 7 + 2, 14, 28);
  const tapeLeft = seededRand(note.id * 5 + 3, 14, 60);
  const tapeRot = seededRand(note.id * 11 + 4, -8, 8);
  const clip = CLIP_PRESETS[note.id % CLIP_PRESETS.length];
  const hue = 80 + note.colorIdx * 40;

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        breakInside: "avoid",
        display: "inline-block",
        width: "100%",
        boxSizing: "border-box",
        marginBottom: mb,
        background: "oklch(0.985 0.008 80)",
        clipPath: clip,
        padding: "14px 14px 12px",
        boxShadow: "0 4px 11px rgba(90,60,30,0.1)",
        transform: `rotate(${rot}deg)`,
        animation: "slideUpFade 0.4s ease-out",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 6,
          border: "1.4px dashed oklch(0.82 0.02 70)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -8,
          left: `${tapeLeft}%`,
          width: 38,
          height: 14,
          background: `repeating-linear-gradient(45deg, oklch(0.88 0.05 ${hue} / 0.85) 0 4px, oklch(0.94 0.03 ${hue} / 0.7) 4px 8px)`,
          borderRadius: 2,
          transform: `rotate(${tapeRot}deg)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      />
      <span
        style={{
          display: "inline-block",
          fontFamily: "'IBM Plex Mono',monospace",
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: "0.02em",
          color: pal.fg,
          background: pal.bg,
          borderRadius: 20,
          padding: "3.5px 9px",
        }}
      >
        {CATEGORY_LABELS[note.category] || note.category}
      </span>
      <p
        style={{
          margin: "9px 0 8px",
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 14,
          lineHeight: 1.4,
          color: "oklch(0.24 0.02 55)",
          fontWeight: 500,
        }}
      >
        {note.text}
      </p>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
        {note.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 9.5,
              color: "oklch(0.45 0.03 60)",
              background: "oklch(0.95 0.01 75 / 0.7)",
              borderRadius: 4,
              padding: "2px 6px",
            }}
          >
            #{tag}
          </span>
        ))}
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "oklch(0.58 0.02 60)" }}>
        {note.time}
      </span>
      {note.organizing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "oklch(0.98 0.01 80 / 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: "oklch(0.4 0.03 60)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "oklch(0.68 0.14 45)",
              animation: "blobPulse 0.9s ease-in-out infinite",
            }}
          />
          organizing…
        </div>
      )}
    </div>
  );
}
