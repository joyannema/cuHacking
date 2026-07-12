// import type { CSSProperties } from "react"; — only needed by the disabled hover-lift styling
import { CATEGORY_PALETTE, CLIP_PRESETS, seededRand } from "@/lib/data";
import type { CategoryMeta } from "@/lib/types";
import FolderIcon from "./FolderIcon";

export default function FolderCard({
  category,
  mini,
  onClick,
}: {
  category: CategoryMeta;
  mini: boolean;
  onClick: () => void;
}) {
  const rot = seededRand(category.colorIdx * 13 + 5, mini ? -3 : -2.4, mini ? 3 : 2.4);
  const tapeRot = seededRand(category.colorIdx * 9 + 6, -7, 7);
  const tapeLeft = seededRand(category.colorIdx * 17 + 8, 20, 60);
  const hasPin = category.colorIdx % 2 === 0;
  const pinRot = seededRand(category.colorIdx * 21 + 9, -20, 20);
  const hue = 80 + category.colorIdx * 40;
  const clip = CLIP_PRESETS[category.colorIdx % CLIP_PRESETS.length];
  const pal = CATEGORY_PALETTE[category.colorIdx % CATEGORY_PALETTE.length];

  return (
    <button
      onClick={onClick}
      // className="hover-lift" — disabled for now, was causing lag
      style={{
        position: "relative",
        width: mini ? "calc(50% - 6px)" : "calc(50% - 8px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: mini ? "center" : "flex-start",
        background: "oklch(0.985 0.008 80)",
        border: "none",
        clipPath: clip,
        padding: mini ? "18px 10px 16px" : "16px 16px 14px",
        boxShadow: mini ? "0 3px 9px rgba(90,60,30,0.09)" : "0 4px 11px rgba(90,60,30,0.1)",
        transform: `rotate(${rot}deg)`,
        cursor: "pointer",
        textAlign: mini ? "center" : "left",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -8,
          left: `${tapeLeft}%`,
          width: mini ? 30 : 38,
          height: mini ? 12 : 14,
          background: `repeating-linear-gradient(45deg, oklch(0.88 0.05 ${hue} / 0.85) 0 4px, oklch(0.94 0.03 ${hue} / 0.7) 4px 8px)`,
          borderRadius: 2,
          transform: `rotate(${tapeRot}deg)`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
        }}
      />
      {!mini && hasPin && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 10,
            width: 9,
            height: 9,
            borderRadius: 2,
            background: `oklch(0.75 0.09 ${hue})`,
            transform: `rotate(${pinRot}deg)`,
            boxShadow: "0 1px 1px rgba(0,0,0,0.15)",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 5,
          border: "1.3px dashed oklch(0.82 0.02 70)",
          pointerEvents: "none",
        }}
      />
      <FolderIcon color={pal.bg} size={mini ? 30 : 36} />
      <span
        style={{
          fontFamily: "'Space Grotesk',sans-serif",
          fontWeight: 600,
          fontSize: mini ? 13.5 : 16,
          color: "oklch(0.28 0.02 55)",
          marginTop: mini ? 7 : 10,
          textAlign: mini ? "center" : "left",
          lineHeight: 1.2,
        }}
      >
        {category.label}
      </span>
      <span
        style={{
          fontFamily: "'IBM Plex Mono',monospace",
          fontSize: mini ? 10 : 11,
          color: "oklch(0.5 0.03 60)",
          marginTop: mini ? 2 : 3,
        }}
      >
        {category.count} notes
      </span>
    </button>
  );
}
