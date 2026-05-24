export type StoreType = "google-play" | "apple-app-store" | "web-link";

export type Tracker = {
  name: string;
  purpose: string;
};

export type AppAnalysis = {
  riskScore: number;
  realityCheck: string;
  physicalCapabilities: string[];
  trackers: Tracker[];
  redFlags: string[];
  verdict: "Safe" | "Use with Caution" | "High Risk";
};

export type AnalysisResponse = AppAnalysis & {
  appName: string;
  developer: string;
  store: StoreType;
  icon?: string;
  rawSignals: {
    appId: string;
    rating?: number;
    installs?: string;
    genre?: string;
    permissions: string[];
  };
  source: "local-rules";
};
