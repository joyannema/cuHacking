import PaperDecor from "./PaperDecor";
import { PAPER_BG, PAPER_BG_SIZE } from "@/lib/data";

const WAVE_BASE = [10, 18, 28, 20, 34, 22, 16, 26, 12];

export default function CaptureOverlay({
  isRecording,
  isProcessing,
  transcript,
  attachedPhoto,
  onClose,
  onToggleRecording,
  onTranscriptChange,
  onToggleAttachPhoto,
  onSave,
}: {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  attachedPhoto: boolean;
  onClose: () => void;
  onToggleRecording: () => void;
  onTranscriptChange: (value: string) => void;
  onToggleAttachPhoto: () => void;
  onSave: () => void;
}) {
  const statusLabel = isProcessing
    ? "organizing your thoughts…"
    : isRecording
    ? "listening…"
    : transcript
    ? "paused"
    : "tap to speak";
  const hintLine = isProcessing
    ? "turning your thoughts into notes ✦"
    : isRecording
    ? '"...go on, i\'m listening"'
    : transcript
    ? "tap save when you're ready"
    : "say what's on your mind";
  const saveEnabled = transcript.trim().length > 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "oklch(0.965 0.012 78)",
        backgroundImage: PAPER_BG,
        backgroundSize: PAPER_BG_SIZE,
        display: "flex",
        flexDirection: "column",
        animation: "overlayIn 0.28s ease-out",
        zIndex: 30,
      }}
    >
      <PaperDecor />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "max(24px, env(safe-area-inset-top)) 20px 0",
        }}
      >
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
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24">
            <line x1="4" y1="4" x2="20" y2="20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="oklch(0.35 0.02 55)" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "oklch(0.5 0.03 60)", letterSpacing: "0.04em" }}>
          {statusLabel}
        </span>
        <div style={{ width: 36 }} />
      </div>

      <svg style={{ position: "absolute", top: 118, left: 26, opacity: 0.45 }} width="16" height="16" viewBox="0 0 16 16">
        <path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4 Z" fill="oklch(0.68 0.13 300)" />
      </svg>
      <svg style={{ position: "absolute", top: 158, right: 30, opacity: 0.4 }} width="30" height="14" viewBox="0 0 30 14">
        <path d="M1 7 Q 7 0, 14 7 T 27 7" stroke="oklch(0.6 0.1 45)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="1 4.5" />
      </svg>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, padding: "0 30px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, height: 36 }}>
          {WAVE_BASE.map((base, i) => (
            <div
              key={i}
              style={{
                width: 4,
                height: base,
                borderRadius: 3,
                background: "oklch(0.68 0.14 45)",
                transformOrigin: "center",
                animation: isRecording ? `waveBar ${0.6 + (i % 4) * 0.15}s ease-in-out infinite` : "none",
                opacity: isRecording ? 1 : 0.35,
              }}
            />
          ))}
        </div>

        <button
          onClick={onToggleRecording}
          disabled={isProcessing}
          style={{
            width: 132,
            height: 132,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 126,
              height: 126,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isProcessing
                ? "oklch(0.78 0.015 70)"
                : "linear-gradient(155deg, oklch(0.74 0.15 45), oklch(0.63 0.17 28))",

              boxShadow: isProcessing
                ? "0 8px 20px rgba(0,0,0,0.08)"
                : "0 14px 34px oklch(0.6 0.16 35 / 0.5), 0 3px 10px rgba(0,0,0,0.15)",

              animation: isProcessing
                ? "none"
                : `blobMorph ${isRecording ? "2.4s" : "7s"} ease-in-out infinite, blobPulse ${
                    isRecording ? "1s" : "3.6s"
                  } ease-in-out infinite`,
            }}
          >
            {isProcessing ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <rect
                  x="9"
                  y="2"
                  width="6"
                  height="12"
                  rx="3"
                  fill="oklch(0.55 0.02 60)"
                />
                <path
                  d="M5 11a7 7 0 0 0 14 0"
                  stroke="oklch(0.55 0.02 60)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="12"
                  y1="18"
                  x2="12"
                  y2="22"
                  stroke="oklch(0.55 0.02 60)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : isRecording ? (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  background: "oklch(0.99 0.005 80)",
                }}
              />
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="12" rx="3" fill="oklch(0.99 0.005 80)" />
                <path d="M5 11a7 7 0 0 0 14 0" stroke="oklch(0.99 0.005 80)" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="oklch(0.99 0.005 80)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </button>

        <p style={{ margin: 0, fontFamily: "'Caveat',cursive", fontSize: 19, color: "oklch(0.5 0.03 60)", textAlign: "center", minHeight: 24 }}>
          {hintLine}
        </p>

        <div
          style={{
            width: "100%",
            minHeight: 96,
            background: "oklch(0.985 0.008 80)",
            border: "1px solid oklch(0.88 0.015 70)",
            borderRadius: 18,
            padding: "18px 20px",
            boxShadow: "0 3px 12px rgba(90,60,30,0.06)",
            boxSizing: "border-box",
          }}
        >
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="type or speak…"
            style={{
              width: "100%",
              minHeight: 70,
              boxSizing: "border-box",
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 16,
              lineHeight: 1.55,
              color: "oklch(0.26 0.02 55)",
              fontWeight: 500,
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "vertical",
              padding: 0,
            }}
          />
          {attachedPhoto && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "oklch(0.94 0.02 250)",
                border: "1px dashed oklch(0.7 0.05 250)",
                borderRadius: 9,
                padding: "7px 10px",
                width: "fit-content",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="14" rx="2" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
                <circle cx="12" cy="13" r="3.2" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
                <path d="M8 6l1.5-2h5L16 6" stroke="oklch(0.4 0.06 250)" strokeWidth="1.8" />
              </svg>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: "oklch(0.35 0.06 250)" }}>
                receipt.jpg attached
              </span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "8px 26px max(30px, env(safe-area-inset-bottom))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onToggleAttachPhoto}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            border: `1.5px solid ${attachedPhoto ? "oklch(0.6 0.1 250)" : "oklch(0.8 0.02 65)"}`,
            background: attachedPhoto ? "oklch(0.92 0.03 250)" : "oklch(0.98 0.01 80)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2.5" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
            <circle cx="12" cy="13" r="3.6" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
            <path d="M8 6l1.5-2h5L16 6" stroke="oklch(0.35 0.02 55)" strokeWidth="1.8" />
          </svg>
        </button>

        <button
          onClick={onSave}
          disabled={!saveEnabled}
          style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: "0.01em",
            color: saveEnabled ? "oklch(0.99 0.005 80)" : "oklch(0.6 0.02 60)",
            background: saveEnabled ? "oklch(0.3 0.02 55)" : "oklch(0.88 0.015 70)",
            border: "none",
            borderRadius: 30,
            padding: "13px 34px",
            cursor: saveEnabled ? "pointer" : "default",
          }}
        >
          save
        </button>
      </div>
    </div>
  );
}
