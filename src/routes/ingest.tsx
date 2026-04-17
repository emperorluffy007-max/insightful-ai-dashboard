import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link as LinkIcon,
  UploadCloud,
  Sparkles,
  Zap,
  AlertCircle,
  FileJson,
  FileText,
  X,
} from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { StatusHeader } from "@/components/StatusHeader";
import { AnalysisLoader } from "@/components/AnalysisLoader";
import { analyze, saveAnalysis } from "@/lib/api";

export const Route = createFileRoute("/ingest")({
  head: () => ({
    meta: [
      { title: "Ingest Reviews — ReadReview.ai" },
      {
        name: "description",
        content:
          "Paste a product URL or upload a CSV/JSON of reviews. ReadReview.ai turns them into actionable intelligence.",
      },
      { property: "og:title", content: "Ingest Reviews — ReadReview.ai" },
      {
        property: "og:description",
        content: "Product-agnostic AI pipeline for review intelligence.",
      },
    ],
  }),
  component: IngestPage,
});

const QUICK_PICKS = [
  { label: "Echo Dot", url: "https://amazon.com/echo-dot" },
  { label: "Notion", url: "https://apps.apple.com/notion" },
  { label: "Zoom", url: "https://play.google.com/zoom" },
];

function IngestPage() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!url && !file) {
      setError("Please paste a URL or upload a file first.");
      return;
    }
    setError(null);
    setPhase("loading");

    try {
      const result = await analyze({ url: url || undefined, file: file || undefined });
      saveAnalysis(result);
      // Loader's onDone will handle navigation timing
    } catch (e) {
      setPhase("error");
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const onLoaderDone = () => {
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen">
      <AnimatedBackdrop />
      <StatusHeader currentStep={1} />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <AnimatePresence mode="wait">
          {phase === "loading" ? (
            <AnalysisLoader key="loader" onDone={onLoaderDone} />
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
                  <span
                    className="h-1.5 w-1.5 animate-pulse-soft rounded-full"
                    style={{ background: "var(--cyan)" }}
                  />
                  Step 02 — Data Source
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                  Feed the <span className="text-gradient">Pipeline</span>
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                  Paste a product URL or drop a review export. We&apos;ll do the rest.
                </p>
              </div>

              {/* Intelligence Context */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="glass mt-8 flex items-start gap-3 rounded-xl p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary glow-cyan">
                  <Sparkles className="h-4 w-4 text-[oklch(0.18_0.04_260)]" strokeWidth={2.5} />
                </div>
                <div className="text-sm">
                  <div className="font-semibold">Product-agnostic intelligence</div>
                  <p className="mt-0.5 text-muted-foreground">
                    The pipeline detects categories, aspects, and sentiment automatically — works
                    for anything from headphones to SaaS apps. No schema required.
                  </p>
                </div>
              </motion.div>

              <div className="mt-8 grid gap-6">
                {/* URL Input */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{ background: "var(--cyan)", color: "oklch(0.18 0.04 260)" }}
                    >
                      A
                    </span>
                    Paste Product URL
                  </label>
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-2.5 transition-all focus-within:ring-cyan">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://amazon.com/dp/B09B8V1LZ3"
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Quick-pick:
                    </span>
                    {QUICK_PICKS.map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        onClick={() => setUrl(q.url)}
                        className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium transition-all hover:border-cyan/50 hover:text-foreground"
                        style={{ transition: "all 0.2s" }}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </motion.section>

                {/* OR Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-x-0 h-px bg-border/50" />
                  <span className="relative bg-background/80 px-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground backdrop-blur">
                    Or
                  </span>
                </div>

                {/* File Upload */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass rounded-2xl p-6"
                >
                  <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{ background: "var(--purple)", color: "white" }}
                    >
                      B
                    </span>
                    Upload Review Export
                  </label>
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition-all ${
                      dragOver
                        ? "border-cyan bg-cyan/5"
                        : "border-border bg-background/30 hover:border-border/80"
                    }`}
                    style={
                      dragOver
                        ? {
                            borderColor: "var(--cyan)",
                            background: "oklch(0.85 0.17 200 / 0.08)",
                          }
                        : undefined
                    }
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.json,application/json,text/csv"
                      className="hidden"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file ? (
                      <div className="flex items-center gap-3 rounded-lg bg-card/60 px-4 py-2.5">
                        {file.name.endsWith(".json") ? (
                          <FileJson className="h-5 w-5" style={{ color: "var(--cyan)" }} />
                        ) : (
                          <FileText className="h-5 w-5" style={{ color: "var(--cyan)" }} />
                        )}
                        <div className="text-left">
                          <div className="text-sm font-medium">{file.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="ml-2 rounded-md p-1 hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud
                          className={`h-10 w-10 transition-colors ${
                            dragOver ? "" : "text-muted-foreground"
                          }`}
                          style={dragOver ? { color: "var(--cyan)" } : undefined}
                          strokeWidth={1.5}
                        />
                        <div className="text-sm font-medium">
                          Drop CSV or JSON here, or{" "}
                          <span className="text-gradient font-semibold">browse</span>
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Max 50 MB · CSV / JSON
                        </div>
                      </>
                    )}
                  </div>
                </motion.section>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" style={{ color: "var(--destructive)" }} />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  onClick={handleSubmit}
                  className="glow-cyan group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-primary px-8 py-4 text-base font-semibold text-[oklch(0.18_0.04_260)] transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Zap className="h-5 w-5" strokeWidth={2.5} />
                  Run AI Analysis
                  <span className="absolute inset-0 -translate-x-full animate-shimmer opacity-50" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
