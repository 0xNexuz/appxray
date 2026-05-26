"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Camera,
  ChevronDown,
  Eye,
  Fingerprint,
  LockKeyhole,
  Radar,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Terminal,
  Waypoints,
} from "lucide-react";
import type { AnalysisResponse } from "@/types/app-analysis";

const LOADING_LINES = [
  "Parsing public metadata...",
  "Decompiling marketing claims...",
  "Sniffing tracker fingerprints...",
  "Mapping device capabilities...",
  "Cross-checking permissions...",
  "Writing plain-English verdict...",
];

const EXAMPLE_URL =
  "https://play.google.com/store/apps/details?id=com.whatsapp";

const initialReport: AnalysisResponse = {
  appName: "Signal Sweep Demo",
  developer: "AppXRay specimen file",
  store: "google-play",
  riskScore: 58,
  realityCheck:
    "This demo report shows how AppXRay turns public metadata into a capability brief. Paste any app store or website URL to replace it with live scraped signals.",
  physicalCapabilities: [
    "Can request camera access.",
    "Can request microphone access.",
    "Can interact with local files.",
  ],
  trackers: [
    { name: "Firebase", purpose: "Analytics, crash reporting, and remote configuration." },
    { name: "Google Services", purpose: "Ads, platform services, or sign-in support." },
  ],
  redFlags: [
    "Location, contacts, microphone, or file permissions should match the app's stated purpose.",
    "Public metadata can hide SDK details, so absence of a tracker is not proof of absence.",
  ],
  verdict: "Use with Caution",
  rawSignals: {
    appId: "demo.specimen",
    rating: 4.2,
    installs: "Demo mode",
    genre: "Privacy analysis",
    permissions: ["CAMERA", "MICROPHONE", "STORAGE"],
  },
  source: "local-rules",
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [report, setReport] = useState<AnalysisResponse>(initialReport);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % LOADING_LINES.length);
    }, 850);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  async function analyzeApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoadingIndex(0);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Analysis failed.");
      }

      setReport(payload as AnalysisResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const verdictTone = useMemo(() => getVerdictTone(report.verdict), [report.verdict]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f0e8] text-[#161616]">
      <section className="relative min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,22,22,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(22,22,22,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute right-0 top-0 h-[42rem] w-[42rem] translate-x-1/3 rounded-full bg-[#b9ff66]/20 blur-3xl" />
        <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
          <nav className="flex items-center justify-between border-b border-[#161616]/10 pb-5">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-sm bg-[#161616] text-[#b9ff66]">
                <ScanLine size={22} />
              </div>
              <div>
                <p className="font-mono text-xs uppercase text-[#161616]/55">Static privacy brief</p>
                <p className="text-xl font-semibold">AppXRay</p>
              </div>
            </div>
            <a
              href="#report"
              className="hidden items-center gap-2 rounded-sm border border-[#161616]/20 px-4 py-2 text-sm font-medium transition hover:bg-[#161616] hover:text-[#f4f0e8] sm:flex"
            >
              View specimen <ArrowRight size={16} />
            </a>
          </nav>

          <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="scroll-reveal">
              <p className="mb-5 inline-flex items-center gap-2 rounded-sm bg-[#161616] px-3 py-1 font-mono text-xs uppercase text-[#b9ff66]">
                <Fingerprint size={14} /> Any link in. Capability report out.
              </p>
              <h1 className="max-w-4xl text-6xl font-semibold leading-[0.94] sm:text-7xl lg:text-8xl">
                See what an app can actually touch.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-[#3f3d38]">
                AppXRay reads public app-store or website signals and turns permissions, scripts,
                trackers, metadata, and claims into a plain-English privacy dossier.
              </p>

              <form
                onSubmit={analyzeApp}
                className="mt-9 grid gap-3 rounded-sm border border-[#161616]/15 bg-[#fffaf0]/85 p-2 shadow-[12px_12px_0_#161616]"
              >
                <div className="grid gap-2 lg:grid-cols-[1fr_auto]">
                  <input
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="Paste any app store or website URL"
                    className="min-h-14 rounded-sm border border-[#161616]/15 bg-white px-4 text-base outline-none transition focus:border-[#161616]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex min-h-14 items-center justify-center gap-2 rounded-sm bg-[#161616] px-6 font-semibold text-[#b9ff66] transition hover:bg-[#2a2a2a] disabled:cursor-wait disabled:opacity-70"
                  >
                    {isLoading ? "Scanning" : "Run XRay"} <Radar size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setUrl(EXAMPLE_URL)}
                  className="w-fit px-2 py-1 text-left font-mono text-xs uppercase text-[#5f5b52] underline decoration-[#b9ff66] underline-offset-4"
                >
                  Load Google Play example
                </button>
              </form>

              {error ? (
                <p className="mt-5 max-w-xl rounded-sm border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-950">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="scroll-reveal relative">
              <div className="absolute -left-8 top-10 hidden h-32 w-3 bg-[#b9ff66] lg:block" />
              <div className="rounded-sm border border-[#161616] bg-[#161616] p-3 text-[#f4f0e8] shadow-[18px_18px_0_rgba(22,22,22,0.18)]">
                <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 font-mono text-xs uppercase text-white/55">
                  <span>Specimen console</span>
                  <span>live</span>
                </div>
                <div className="grid gap-3 p-3 md:grid-cols-[1fr_0.7fr]">
                  <div className="min-h-80 rounded-sm bg-[#232323] p-5">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="grid size-12 place-items-center rounded-sm bg-[#b9ff66] text-[#161616]">
                        <Terminal size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-white/50">Current report</p>
                        <p className="text-2xl font-semibold">{report.appName}</p>
                      </div>
                    </div>
                    <RiskGauge score={isLoading ? 0 : report.riskScore} />
                    <div className="mt-6 rounded-sm border border-white/10 bg-black/30 p-4 font-mono text-sm text-[#b9ff66]">
                      <p>{isLoading ? LOADING_LINES[loadingIndex] : `Verdict: ${report.verdict}`}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-sm bg-white/10">
                        <div
                          className="h-full bg-[#b9ff66] transition-all duration-700"
                          style={{ width: isLoading ? `${(loadingIndex + 1) * 16}%` : `${report.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {[
                      [
                        "Source",
                        report.store === "google-play"
                          ? "Google Play"
                          : report.store === "apple-app-store"
                            ? "App Store"
                            : "Web link",
                      ],
                      ["Publisher", report.developer],
                      ["Genre", report.rawSignals.genre ?? "Unknown"],
                      ["Signals", `${report.rawSignals.permissions.length} permissions`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-sm border border-white/10 bg-white/[0.04] p-4">
                        <p className="font-mono text-xs uppercase text-white/45">{label}</p>
                        <p className="mt-2 text-lg font-medium">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pb-3">
            <a href="#report" className="grid size-10 place-items-center rounded-full border border-[#161616]/20">
              <ChevronDown size={20} />
            </a>
          </div>
        </div>
      </section>

      <section id="report" className="bg-[#161616] px-5 py-24 text-[#f4f0e8] sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="scroll-reveal">
            <p className="font-mono text-xs uppercase text-[#b9ff66]">Reality check</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Claims are soft. Capabilities are harder evidence.
            </h2>
            <p className="mt-5 text-lg leading-8 text-white/65">{report.realityCheck}</p>
          </div>
          <div className="scroll-reveal grid gap-4 md:grid-cols-3">
            <MetricCard icon={<ShieldAlert />} label="Risk score" value={`${report.riskScore}/100`} tone={verdictTone} />
            <MetricCard icon={<BadgeCheck />} label="Verdict" value={report.verdict} tone={verdictTone} />
            <MetricCard icon={<Activity />} label="Engine" value="Local rules" tone="green" />
          </div>
        </div>
      </section>

      <section className="bg-[#f4f0e8] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal mb-10 flex flex-col justify-between gap-6 border-b border-[#161616]/15 pb-8 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase text-[#5f5b52]">Physical access map</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                What the app may ask your device to hand over.
              </h2>
            </div>
            <Camera className="text-[#7a2e2e]" size={48} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {report.physicalCapabilities.map((capability, index) => (
              <CapabilityCard key={capability} index={index + 1} text={capability} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#dfe7dc] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="scroll-reveal grid gap-4">
            {report.trackers.map((tracker) => (
              <div key={tracker.name} className="group rounded-sm border border-[#161616]/15 bg-[#f9f5eb] p-6 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#161616]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold">{tracker.name}</p>
                    <p className="mt-3 leading-7 text-[#3f3d38]">{tracker.purpose}</p>
                  </div>
                  <Waypoints className="text-[#7a2e2e]" />
                </div>
              </div>
            ))}
          </div>
          <div className="scroll-reveal lg:pl-10">
            <p className="font-mono text-xs uppercase text-[#5f5b52]">Third-party SDKs</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Trackers are business infrastructure, not decorative code.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#3f3d38]">
              This view explains why a named SDK or web script may be present. Some pages omit SDKs,
              so AppXRay treats missing tracker names as uncertainty rather than innocence.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f4f0e8] px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="scroll-reveal grid gap-8 rounded-sm border border-[#161616] bg-[#fffaf0] p-6 shadow-[14px_14px_0_#161616] lg:grid-cols-[0.75fr_1.25fr] lg:p-10">
            <div>
              <p className="font-mono text-xs uppercase text-[#7a2e2e]">Red flags</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight">Permission mismatches to question.</h2>
            </div>
            <div className="grid gap-3">
              {report.redFlags.map((flag) => (
                <div key={flag} className="flex gap-4 border-b border-[#161616]/10 py-4 last:border-b-0">
                  <AlertTriangle className="mt-1 shrink-0 text-[#7a2e2e]" size={20} />
                  <p className="leading-7 text-[#3f3d38]">{flag}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#10100f] px-5 py-28 text-[#f4f0e8] sm:px-8 lg:px-12">
        <div className="absolute inset-y-0 left-8 hidden w-px bg-[#b9ff66]/45 lg:block" />
        <div className="scroll-reveal mx-auto max-w-4xl text-center">
          <Sparkles className="mx-auto mb-6 text-[#b9ff66]" size={36} />
          <p className="font-mono text-xs uppercase text-white/45">Next build step</p>
          <h2 className="mt-4 text-5xl font-semibold leading-tight sm:text-6xl">
            Public metadata first. Deeper scans later.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/65">
            The foundation is now wired for URL intake, scraping, transparent rule scoring,
            and dashboard rendering. The next layer can add APK/iOS binary analysis,
            richer tracker databases, and saved reports.
          </p>
          <a
            href="#"
            className="mt-9 inline-flex items-center gap-2 rounded-sm bg-[#b9ff66] px-6 py-4 font-semibold text-[#161616] transition hover:bg-[#d1ff93]"
          >
            Scan another app <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <footer className="border-t border-[#161616]/10 bg-[#f4f0e8] px-5 py-8 text-[#161616] sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="font-mono text-xs uppercase text-[#5f5b52]">AppXRay © Magnus</p>
          <a
            href="https://github.com/0xNexuz"
            target="_blank"
            rel="noreferrer"
            aria-label="Magnus on GitHub"
            className="grid size-10 place-items-center rounded-sm border border-[#161616]/15 text-[#161616] transition hover:bg-[#161616] hover:text-[#b9ff66]"
          >
            <GitHubMark />
          </a>
        </div>
      </footer>
    </main>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.23c0 4.52 2.86 8.35 6.84 9.71.5.09.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05A9.36 9.36 0 0 1 12 6.96c.85 0 1.7.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.8-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.07 10.07 0 0 0 22 12.23C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function RiskGauge({ score }: { score: number }) {
  return (
    <div className="relative mx-auto aspect-square max-w-72">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#b9ff66 ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
        }}
      />
      <div className="absolute inset-5 grid place-items-center rounded-full bg-[#161616] text-center">
        <div>
          <p className="font-mono text-xs uppercase text-white/45">Risk</p>
          <p className="text-6xl font-semibold text-[#b9ff66]">{score}</p>
          <p className="text-sm text-white/50">out of 100</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
      <div className={`mb-7 inline-grid size-11 place-items-center rounded-sm ${toneClass(tone)}`}>{icon}</div>
      <p className="font-mono text-xs uppercase text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CapabilityCard({ index, text }: { index: number; text: string }) {
  return (
    <div className="scroll-reveal group min-h-56 rounded-sm border border-[#161616]/15 bg-[#fffaf0] p-6 transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#161616]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm text-[#5f5b52]">0{index}</span>
        {index % 2 === 0 ? <Eye className="text-[#7a2e2e]" /> : <LockKeyhole className="text-[#7a2e2e]" />}
      </div>
      <p className="mt-12 text-2xl font-semibold leading-snug">{text}</p>
    </div>
  );
}

function getVerdictTone(verdict: AnalysisResponse["verdict"]) {
  if (verdict === "Safe") {
    return "green";
  }

  if (verdict === "High Risk") {
    return "red";
  }

  return "amber";
}

function toneClass(tone: string) {
  if (tone === "red") {
    return "bg-[#7a2e2e] text-white";
  }

  if (tone === "amber") {
    return "bg-[#f1c453] text-[#161616]";
  }

  return "bg-[#b9ff66] text-[#161616]";
}
