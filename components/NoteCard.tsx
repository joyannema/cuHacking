// import type { CSSProperties } from "react"; — only needed by the disabled hover-lift styling
import { CATEGORY_LABELS, CATEGORY_PALETTE, CLIP_PRESETS, colorIdxForCategory, generateTitle, seededRand } from "@/lib/data";
import type { Note } from "@/lib/types";

export default function NoteCard({
  note,
  onClick,
  variant = "grid",
}: {
  note: Note;
  onClick: () => void;
  variant?: "grid" | "stream";
}) {
  const colorIdx = colorIdxForCategory(note.category);
  const pal = CATEGORY_PALETTE[colorIdx % CATEGORY_PALETTE.length];
  const rot = seededRand(note.id * 3 + 1, -3.2, 3.2);
  const mb = seededRand(note.id * 7 + 2, 14, 28);
  const tapeLeft = seededRand(note.id * 5 + 3, 14, 60);
  const tapeRot = seededRand(note.id * 11 + 4, -8, 8);
  const clip = CLIP_PRESETS[note.id % CLIP_PRESETS.length];
  const hue = 80 + colorIdx * 40;
  const title = note.title || generateTitle(note.text, note._titleSeed);

  return (
    <div
      onClick={onClick}
      // className="hover-lift" — disabled for now, was causing lag
      style={{
        position: "relative",
        breakInside: "avoid",
        display: "inline-block",
        width: variant === "stream" ? "76%" : "100%",
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
      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "nowrap", overflow: "hidden", marginBottom: 6 }}>
        <span
          style={{
            display: "inline-block",
            flexShrink: 0,
            fontFamily: "'IBM Plex Mono',monospace",
            fontWeight: 500,
            fontSize: 9,
            letterSpacing: "0.02em",
            color: pal.fg,
            background: pal.bg,
            borderRadius: 20,
            padding: "3px 8px",
          }}
        >
          {CATEGORY_LABELS[note.category] || note.category}
        </span>
        {note.tags.map((tag) => (
          <span
            key={tag}
            style={{
              flexShrink: 0,
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 8.5,
              color: "oklch(0.45 0.03 60)",
              background: "oklch(0.95 0.01 75 / 0.7)",
              borderRadius: 4,
              padding: "2px 6px",
              whiteSpace: "nowrap",
            }}
          >
            #{tag}
          </span>
        ))}
        <span
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          {note.classifying && !note.organizing && (
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                border: "1.4px solid oklch(0.85 0.02 70)",
                borderTopColor: "oklch(0.55 0.1 45)",
                animation: "spin 0.7s linear infinite",
              }}
            />
          )}
          <span
            style={{
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 8.5,
              color: "oklch(0.58 0.02 60)",
              whiteSpace: "nowrap",
            }}
          >
            {note.time}
          </span>
        </span>
      </div>
      <p
        style={{
          margin: "0 0 3px",
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 13.5,
          fontWeight: 700,
          color: "oklch(0.22 0.02 55)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "'Space Grotesk',sans-serif",
          fontSize: 12.5,
          lineHeight: 1.35,
          color: "oklch(0.4 0.02 55)",
          fontWeight: 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {note.text}
      </p>
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
