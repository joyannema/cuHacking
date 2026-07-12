"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import {
  CATEGORY_LABELS,
  CATEGORY_PALETTE,
  colorIdxForCategory,
  JOURNAL_CANVAS_H,
  JOURNAL_CANVAS_W,
  JOURNAL_SLIVER_W,
  PAPER_BG,
  PAPER_BG_SIZE,
  STICKER_DEFS,
} from "@/lib/data";
import type { JournalElement, JournalPage, Note } from "@/lib/types";

const BLANK_PHOTO = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

export default function JournalScreen({
  notes,
  journalTitle,
  onJournalTitleBlur,
  pageIndex,
  pages,
  selectedId,
  entriesOpen,
  dragGhost,
  onOpenBook,
  onGoCover,
  onPrevPage,
  onNextPage,
  onAddPage,
  onCloseSheets,
  onPickEntry,
  onElementPointerDown,
  onViewElement,
  onDeleteElement,
  onTextBlur,
  onTrayStickerDown,
  onTrayTextDown,
  onTrayPhotoDown,
  onTrayEntryDown,
  onAddPhotoFile,
  setCanvasRef,
  setFileInputRef,
}: {
  notes: Note[];
  journalTitle: string;
  onJournalTitleBlur: (text: string) => void;
  pageIndex: number;
  pages: JournalPage[];
  selectedId: number | null;
  entriesOpen: boolean;
  dragGhost: { x: number; y: number; kind: string; stickerKind?: string } | null;
  onOpenBook: () => void;
  onGoCover: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onAddPage: () => void;
  onCloseSheets: () => void;
  onPickEntry: (note: Note) => void;
  onElementPointerDown: (pageIdx: number, elId: number, mode: "move" | "resize" | "rotate", e: ReactPointerEvent) => void;
  onViewElement: (entryId: number) => void;
  onDeleteElement: (id: number) => void;
  onTextBlur: (id: number, text: string) => void;
  onTrayStickerDown: (kind: string, e: ReactPointerEvent) => void;
  onTrayTextDown: (e: ReactPointerEvent) => void;
  onTrayPhotoDown: (e: ReactPointerEvent) => void;
  onTrayEntryDown: (e: ReactPointerEvent) => void;
  onAddPhotoFile: (file: File) => void;
  setCanvasRef: (el: HTMLDivElement | null) => void;
  setFileInputRef: (el: HTMLInputElement | null) => void;
}) {
  const atCover = pageIndex < 0;
  const pageIdx = Math.max(pageIndex, 0);
  const onRightPage = pageIdx % 2 === 1;
  const neighborIdx = onRightPage ? pageIdx - 1 : pageIdx + 1;
  const hasNeighbor = neighborIdx >= 0 && neighborIdx < pages.length;

  const buildElements = (idx: number) => {
    const page = pages[idx] || { elements: [] };
    return page.elements.map((el) => {
      const noteSrc = el.type === "note" ? notes.find((n) => n.id === el.entryId) : null;
      const noteColorIdx = noteSrc ? colorIdxForCategory(noteSrc.category) : 0;
      const notePal = noteSrc ? CATEGORY_PALETTE[noteColorIdx % CATEGORY_PALETTE.length] : null;
      const hue = el.type === "note" && noteSrc ? 80 + noteColorIdx * 40 : 260;
      return { el, noteSrc, notePal, hue };
    });
  };

  const renderElement = (
    entry: { el: JournalElement; noteSrc: Note | null | undefined; notePal: { bg: string; fg: string } | null; hue: number },
    idx: number,
    interactive: boolean
  ) => {
    const { el, noteSrc, notePal, hue } = entry;
    const selected = interactive && selectedId === el.id;

    return (
      <div
        key={el.id}
        onPointerDown={interactive ? (e) => onElementPointerDown(pageIdx, el.id, "move", e) : undefined}
        style={{
          position: "absolute",
          left: el.x,
          top: el.y,
          width: el.w,
          height: el.h,
          transform: `rotate(${el.rot}deg)`,
          cursor: interactive ? "grab" : "default",
          touchAction: "none",
          outline: selected ? "1.5px dashed oklch(0.6 0.1 45)" : undefined,
          outlineOffset: selected ? 4 : undefined,
          opacity: interactive ? 1 : 0.85,
          pointerEvents: interactive ? "auto" : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -8,
            left: "30%",
            width: 40,
            height: 14,
            background: `repeating-linear-gradient(45deg, oklch(0.88 0.05 ${hue} / 0.85) 0 4px, oklch(0.94 0.03 ${hue} / 0.7) 4px 8px)`,
            borderRadius: 2,
            transform: "rotate(-3deg)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            display: el.type === "text" ? "none" : "block",
          }}
        />

        {el.type === "note" && (
          <div style={{ width: "100%", height: "100%", boxSizing: "border-box", background: "oklch(0.985 0.008 80)", borderRadius: 2, boxShadow: "0 3px 9px rgba(90,60,30,0.1)", padding: "14px 10px 8px", overflow: "hidden" }}>
            {notePal && (
              <span style={{ display: "inline-block", fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 8.5, color: notePal.fg, background: notePal.bg, borderRadius: 20, padding: "2px 7px" }}>
                {noteSrc ? CATEGORY_LABELS[noteSrc.category] || noteSrc.category : ""}
              </span>
            )}
            <p style={{ margin: "6px 0 0", fontFamily: "'Space Grotesk',sans-serif", fontSize: 11.5, lineHeight: 1.3, color: "oklch(0.26 0.02 55)", fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {noteSrc ? noteSrc.text : "(deleted note)"}
            </p>
          </div>
        )}

        {el.type === "photo" && (
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 2,
              boxShadow: "0 3px 9px rgba(90,60,30,0.12)",
              backgroundImage: `url(${el.photoSrc || BLANK_PHOTO})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {el.type === "text" && (
          <div
            key={`journal-text-${el.id}`}
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={interactive ? (e) => onTextBlur(el.id, e.currentTarget.textContent || "") : undefined}
            style={{
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              fontFamily: "'Caveat',cursive",
              fontSize: 19,
              color: "oklch(0.35 0.05 45)",
              background: "transparent",
              outline: "none",
              overflow: "auto",
              padding: 4,
            }}
          >
            {el.text}
          </div>
        )}

        {el.type === "sticker" && (
          <div
            style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
            dangerouslySetInnerHTML={(STICKER_DEFS.find((sd) => sd.kind === el.stickerKind) || STICKER_DEFS[0]).svg}
          />
        )}

        {selected && (
          <>
            {el.type === "note" && el.entryId != null && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewElement(el.entryId as number);
                }}
                style={{ position: "absolute", top: -14, left: -14, width: 26, height: 26, borderRadius: "50%", background: "oklch(0.4 0.1 250)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" stroke="oklch(0.99 0.005 80)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="oklch(0.99 0.005 80)" strokeWidth="2" />
                </svg>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(el.id);
              }}
              style={{ position: "absolute", top: -14, right: -14, width: 26, height: 26, borderRadius: "50%", background: "oklch(0.55 0.14 25)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24">
                <line x1="4" y1="4" x2="20" y2="20" stroke="oklch(0.99 0.005 80)" strokeWidth="2.6" strokeLinecap="round" />
                <line x1="20" y1="4" x2="4" y2="20" stroke="oklch(0.99 0.005 80)" strokeWidth="2.6" strokeLinecap="round" />
              </svg>
            </button>
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onElementPointerDown(pageIdx, el.id, "rotate", e);
              }}
              style={{ position: "absolute", top: -26, left: "50%", marginLeft: -6, width: 12, height: 12, borderRadius: "50%", background: "oklch(0.5 0.1 45)", cursor: "grab", zIndex: 2 }}
            />
            <div
              onPointerDown={(e) => {
                e.stopPropagation();
                onElementPointerDown(pageIdx, el.id, "resize", e);
              }}
              style={{ position: "absolute", bottom: -6, right: -6, width: 14, height: 14, borderRadius: "50%", background: "oklch(0.5 0.02 60)", cursor: "nwse-resize", zIndex: 2 }}
            />
          </>
        )}
      </div>
    );
  };

  const toolBtnStyle = { width: 42, height: 42, borderRadius: "50%", border: "1.4px solid oklch(0.82 0.015 70)", background: "oklch(0.98 0.01 80)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "grab" } as const;
  const navBtnStyle = { width: 34, height: 34, borderRadius: "50%", border: "1.4px solid oklch(0.82 0.015 70)", background: "oklch(0.98 0.01 80)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" } as const;

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        boxSizing: "border-box",
        paddingBottom: 126,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "oklch(0.93 0.015 75)",
        backgroundImage: PAPER_BG,
        backgroundSize: PAPER_BG_SIZE,
      }}
    >
      {atCover ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 80px" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              background: "oklch(0.97 0.02 85)",
              borderRadius: 4,
              padding: "46px 26px",
              boxShadow: "2px 4px 14px rgba(90,60,30,0.16)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transform: "rotate(-0.6deg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -10,
                left: "38%",
                width: 70,
                height: 18,
                background: "repeating-linear-gradient(45deg, oklch(0.88 0.05 260 / 0.85) 0 4px, oklch(0.94 0.03 260 / 0.7) 4px 8px)",
                borderRadius: 2,
                transform: "rotate(-3deg)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
              }}
            />
            <svg style={{ position: "absolute", top: 22, right: 22, opacity: 0.55 }} width="20" height="20" viewBox="0 0 20 20">
              <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="oklch(0.6 0.12 45)" />
            </svg>
            <svg style={{ position: "absolute", bottom: 26, left: 24, opacity: 0.45 }} width="26" height="26" viewBox="0 0 26 26">
              <path d="M13 2 C13 8 20 6 20 13 C20 20 13 18 13 24 C13 18 6 20 6 13 C6 6 13 8 13 2 Z" stroke="oklch(0.5 0.1 300)" strokeWidth="1.4" fill="none" strokeDasharray="1.5 3" />
            </svg>
            <div
              key={`journal-title-${journalTitle}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onJournalTitleBlur(e.currentTarget.textContent || "")}
              style={{ fontFamily: "'Caveat',cursive", fontWeight: 600, fontSize: 34, color: "oklch(0.3 0.05 45)", textAlign: "center", outline: "none" }}
            >
              {journalTitle}
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)", textAlign: "center", marginTop: 8 }}>
              a scrapbook of your notes
            </span>
          </div>
          <button
            onClick={onOpenBook}
            style={{ marginTop: 26, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 14, color: "oklch(0.99 0.005 80)", background: "oklch(0.3 0.02 55)", border: "none", borderRadius: 24, padding: "12px 28px", cursor: "pointer" }}
          >
            open journal
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "66px 40px 8px" }}>
            <button
              onClick={onGoCover}
              style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "oklch(0.9 0.015 70)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M15 4L7 12L15 20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>
              page {pageIdx + 1} of {pages.length}
            </span>
            <div style={{ width: 36 }} />
          </div>

          <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "4px 0" }}>
            <div
              ref={setCanvasRef}
              style={{
                position: "relative",
                width: JOURNAL_CANVAS_W,
                height: JOURNAL_CANVAS_H,
                backgroundColor: "oklch(0.985 0.01 82)",
                backgroundImage: "radial-gradient(rgba(90,70,50,0.22) 1px, transparent 1.4px)",
                backgroundSize: "15px 15px",
                borderRadius: 3,
                boxShadow: "0 3px 14px rgba(90,60,30,0.14)",
                overflow: "visible",
                flexShrink: 0,
                zIndex: 2,
              }}
            >
              {buildElements(pageIdx).map((entry, i) => renderElement(entry, i, true))}
            </div>

            <div
              style={{
                position: "absolute",
                top: "50%",
                ...(onRightPage
                  ? { right: `calc(50% + ${JOURNAL_CANVAS_W / 2}px)` }
                  : { left: `calc(50% + ${JOURNAL_CANVAS_W / 2}px)` }),
                transform: "translateY(-50%)",
                width: 2,
                height: JOURNAL_CANVAS_H,
                background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.22), transparent)",
              }}
            />

            {hasNeighbor && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  ...(onRightPage
                    ? { right: `calc(50% + ${JOURNAL_CANVAS_W / 2 + 2}px)` }
                    : { left: `calc(50% + ${JOURNAL_CANVAS_W / 2 + 2}px)` }),
                  transform: "translateY(-50%)",
                  width: JOURNAL_SLIVER_W,
                  height: JOURNAL_CANVAS_H,
                  overflow: "hidden",
                  background: "oklch(0.985 0.01 82)",
                  boxShadow: onRightPage ? "-2px 0 4px rgba(90,60,30,0.1)" : "2px 0 4px rgba(90,60,30,0.1)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: JOURNAL_CANVAS_W,
                    height: JOURNAL_CANVAS_H,
                    opacity: 0.5,
                    pointerEvents: "none",
                    backgroundColor: "oklch(0.985 0.01 82)",
                    backgroundImage: "radial-gradient(rgba(90,70,50,0.22) 1px, transparent 1.4px)",
                    backgroundSize: "15px 15px",
                    ...(onRightPage ? { right: 0 } : { left: 0 }),
                  }}
                >
                  {buildElements(neighborIdx).map((entry, i) => renderElement(entry, i, false))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "8px 40px 6px" }}>
            <button onClick={onPrevPage} style={navBtnStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M15 4L7 12L15 20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={onAddPage} style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.1 45)", background: "none", border: "none", borderBottom: "1.4px dashed oklch(0.6 0.1 45)", cursor: "pointer" }}>
              + add page
            </button>
            <button onClick={onNextPage} style={navBtnStyle}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M9 4L17 12L9 20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "2px 32px 12px" }}>
            {STICKER_DEFS.map((sd) => (
              <div key={sd.kind} style={toolBtnStyle} onPointerDown={(e) => onTrayStickerDown(sd.kind, e)} dangerouslySetInnerHTML={sd.svg} />
            ))}
            <div style={toolBtnStyle} onPointerDown={onTrayTextDown}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 6h14M12 6v13" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div style={toolBtnStyle} onPointerDown={onTrayPhotoDown}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="oklch(0.35 0.02 55)" strokeWidth="1.7" />
                <circle cx="12" cy="13" r="3.4" stroke="oklch(0.35 0.02 55)" strokeWidth="1.7" />
              </svg>
            </div>
            <div style={toolBtnStyle} onPointerDown={onTrayEntryDown}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="2" stroke="oklch(0.35 0.02 55)" strokeWidth="1.7" />
                <line x1="8" y1="8" x2="16" y2="8" stroke="oklch(0.35 0.02 55)" strokeWidth="1.4" />
                <line x1="8" y1="12" x2="16" y2="12" stroke="oklch(0.35 0.02 55)" strokeWidth="1.4" />
              </svg>
            </div>
            <input type="file" accept="image/*" ref={setFileInputRef} onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              if (file) onAddPhotoFile(file);
              e.target.value = "";
            }} style={{ display: "none" }} />
          </div>

          <p style={{ textAlign: "center", fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: "oklch(0.55 0.02 60)", margin: "0 0 4px" }}>
            drag an item onto the page
          </p>

          {dragGhost && (
            <div
              style={{ position: "fixed", left: dragGhost.x - 20, top: dragGhost.y - 20, width: 40, height: 40, pointerEvents: "none", zIndex: 999, opacity: 0.85, display: "flex", alignItems: "center", justifyContent: "center" }}
              dangerouslySetInnerHTML={
                dragGhost.kind === "sticker"
                  ? (STICKER_DEFS.find((sd) => sd.kind === dragGhost.stickerKind) || STICKER_DEFS[0]).svg
                  : { __html: '<div style="width:36px;height:36px;border-radius:8px;background:oklch(0.68 0.14 45 / 0.5);"></div>' }
              }
            />
          )}

          {entriesOpen && (
            <div
              onClick={onCloseSheets}
              style={{ position: "absolute", inset: 0, background: "rgba(40,30,20,0.28)", display: "flex", alignItems: "flex-end", zIndex: 20 }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", boxSizing: "border-box", background: "oklch(0.97 0.015 80)", borderRadius: "18px 18px 0 0", padding: "16px 18px 26px" }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600, fontSize: 13, color: "oklch(0.3 0.02 55)" }}>add a note</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10, maxHeight: 220, overflowY: "auto" }}>
                  {notes.slice(0, 20).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => onPickEntry(n)}
                      style={{ textAlign: "left", border: "none", background: "oklch(0.97 0.01 80)", borderRadius: 10, padding: "9px 12px", cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", fontSize: 11.5, color: "oklch(0.35 0.02 55)" }}
                    >
                      {n.text.length > 46 ? n.text.slice(0, 46) + "…" : n.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
