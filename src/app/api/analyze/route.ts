import { NextResponse } from "next/server";
import { buildLocalAnalysis } from "@/lib/local-analysis";
import { parseStoreUrl } from "@/lib/store-url";
import type { AnalysisResponse } from "@/types/app-analysis";

export const runtime = "nodejs";

type StoreMetadata = {
  appName: string;
  developer: string;
  icon?: string;
  rating?: number;
  installs?: string;
  genre?: string;
  permissions: string[];
  raw: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json({ error: "Missing URL." }, { status: 400 });
    }

    const parsed = parseStoreUrl(body.url);
    const metadata = await scrapeStoreMetadata(parsed.store, parsed.appId);
    const rawData =
      metadata.raw && typeof metadata.raw === "object"
        ? { ...(metadata.raw as Record<string, unknown>), permissions: metadata.permissions }
        : { raw: metadata.raw, permissions: metadata.permissions };

    const analysis = buildLocalAnalysis(rawData);

    const response: AnalysisResponse = {
      ...analysis,
      appName: metadata.appName,
      developer: metadata.developer,
      store: parsed.store,
      icon: metadata.icon,
      rawSignals: {
        appId: parsed.appId,
        rating: metadata.rating,
        installs: metadata.installs,
        genre: metadata.genre,
        permissions: metadata.permissions,
      },
      source: "local-rules",
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analysis failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function scrapeStoreMetadata(store: string, appId: string): Promise<StoreMetadata> {
  if (store === "google-play") {
    const gplay = await import("google-play-scraper");
    const app = await gplay.default.app({ appId });
    const permissions = await gplay.default.permissions({ appId }).catch(() => []);

    return {
      appName: app.title,
      developer: app.developer,
      icon: app.icon,
      rating: app.score,
      installs: app.installs,
      genre: app.genre,
      permissions: permissions.map(formatPermission),
      raw: { ...app, permissions },
    };
  }

  if (store === "apple-app-store") {
    const appStore = await import("app-store-scraper");
    const app = await appStore.default.app({ id: appId });

    return {
      appName: app.title,
      developer: app.developer,
      icon: app.icon,
      rating: app.score,
      genre: app.primaryGenre,
      permissions: [],
      raw: app,
    };
  }

  return scrapeWebMetadata(appId);
}

function formatPermission(permission: unknown) {
  if (permission && typeof permission === "object") {
    const record = permission as Record<string, unknown>;
    const label = [record.type, record.permission].filter(Boolean).join(": ");

    if (label) {
      return label;
    }
  }

  return String(permission);
}

async function scrapeWebMetadata(targetUrl: string): Promise<StoreMetadata> {
  const response = await fetch(targetUrl, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (compatible; AppXRay/0.1; +http://localhost:3000)",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`The URL responded with HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "unknown";
  const html = await response.text();
  const finalUrl = response.url || targetUrl;
  const host = new URL(finalUrl).hostname.replace(/^www\./, "");
  const title = decodeHtml(readTag(html, /<title[^>]*>([\s\S]*?)<\/title>/i) ?? host).trim();
  const description = decodeHtml(
    readMeta(html, "description") ?? readMeta(html, "og:description") ?? "No page description found.",
  ).trim();
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map((match) =>
    absolutizeUrl(match[1], finalUrl),
  );
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)]
    .slice(0, 80)
    .map((match) => absolutizeUrl(match[1], finalUrl));
  const trackerHints = detectWebTrackers(html, scripts);

  return {
    appName: title,
    developer: host,
    genre: contentType.split(";")[0] || "web page",
    permissions: trackerHints,
    raw: {
      url: finalUrl,
      host,
      title,
      description,
      contentType,
      scripts,
      outboundLinks: links,
      trackerHints,
      textSample: decodeHtml(stripHtml(html)).slice(0, 6000),
    },
  };
}

function readMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return (
    readTag(html, new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)["']`, "i")) ??
    readTag(html, new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"))
  );
}

function readTag(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1];
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function absolutizeUrl(value: string, base: string) {
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}

function detectWebTrackers(html: string, scripts: string[]) {
  const haystack = `${html}\n${scripts.join("\n")}`.toLowerCase();
  const hints = [
    ["Google Analytics", "google-analytics.com"],
    ["Google Tag Manager", "googletagmanager.com"],
    ["Google Ads", "doubleclick.net"],
    ["Meta Pixel", "connect.facebook.net"],
    ["TikTok Pixel", "analytics.tiktok.com"],
    ["Hotjar", "hotjar.com"],
    ["Segment", "segment.com"],
    ["Amplitude", "amplitude.com"],
    ["Mixpanel", "mixpanel.com"],
    ["Sentry", "sentry.io"],
    ["Intercom", "intercom.io"],
  ];

  return hints
    .filter(([, token]) => haystack.includes(token))
    .map(([name, token]) => `${name}: ${token}`);
}
