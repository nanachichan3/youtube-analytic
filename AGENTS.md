# AGENTS.md

## Cursor Cloud specific instructions

**ViewPulse** is a privacy-first YouTube watch history analyzer built with Next.js 14 (App Router) and TypeScript. **Watch history** is parsed and analyzed entirely in the browser — no server-side storage of user data.

Optional **BYOK AI** features (export panel): **Gemini** is called directly from the browser. **OpenAI** is forwarded through a minimal route handler (`app/api/openai-proxy/route.ts`) because OpenAI’s API does not allow browser `fetch` (CORS); the proxy does not log or persist API keys or payloads. Tabs: **OpenClaw** (`USER.md` + `CONTEXT.json`), **For Parents** (caregiver report), **Recs** (N channel recommendations), **Image Reports** (reference photo, AI share poster, AI image prompt ideas, personality card — dense real-world object scenes, no people, avatar). Shared provider, keys, and **text model** across OpenClaw, Parents, Recs, and text features on Image Reports. Optional **reference photo** (Gemini only for image APIs) steers avatar and/or poster.

### Services

| Service | Command | Port | Notes |
|---|---|---|---|
| Next.js dev server | `pnpm dev` | 3013 | The only service. Fully self-contained. |

### Key commands

See `package.json` scripts — standard Next.js project:
- **Dev**: `pnpm dev` (port 3013)
- **Lint**: `pnpm lint` (ESLint with `next/core-web-vitals`)
- **Build**: `pnpm build`
- **Start**: `pnpm start` (serves production build)

### Gotchas

- No lockfile ships with the repo; `pnpm install` generates one locally.
- The file parser (`lib/parser.ts`) scans `watch-history.html` as text (large Takeout files break or truncate under `DOMParser`); JSON parsing is unchanged. `DOMParser` is only a fallback for non-standard markup.
- The `globals.css` file is very large (~25K lines) — avoid reading it in full.
- `Dashboard.tsx` is ~37K lines; prefer targeted searches over full reads.
- **Games** thumbnails use `app/api/youtube-oembed` (allowlisted YouTube watch URLs only → YouTube’s public oEmbed JSON); no API key; the Takeout file is not uploaded.
- **Games** scores, difficulty, active tab (Channel duel / Rewatch duel / History check), and per-option **exposure counts** (for weighted random picks) persist in `localStorage` under `viewpulse-games-progress` (see `lib/games-progress-storage.ts`).
