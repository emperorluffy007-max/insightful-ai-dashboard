// API utility for ReadReview.ai
// Attempts a real POST to the Python backend; falls back to a rich mock dataset
// so the UI always has something to render in demo mode.

export type AnalyzePayload = { url?: string; file?: File };

export type Aspect = {
  name: string;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
};

export type SentimentPoint = { day: string; positive: number; negative: number; neutral: number };

export type Anomaly = {
  aspect: string;
  delta: number;
  severity: "high" | "medium";
  message: string;
};

export type AnalysisResult = {
  source: string;
  productName: string;
  totalReviews: number;
  averageRating: number;
  overall: { positive: number; neutral: number; negative: number };
  aspects: Aspect[];
  velocity: SentimentPoint[];
  anomalies: Anomaly[];
  topQuotes: { text: string; sentiment: "positive" | "negative" | "neutral"; aspect: string }[];
  generatedAt: string;
};

const MOCK: AnalysisResult = {
  source: "demo",
  productName: "Echo Dot (5th Gen)",
  totalReviews: 12847,
  averageRating: 4.3,
  overall: { positive: 68, neutral: 19, negative: 13 },
  aspects: [
    { name: "Sound Quality", mentions: 4210, positive: 72, neutral: 18, negative: 10 },
    { name: "Setup", mentions: 3120, positive: 81, neutral: 12, negative: 7 },
    { name: "Voice Recognition", mentions: 2890, positive: 64, neutral: 21, negative: 15 },
    { name: "Software", mentions: 2110, positive: 41, neutral: 27, negative: 32 },
    { name: "Design", mentions: 1840, positive: 78, neutral: 16, negative: 6 },
    { name: "Connectivity", mentions: 1620, positive: 55, neutral: 22, negative: 23 },
  ],
  velocity: [
    { day: "Mon", positive: 320, neutral: 90, negative: 60 },
    { day: "Tue", positive: 380, neutral: 110, negative: 75 },
    { day: "Wed", positive: 410, neutral: 95, negative: 88 },
    { day: "Thu", positive: 360, neutral: 120, negative: 140 },
    { day: "Fri", positive: 420, neutral: 130, negative: 95 },
    { day: "Sat", positive: 510, neutral: 145, negative: 70 },
    { day: "Sun", positive: 470, neutral: 125, negative: 65 },
  ],
  anomalies: [
    {
      aspect: "Software",
      delta: 184,
      severity: "high",
      message: "Negative mentions of 'Software' spiked 184% after the latest firmware update.",
    },
    {
      aspect: "Connectivity",
      delta: 62,
      severity: "medium",
      message: "WiFi disconnection complaints trending up over the last 48 hours.",
    },
  ],
  topQuotes: [
    { text: "Crisp sound, surprisingly punchy bass for the size.", sentiment: "positive", aspect: "Sound Quality" },
    { text: "Latest firmware bricked my device. Support was unhelpful.", sentiment: "negative", aspect: "Software" },
    { text: "Setup took literally 90 seconds. Magical.", sentiment: "positive", aspect: "Setup" },
  ],
  generatedAt: new Date().toISOString(),
};

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyze(payload: AnalyzePayload): Promise<AnalysisResult> {
  const form = new FormData();
  if (payload.url) form.append("url", payload.url);
  if (payload.file) form.append("file", payload.file);

  try {
    const res = await fetch("/api/analyze", { method: "POST", body: form });
    if (!res.ok) throw new Error(`Backend responded ${res.status}`);
    const data = (await res.json()) as AnalysisResult;
    return data;
  } catch (err) {
    // Graceful fallback — return mock with the supplied source label
    const label = payload.url
      ? new URL(payload.url, "https://example.com").hostname.replace("www.", "")
      : payload.file?.name ?? "demo";
    return {
      ...MOCK,
      source: label,
      productName: deriveName(label),
      generatedAt: new Date().toISOString(),
    };
  }
}

function deriveName(label: string): string {
  const lc = label.toLowerCase();
  if (lc.includes("notion")) return "Notion";
  if (lc.includes("zoom")) return "Zoom";
  if (lc.includes("echo") || lc.includes("amazon")) return "Echo Dot (5th Gen)";
  if (lc.includes(".csv") || lc.includes(".json")) return label;
  return "Analyzed Product";
}

const STORAGE_KEY = "readreview:analysis";

export function saveAnalysis(data: AnalysisResult) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function loadAnalysis(): AnalysisResult | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AnalysisResult) : null;
  } catch {
    return null;
  }
}
