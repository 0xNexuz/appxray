# AppXRay

AppXRay is a lightweight privacy and capability scanner for everyday users. Paste a Google Play, Apple App Store, or website URL and AppXRay produces a plain-English report based on public signals such as permissions, metadata, loaded scripts, and known tracker hints.

Live demo: https://appxray-two.vercel.app

## What It Checks

- Google Play metadata and Android permissions
- Apple App Store metadata
- Website title, description, scripts, outbound links, and content type
- Common tracker and analytics signals such as Google Analytics, Google Tag Manager, Meta Pixel, Hotjar, Segment, Sentry, and others
- Permission and tracker red flags using a local rules engine

## Important Scope

AppXRay does not reverse-engineer private app code from a store URL. It shows what can be detected from public metadata and page/app-store signals.

For deeper Android analysis, a future version could inspect APK files directly for `AndroidManifest.xml`, embedded SDK package names, native libraries, and hardcoded network domains.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- `google-play-scraper`
- `app-store-scraper`
- Local deterministic scoring rules

## Why No AI?

The current scanner is local-rule based by design:

- faster
- cheaper
- deterministic
- easier to explain
- no OpenAI key required
- no scraped data sent to an LLM

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deployment

The app is deployed on Vercel:

```text
https://appxray-two.vercel.app
```

To deploy your own copy:

```bash
vercel deploy --prod
```

## Disclaimer

AppXRay is a first-pass transparency tool, not a full security audit. Reports should be treated as practical guidance based on public signals, not proof of everything an app or website does internally.
