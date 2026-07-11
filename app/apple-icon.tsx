import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #d99a68, #c06a3f)",
        }}
      >
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 100,
            color: "#fdfaf5",
          }}
        >
          s
        </div>
      </div>
    ),
    { ...size }
  );
}
