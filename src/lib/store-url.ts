import type { StoreType } from "@/types/app-analysis";

export type ParsedStoreUrl = {
  store: StoreType;
  appId: string;
};

export function parseStoreUrl(value: string): ParsedStoreUrl {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Paste a full http or https URL.");
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host.includes("play.google.com")) {
    const appId = url.searchParams.get("id");

    if (!appId) {
      throw new Error("Google Play URLs need an id query parameter.");
    }

    return { store: "google-play", appId };
  }

  if (host.includes("apps.apple.com")) {
    const match = url.pathname.match(/id(\d+)/);

    if (!match?.[1]) {
      throw new Error("Apple App Store URLs need a numeric app id.");
    }

    return { store: "apple-app-store", appId: match[1] };
  }

  if (url.protocol === "http:" || url.protocol === "https:") {
    return { store: "web-link", appId: url.href };
  }

  throw new Error("Paste a full http or https URL.");
}
