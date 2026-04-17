import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  "Connecting to pipeline...",
  "Parsing review corpus...",
  "Building sentiment models...",
  "Extracting product aspects...",
  "Detecting anomalies & spikes...",
  "Compiling intelligence report...",
];

export function AnalysisLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep((s) => (s < STEPS.length ? s + 1 : s));
    }, 650);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const start = Date.now();
    const total = 4200;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / total) * 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(id);
        setTimeout(onDone, 350);
      }
    }, 50);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass relative overflow-hidden rounded-2xl p-10"
    >
      <div className="absolute inset-x-0 top-0 h-px animate-shimmer" />

      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: "var(--cyan)", opacity: 0.4 }} />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary glow-cyan">
            <Loader2 className="h-9 w-9 animate-spin text-[oklch(0.18_0.04_260)]" strokeWidth={2.5} />
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Running <span className="text-gradient">AI Analysis</span>
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Crunching reviews through our intelligence pipeline.
          </p>
        </div>

        <div className="w-full max-w-md">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <span>Pipeline status</span>
            <span style={{ color: "var(--cyan)" }}>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      <ul className="mx-auto mt-8 flex max-w-md flex-col gap-2.5">
        {STEPS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <motion.li
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                active ? "bg-cyan/10 ring-1 ring-cyan/30" : ""
              }`}
              style={active ? { background: "oklch(0.85 0.17 200 / 0.08)" } : undefined}
            >
              <span className="flex h-5 w-5 items-center justify-center">
                {done ? (
                  <Check className="h-4 w-4" style={{ color: "oklch(0.75 0.18 150)" }} strokeWidth={3} />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--cyan)" }} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              <span
                className={
                  done
                    ? "text-muted-foreground line-through decoration-muted-foreground/40"
                    : active
                      ? "font-medium"
                      : "text-muted-foreground/60"
                }
              >
                {label}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}
