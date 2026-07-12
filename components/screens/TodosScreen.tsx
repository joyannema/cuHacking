import PaperDecor from "../PaperDecor";
import { CATEGORY_LABELS, CATEGORY_PALETTE, INSIGHT_FALLBACK_TEXT, PAPER_BG, PAPER_BG_SIZE, seededRand } from "@/lib/data";
import type { Note } from "@/lib/types";

export default function TodosScreen({
  todos,
  todosEditMode,
  selectedTodoIds,
  insights,
  insightLoading,
  onGoStream,
  onToggleEditMode,
  onToggleTodo,
  onToggleSelect,
  onDeleteSelected,
  onClearCompleted,
}: {
  todos: Note[];
  todosEditMode: boolean;
  selectedTodoIds: number[];
  insights: string[] | null;
  insightLoading: boolean;
  onGoStream: () => void;
  onToggleEditMode: () => void;
  onToggleTodo: (id: number) => void;
  onToggleSelect: (id: number) => void;
  onDeleteSelected: () => void;
  onClearCompleted: () => void;
}) {
  const hasOpenTodo = todos.some((n) => !n.todoDone);
  const sorted = [...todos].sort((a, b) => Number(!!a.todoDone) - Number(!!b.todoDone));
  const showClearCompleted = !todosEditMode && todos.some((n) => n.todoDone);
  let dividerPlaced = false;

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

      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "max(28px, env(safe-area-inset-top)) 40px 10px" }}>
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
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 19, color: "oklch(0.24 0.02 55)", letterSpacing: "-0.02em" }}>
            to-dos
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.5 0.03 60)" }}>pulled from your notes</span>
        </div>
        <button
          onClick={onToggleEditMode}
          style={{
            fontFamily: "'IBM Plex Mono',monospace",
            fontSize: 11,
            color: todosEditMode ? "oklch(0.99 0.005 80)" : "oklch(0.45 0.03 60)",
            background: todosEditMode ? "oklch(0.3 0.02 55)" : "none",
            border: `1.4px dashed ${todosEditMode ? "oklch(0.3 0.02 55)" : "oklch(0.75 0.02 65)"}`,
            borderRadius: 20,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          {todosEditMode ? "done" : "edit"}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 36px 130px", display: "flex", flexDirection: "column", gap: 14, WebkitOverflowScrolling: "touch" }}>
        <div
          style={{
            position: "relative",
            margin: "0 0 4px",
            background: "oklch(0.97 0.02 85)",
            borderRadius: 3,
            padding: "14px 30px 14px 16px",
            boxShadow: "1px 2px 5px rgba(90,60,30,0.1)",
            transform: "rotate(-0.8deg)",
          }}
        >
          <div style={{ position: "absolute", top: -6, left: 20, width: 10, height: 10, borderRadius: "50%", background: "oklch(0.65 0.15 25)", boxShadow: "0 1px 2px rgba(0,0,0,0.25)" }} />
          {insightLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <div style={{ height: 14, width: "88%", borderRadius: 4, background: "oklch(0.85 0.02 65)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
              <div style={{ height: 14, width: "58%", borderRadius: 4, background: "oklch(0.85 0.02 65)", animation: "skeletonPulse 1.3s ease-in-out infinite" }} />
            </div>
          ) : insights && insights.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {insights.map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ flexShrink: 0, marginTop: 8, width: 5, height: 5, borderRadius: "50%", background: "oklch(0.6 0.1 45)" }} />
                  <p style={{ margin: 0, fontFamily: "'Caveat',cursive", fontSize: 18, lineHeight: 1.35, color: "oklch(0.4 0.05 55)" }}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, fontFamily: "'Caveat',cursive", fontSize: 19, lineHeight: 1.35, color: "oklch(0.4 0.05 55)" }}>
              {INSIGHT_FALLBACK_TEXT}
            </p>
          )}
        </div>

        {showClearCompleted && (
          <button
            onClick={onClearCompleted}
            style={{
              alignSelf: "flex-start",
              fontFamily: "'IBM Plex Mono',monospace",
              fontSize: 10.5,
              color: "oklch(0.5 0.1 45)",
              background: "none",
              border: "none",
              borderBottom: "1.4px dashed oklch(0.6 0.1 45)",
              padding: "0 0 1px",
              cursor: "pointer",
            }}
          >
            clear completed
          </button>
        )}

        {sorted.map((n) => {
          const pal = CATEGORY_PALETTE[n.colorIdx % CATEGORY_PALETTE.length];
          const done = !!n.todoDone;
          const selected = selectedTodoIds.includes(n.id);
          const tapeRot = seededRand(n.id * 11 + 40, -6, 6);
          const showDivider = done && hasOpenTodo && !dividerPlaced;
          if (showDivider) dividerPlaced = true;

          return (
            <div key={n.id}>
              {showDivider && (
                <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "2px 0 14px" }}>
                  <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, letterSpacing: "0.08em", color: "oklch(0.55 0.02 60)", textTransform: "uppercase" }}>
                    completed
                  </span>
                  <div style={{ flex: 1, height: 0, borderTop: "1.6px dashed oklch(0.68 0.02 60)" }} />
                </div>
              )}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "oklch(0.985 0.008 80)",
                  borderRadius: 3,
                  padding: "14px 16px",
                  boxShadow: "0 3px 9px rgba(90,60,30,0.08)",
                  opacity: done ? 0.55 : 1,
                  transition: "opacity 0.25s ease",
                }}
              >
                <div style={{ position: "absolute", inset: 5, border: "1.3px dashed oklch(0.82 0.02 70)", pointerEvents: "none" }} />
                <div
                  style={{
                    position: "absolute",
                    top: -7,
                    left: 24,
                    width: 34,
                    height: 12,
                    background: `repeating-linear-gradient(45deg, oklch(0.88 0.05 ${80 + n.colorIdx * 40} / 0.85) 0 4px, oklch(0.94 0.03 ${80 + n.colorIdx * 40} / 0.7) 4px 8px)`,
                    borderRadius: 2,
                    transform: `rotate(${tapeRot}deg)`,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                />
                {todosEditMode ? (
                  <button
                    onClick={() => onToggleSelect(n.id)}
                    style={{
                      flexShrink: 0,
                      marginTop: 2,
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      border: `2px solid ${selected ? "oklch(0.5 0.14 25)" : "oklch(0.7 0.02 60)"}`,
                      background: selected ? "oklch(0.55 0.14 25)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <line x1="4" y1="4" x2="20" y2="20" stroke="oklch(0.99 0.005 80)" strokeWidth="2.6" strokeLinecap="round" />
                        <line x1="20" y1="4" x2="4" y2="20" stroke="oklch(0.99 0.005 80)" strokeWidth="2.6" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleTodo(n.id)}
                    style={{
                      flexShrink: 0,
                      marginTop: 2,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: `2px solid ${done ? "oklch(0.45 0.12 150)" : "oklch(0.6 0.02 60)"}`,
                      background: done ? "oklch(0.92 0.05 150)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {done && (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M4 13l5 5L20 6" stroke="oklch(0.45 0.12 150)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                )}
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontFamily: "'IBM Plex Mono',monospace",
                      fontWeight: 500,
                      fontSize: 9.5,
                      letterSpacing: "0.02em",
                      color: pal.fg,
                      background: pal.bg,
                      borderRadius: 20,
                      padding: "3px 8px",
                      marginBottom: 5,
                    }}
                  >
                    {CATEGORY_LABELS[n.category] || n.category}
                  </span>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "'Space Grotesk',sans-serif",
                      fontSize: 14.5,
                      lineHeight: 1.4,
                      color: "oklch(0.26 0.02 55)",
                      fontWeight: 500,
                      textDecoration: done ? "line-through" : "none",
                      textDecorationColor: "oklch(0.55 0.1 150)",
                    }}
                  >
                    {n.todoText}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {todos.length === 0 && (
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, color: "oklch(0.55 0.02 60)", textAlign: "center", marginTop: 40 }}>
            nothing actionable in your notes yet.
          </p>
        )}
      </div>

      {todosEditMode && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 112, display: "flex", justifyContent: "center", zIndex: 6 }}>
          <button
            onClick={onDeleteSelected}
            disabled={selectedTodoIds.length === 0}
            style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontWeight: 600,
              fontSize: 13,
              color: "oklch(0.99 0.005 80)",
              background: selectedTodoIds.length ? "oklch(0.55 0.14 25)" : "oklch(0.8 0.05 25)",
              border: "none",
              borderRadius: 24,
              padding: "10px 22px",
              cursor: selectedTodoIds.length ? "pointer" : "default",
              boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
            }}
          >
            delete selected ({selectedTodoIds.length})
          </button>
        </div>
      )}
    </div>
  );
}
