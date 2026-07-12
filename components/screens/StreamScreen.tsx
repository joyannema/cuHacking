"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import PaperDecor from "../PaperDecor";
import NoteCard from "../NoteCard";
import FolderCard from "../FolderCard";
import { PAPER_BG, PAPER_BG_SIZE, seededRand } from "@/lib/data";
import type { CategoryMeta, Note } from "@/lib/types";

const STREAM_ALIGNS: Array<"flex-start" | "flex-end" | "center"> = ["flex-start", "flex-end", "center"];

export default function StreamScreen({
  notes,
  topFolders,
  showViewAll,
  onOpenNote,
  onOpenCategory,
  onGoCabinet,
}: {
  notes: Note[];
  topFolders: CategoryMeta[];
  showViewAll: boolean;
  onOpenNote: (id: number) => void;
  onOpenCategory: (slug: string) => void;
  onGoCabinet: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJumpTop, setShowJumpTop] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const show = el.scrollTop > 260;
    setShowJumpTop((prev) => (prev === show ? prev : show));
  };

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          position: "relative",
          height: "100%",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 130,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "max(28px, env(safe-area-inset-top)) 40px 12px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Image
              src="/logo_noslogan.png"
              alt="synapse"
              width={300}
              height={72}
              style={{ width: 300, height: "auto", marginBottom: 12 }}
            />
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.5 0.03 60)" }}>
              hey — what&apos;s on your mind?
            </span>
          </div>
          <button
            onClick={onGoCabinet}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "oklch(0.98 0.012 80)",
              border: "1.5px solid oklch(0.86 0.02 70)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="oklch(0.4 0.03 60)" strokeWidth="2" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" stroke="oklch(0.4 0.03 60)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <svg style={{ position: "absolute", top: 68, right: 70, opacity: 0.5, zIndex: 1 }} width="20" height="20" viewBox="0 0 20 20">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="oklch(0.72 0.13 55)" />
        </svg>
        <svg style={{ position: "absolute", top: 150, left: 22, opacity: 0.4, zIndex: 1 }} width="15" height="15" viewBox="0 0 15 15">
          <circle cx="7.5" cy="7.5" r="6.2" stroke="oklch(0.5 0.1 300)" strokeWidth="1.4" fill="none" strokeDasharray="1.6 3" />
        </svg>
        <svg style={{ position: "absolute", top: 9, left: 128, opacity: 0.4, zIndex: 1 }} width="13" height="13" viewBox="0 0 20 20">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="oklch(0.72 0.13 55)" />
        </svg>
        <svg style={{ position: "absolute", top: 110, right: 24, opacity: 0.45, zIndex: 1 }} width="30" height="14" viewBox="0 0 34 16">
          <path d="M1 8 Q 8 0, 17 8 T 33 8" stroke="oklch(0.6 0.1 45)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 5" />
        </svg>
        <svg style={{ position: "absolute", top: 116, left: 232, opacity: 0.35, zIndex: 1 }} width="10" height="10" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="6.5" stroke="oklch(0.5 0.1 300)" strokeWidth="1.6" fill="none" strokeDasharray="2 3.4" />
        </svg>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "10px 40px 6px" }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13.5, color: "oklch(0.35 0.02 55)", textTransform: "lowercase" }}>
            folders
          </span>
          {showViewAll && (
            <button
              onClick={onGoCabinet}
              style={{
                fontFamily: "'IBM Plex Mono',monospace",
                fontSize: 11,
                color: "oklch(0.5 0.1 45)",
                background: "none",
                border: "none",
                borderBottom: "1.4px dashed oklch(0.6 0.1 45)",
                padding: "0 0 1px",
                cursor: "pointer",
              }}
            >
              view all →
            </button>
          )}
        </div>

        <div style={{ padding: "2px 32px 4px", display: "flex", flexWrap: "wrap", gap: 11 }}>
          {topFolders.map((cat) => (
            <FolderCard key={cat.slug} category={cat} mini onClick={() => onOpenCategory(cat.slug)} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "16px 20px 4px" }}>
          <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.08em", color: "oklch(0.55 0.02 60)", textTransform: "uppercase" }}>
            the stream
          </span>
          <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
        </div>

        <div style={{ padding: "36px 0 20px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.map((note, i) => {
              const align = STREAM_ALIGNS[i % 3];
              const nudge = seededRand(note.id * 19 + 12, -4, 4);
              return (
                <div
                  key={note.id}
                  style={{
                    display: "flex",
                    justifyContent: align,
                    marginBottom: 6,
                    transform: `translateX(${nudge}px)`,
                    marginLeft: align === "flex-start" ? "6%" : undefined,
                    marginRight: align === "flex-end" ? "6%" : undefined,
                  }}
                >
                  <NoteCard note={note} variant="stream" onClick={() => onOpenNote(note.id)} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showJumpTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: "absolute",
            right: 20,
            bottom: 150,
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "oklch(0.3 0.02 55)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 5,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
            <path d="M12 19V5M5 12l7-7 7 7" stroke="oklch(0.99 0.005 80)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
