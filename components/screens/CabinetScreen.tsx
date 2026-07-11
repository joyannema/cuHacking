import PaperDecor from "../PaperDecor";
import FolderCard from "../FolderCard";
import NoteCard from "../NoteCard";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";
import type { CategoryMeta, Note } from "@/lib/types";

export default function CabinetScreen({
  categories,
  noteResults,
  searchQuery,
  onSearchChange,
  onOpenCategory,
  onOpenNote,
  onGoStream,
}: {
  categories: CategoryMeta[];
  noteResults: Note[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onOpenCategory: (slug: string) => void;
  onOpenNote: (id: number) => void;
  onGoStream: () => void;
}) {
  const q = searchQuery.trim();
  const noResults = q.length > 0 && categories.length === 0 && noteResults.length === 0;

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
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: "oklch(0.24 0.02 55)", letterSpacing: "-0.02em" }}>
            filing cabinet
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>everything, sorted for you</span>
        </div>
      </div>

      <svg style={{ position: "absolute", top: 70, right: 24, opacity: 0.4, zIndex: 1 }} width="18" height="18" viewBox="0 0 18 18">
        <path d="M9 0 L11 7 L18 9 L11 11 L9 18 L7 11 L0 9 L7 7 Z" fill="oklch(0.6 0.1 250)" />
      </svg>

      <div style={{ padding: "8px 20px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "oklch(0.98 0.01 80)",
            border: "1.6px dashed oklch(0.7 0.03 60)",
            borderRadius: 14,
            padding: "11px 14px",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="oklch(0.45 0.03 60)" strokeWidth="2" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="oklch(0.45 0.03 60)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="search your memory..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 12.5,
              color: "oklch(0.3 0.02 55)",
              flex: 1,
            }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px 18px 50px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {categories.map((cat) => (
            <FolderCard key={cat.slug} category={cat} mini={false} onClick={() => onOpenCategory(cat.slug)} />
          ))}
        </div>

        {noteResults.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "20px 0 10px" }}>
              <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.08em", color: "oklch(0.55 0.02 60)", textTransform: "uppercase" }}>
                journal entries
              </span>
              <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
            </div>
            <div style={{ columnCount: 2, columnGap: 12 }}>
              {noteResults.map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => onOpenNote(note.id)} />
              ))}
            </div>
          </>
        )}

        {noResults && (
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.55 0.02 60)", textAlign: "center", marginTop: 40 }}>
            nothing found for that yet.
          </p>
        )}

        {q.length === 0 && categories.length === 0 && (
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.55 0.02 60)", textAlign: "center", marginTop: 40 }}>
            nothing filed under that yet.
          </p>
        )}
      </div>
    </div>
  );
}
