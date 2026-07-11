export default function PaperDecor() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: -40,
          left: -30,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,140,90,0.28) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 120,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(170,150,225,0.24) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: -40,
          width: 210,
          height: 210,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(244,205,120,0.24) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -30,
          right: -20,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(140,190,170,0.22) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </>
  );
}
