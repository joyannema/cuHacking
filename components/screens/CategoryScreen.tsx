import PaperDecor from "../PaperDecor";
import NoteCard from "../NoteCard";
import { PAPER_BG, PAPER_BG_SIZE, CATEGORY_PALETTE } from "@/lib/data";
import type { CategoryMeta, Note } from "@/lib/types";

export default function CategoryScreen({
  category,
  notes,
  onOpenNote,
  onGoStream,
}: {
  category: CategoryMeta;
  notes: Note[];
  onOpenNote: (id: number) => void;
  onGoStream: () => void;
}) {
  const pal = CATEGORY_PALETTE[category.colorIdx % CATEGORY_PALETTE.length];

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
          onClick={onGoStream}
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
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              fontFamily: "'IBM Plex Mono',monospace",
              fontWeight: 500,
              fontSize: 12,
              color: pal.fg,
              background: pal.bg,
              borderRadius: 20,
              padding: "5px 12px",
            }}
          >
            {category.label}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)", marginTop: 5 }}>
            {category.count} notes filed here
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 14px 40px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ columnCount: 2, columnGap: 12 }}>
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onClick={() => onOpenNote(note.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
