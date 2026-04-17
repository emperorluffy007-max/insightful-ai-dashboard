export function AnimatedBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="animate-blob absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full opacity-40 blur-[120px]"
        style={{ background: "oklch(0.55 0.24 295 / 0.6)" }}
      />
      <div
        className="animate-blob absolute top-1/3 -right-32 h-[520px] w-[520px] rounded-full opacity-30 blur-[140px]"
        style={{ background: "oklch(0.85 0.17 200 / 0.5)", animationDelay: "-6s" }}
      />
      <div
        className="animate-blob absolute -bottom-40 left-1/4 h-[420px] w-[420px] rounded-full opacity-25 blur-[120px]"
        style={{ background: "oklch(0.65 0.22 270 / 0.55)", animationDelay: "-12s" }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.85 0.17 200) 1px, transparent 1px), linear-gradient(90deg, oklch(0.85 0.17 200) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
