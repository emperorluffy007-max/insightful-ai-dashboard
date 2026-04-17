import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  TrendingUp,
  MessageSquareQuote,
  Star,
  Activity,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AnimatedBackdrop } from "@/components/AnimatedBackdrop";
import { StatusHeader } from "@/components/StatusHeader";
import { loadAnalysis, type AnalysisResult } from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Intelligence Dashboard — ReadReview.ai" },
      { name: "description", content: "Live sentiment, aspects, and anomaly detection across your review corpus." },
      { property: "og:title", content: "Intelligence Dashboard — ReadReview.ai" },
      { property: "og:description", content: "Live sentiment, aspects, and anomaly detection." },
    ],
  }),
  component: DashboardPage,
});

const COLORS = {
  positive: "oklch(0.75 0.18 150)",
  neutral: "oklch(0.7 0.05 260)",
  negative: "oklch(0.65 0.24 25)",
  cyan: "oklch(0.85 0.17 200)",
  purple: "oklch(0.55 0.24 295)",
};

function DashboardPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadAnalysis());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!data) {
    return (
      <div className="min-h-screen">
        <AnimatedBackdrop />
        <StatusHeader currentStep={2} />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="glass rounded-2xl p-10">
            <h2 className="font-display text-2xl font-bold">No analysis loaded</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Run the ingestion pipeline first to populate the dashboard.
            </p>
            <Link
              to="/ingest"
              className="glow-cyan mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-[oklch(0.18_0.04_260)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Ingest
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const overallPie = [
    { name: "Positive", value: data.overall.positive, color: COLORS.positive },
    { name: "Neutral", value: data.overall.neutral, color: COLORS.neutral },
    { name: "Negative", value: data.overall.negative, color: COLORS.negative },
  ];

  return (
    <div className="min-h-screen">
      <AnimatedBackdrop />
      <StatusHeader currentStep={2} />

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Source: {data.source}
            </div>
            <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">
              {data.productName} <span className="text-gradient">Intelligence</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.totalReviews.toLocaleString()} reviews analyzed ·{" "}
              {new Date(data.generatedAt).toLocaleString()}
            </p>
          </div>
          <Link
            to="/ingest"
            className="glass flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-card/70"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Link>
        </motion.div>

        {/* Anomaly Alerts */}
        {data.anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 grid gap-3 md:grid-cols-2"
          >
            {data.anomalies.map((a, i) => (
              <div
                key={i}
                className="glass relative overflow-hidden rounded-xl border-l-4 p-4"
                style={{
                  borderLeftColor:
                    a.severity === "high" ? "oklch(0.65 0.24 25)" : "oklch(0.78 0.16 75)",
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 animate-pulse-soft items-center justify-center rounded-lg"
                    style={{
                      background:
                        a.severity === "high" ? "oklch(0.65 0.24 25 / 0.2)" : "oklch(0.78 0.16 75 / 0.2)",
                      color: a.severity === "high" ? "oklch(0.7 0.24 25)" : "oklch(0.82 0.16 75)",
                    }}
                  >
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{a.aspect} anomaly</span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{
                          color: a.severity === "high" ? "oklch(0.7 0.24 25)" : "oklch(0.82 0.16 75)",
                        }}
                      >
                        +{a.delta}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* KPI row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          <KpiCard
            icon={<Star className="h-4 w-4" />}
            label="Avg Rating"
            value={data.averageRating.toFixed(2)}
            accent={COLORS.cyan}
          />
          <KpiCard
            icon={<MessageSquareQuote className="h-4 w-4" />}
            label="Reviews"
            value={data.totalReviews.toLocaleString()}
            accent={COLORS.purple}
          />
          <KpiCard
            icon={<TrendingUp className="h-4 w-4" />}
            label="% Positive"
            value={`${data.overall.positive}%`}
            accent={COLORS.positive}
          />
          <KpiCard
            icon={<Activity className="h-4 w-4" />}
            label="Anomalies"
            value={String(data.anomalies.length)}
            accent={COLORS.negative}
          />
        </motion.div>

        {/* Charts grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sentiment donut */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 lg:col-span-1"
          >
            <PaneHeader title="Overall Sentiment" subtitle="Distribution across corpus" />
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallPie}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {overallPie.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: number) => [`${v}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex justify-center gap-4">
              {overallPie.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-muted-foreground">{p.name}</span>
                  <span className="font-mono font-semibold">{p.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Velocity area chart */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 lg:col-span-2"
          >
            <PaneHeader
              title="Sentiment Velocity"
              subtitle="Daily volume by polarity"
              right={<Layers className="h-4 w-4" style={{ color: "var(--cyan)" }} />}
            />
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.velocity} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.positive} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={COLORS.positive} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gNeg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.negative} stopOpacity={0.55} />
                      <stop offset="100%" stopColor={COLORS.negative} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gNeu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.32 0.04 265 / 0.5)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="positive" stroke={COLORS.positive} fill="url(#gPos)" strokeWidth={2} />
                  <Area type="monotone" dataKey="neutral" stroke={COLORS.cyan} fill="url(#gNeu)" strokeWidth={2} />
                  <Area type="monotone" dataKey="negative" stroke={COLORS.negative} fill="url(#gNeg)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Aspects bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6 lg:col-span-2"
          >
            <PaneHeader title="Aspects Found" subtitle="Mentions broken down by sentiment" />
            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.aspects} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.32 0.04 265 / 0.5)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="positive" stackId="a" fill={COLORS.positive} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="neutral" stackId="a" fill={COLORS.cyan} fillOpacity={0.5} />
                  <Bar dataKey="negative" stackId="a" fill={COLORS.negative} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top quotes */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6 lg:col-span-1"
          >
            <PaneHeader title="Signal Quotes" subtitle="Most representative reviews" />
            <ul className="mt-4 flex flex-col gap-3">
              {data.topQuotes.map((q, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-border/40 bg-background/30 p-3"
                >
                  <p className="text-sm leading-relaxed">&ldquo;{q.text}&rdquo;</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                      style={{
                        background:
                          q.sentiment === "positive"
                            ? "oklch(0.75 0.18 150 / 0.15)"
                            : q.sentiment === "negative"
                              ? "oklch(0.65 0.24 25 / 0.15)"
                              : "oklch(0.7 0.05 260 / 0.2)",
                        color:
                          q.sentiment === "positive"
                            ? COLORS.positive
                            : q.sentiment === "negative"
                              ? COLORS.negative
                              : COLORS.neutral,
                      }}
                    >
                      {q.sentiment}
                    </span>
                    <span className="text-[11px] text-muted-foreground">· {q.aspect}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "oklch(0.21 0.03 265 / 0.95)",
  border: "1px solid oklch(0.32 0.04 265)",
  borderRadius: "10px",
  fontSize: "12px",
  backdropFilter: "blur(12px)",
};

function PaneHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {right}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${accent} 20%, transparent)`, color: accent }}
        >
          {icon}
        </span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}
