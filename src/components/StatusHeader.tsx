import { Link } from "@tanstack/react-router";
import { Wifi, WifiOff, Sparkles, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

const STEPS = ["Account", "Data Source", "Dashboard"] as const;

export function StatusHeader({ currentStep }: { currentStep: 0 | 1 | 2 }) {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      const ok = await checkHealth();
      if (alive) setOnline(ok);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <header className="glass-strong sticky top-0 z-40 border-b border-border/50">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <div className="glow-cyan flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4.5 w-4.5 text-[oklch(0.18_0.04_260)]" strokeWidth={2.5} />
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">
              ReadReview<span className="text-gradient">.ai</span>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Review Intelligence
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {STEPS.map((label, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-cyan/15 text-cyan ring-1 ring-cyan/40"
                      : done
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                  style={
                    active
                      ? { color: "var(--cyan)", boxShadow: "0 0 0 1px oklch(0.85 0.17 200 / 0.4)" }
                      : undefined
                  }
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      done
                        ? "bg-[oklch(0.75_0.18_150)] text-[oklch(0.18_0.04_260)]"
                        : active
                          ? "bg-gradient-primary text-[oklch(0.18_0.04_260)]"
                          : "bg-muted"
                    }`}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </span>
                  {label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="h-px w-6 bg-border" />
                )}
              </div>
            );
          })}
        </nav>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider ${
            online === null
              ? "border-border bg-muted/40 text-muted-foreground"
              : online
                ? "border-[oklch(0.75_0.18_150)/0.4] text-[oklch(0.75_0.18_150)]"
                : "border-[oklch(0.78_0.16_75)/0.4] text-[oklch(0.78_0.16_75)]"
          }`}
          style={
            online
              ? { borderColor: "oklch(0.75 0.18 150 / 0.4)", color: "oklch(0.75 0.18 150)" }
              : online === false
                ? { borderColor: "oklch(0.78 0.16 75 / 0.4)", color: "oklch(0.78 0.16 75)" }
                : undefined
          }
        >
          {online === false ? (
            <WifiOff className="h-3.5 w-3.5" />
          ) : (
            <Wifi className={`h-3.5 w-3.5 ${online ? "animate-pulse-soft" : ""}`} />
          )}
          {online === null ? "Checking..." : online ? "AI Backend Online" : "Backend Offline"}
        </div>
      </div>
    </header>
  );
}
