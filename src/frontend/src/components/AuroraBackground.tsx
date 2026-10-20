export function AuroraBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="aurora-blob"
        style={{
          width: 600,
          height: 600,
          top: "-10%",
          left: "-5%",
          background: "oklch(0.52 0.22 284 / 0.18)",
          animationDelay: "0s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 500,
          height: 500,
          top: "20%",
          right: "-8%",
          background: "oklch(0.75 0.14 200 / 0.12)",
          animationDelay: "-4s",
          animationDuration: "15s",
        }}
      />
      <div
        className="aurora-blob"
        style={{
          width: 400,
          height: 400,
          bottom: "5%",
          left: "30%",
          background: "oklch(0.52 0.22 284 / 0.1)",
          animationDelay: "-8s",
          animationDuration: "18s",
        }}
      />
    </div>
  );
}
