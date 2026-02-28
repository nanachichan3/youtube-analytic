<div align="center">

<img src="app/icon.svg" alt="ViewPulse logo" width="96" height="96" />

# ViewPulse

**Privacy-first YouTube watch history analyzer**

Parse and explore your Google Takeout export entirely in the browser — no server-side storage of your history.

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)

[Live app](https://self-degree.com/tools/youtube-analytics) · [Report an issue](https://github.com/your-org/your-repo/issues) · [Source](https://github.com/your-org/your-repo)

</div>

---

## Overview

**ViewPulse** turns your personal YouTube watch data into charts, rankings, and insights. You upload `watch-history.html` or `watch-history.json` from [Google Takeout](https://takeout.google.com/); parsing and analytics run **only on your device**. The app does not upload, record, or persist your watch history on a server.

Built by [Self Degree](https://self-degree.com/) as an open-source Next.js application.

## Features

| Area | What you get |
|------|----------------|
| **Core analytics** | Totals, date range, peak viewing hour, unique channels, averages, binge/session signals, channel rankings, timeline and calendar views, year-over-year patterns |
| **YouTube vs Music** | When your export includes both, filter between standard YouTube and YouTube Music |
| **Brush timeline** | Interactive range selection with presets (e.g. last 12 months, last 3 years, all time) |
| **Games** (optional) | Channel duel, rewatch duel, and history-check quizzes using your data; thumbnails via an allowlisted [oEmbed](https://www.youtube.com/oembed) proxy — **no** Takeout upload to the server |
| **AI Tools** (optional, BYOK) | Bring your own API keys: OpenClaw-style `USER.md` / context export, caregiver-oriented report, channel recommendations, and image-oriented outputs (share poster, prompt ideas, stylized cards). Gemini calls the provider from the browser; OpenAI text/images go through a minimal [proxy route](app/api/openai-proxy/route.ts) for CORS only — keys and payloads are not logged or stored by the app |

Additional **use-case pages** live under [`app/use-cases/`](app/use-cases/) (personal analytics, wellbeing, families, YouTube vs Music); the interactive analyzer is on the home page.

## Privacy & security

- Watch history **never** leaves your browser for core analysis (client-side parsing in [`lib/parser.ts`](lib/parser.ts)).
- Optional AI features only run when **you** supply keys and trigger a request; review each provider’s terms before use.
- Game progress can be stored in **localStorage** (see [`lib/games-progress-storage.ts`](lib/games-progress-storage.ts)).

## Requirements

- **Node.js** 18+ (recommended)
- **pnpm** (the repo does not ship a lockfile; `pnpm install` generates one locally)

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3013](http://localhost:3013).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server on port **3013** |
| `pnpm build` | Production build |
| `pnpm start` | Serve production build |
| `pnpm lint` | ESLint (`next/core-web-vitals`) |

## Configuration

### GitHub links in the UI

Set this so header/footer GitHub links point at your repository:

```bash
export NEXT_PUBLIC_GITHUB_URL=https://github.com/your-org/your-repo
```

Default in [`lib/links.ts`](lib/links.ts) is a placeholder URL until you override it.

### Production URL & SEO

Canonical site metadata lives in [`lib/seo.ts`](lib/seo.ts) (`site.url`, `site.name`, `site.description`). Update `site.url` when you deploy to your own domain.

## Project structure (high level)

```
app/                    # Next.js App Router pages & API routes
components/             # UI (e.g. HomeClient, Dashboard, games, AI export panel)
lib/                    # Parser, analytics helpers, AI clients, prompts
```

Large files you may want to navigate by search: `components/Dashboard.tsx` (main dashboard), `app/globals.css` (global styles).

## Contributing

Contributions are welcome: bug reports, docs, and focused PRs. Please keep changes scoped to the problem you are solving. If you add user-facing behavior, mention any privacy implications clearly.

## License

This repository does not currently include a `LICENSE` file. Add one (e.g. MIT, Apache-2.0) when you publish or fork so others know the terms.

---

<div align="center">

**ViewPulse** — know your attention, keep your data on your device.

</div>
