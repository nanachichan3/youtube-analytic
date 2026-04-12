# Technology — ViewPulse

## Architecture

**Type:** Single-page application (SPA) / Static site
**Runtime:** Client-side only (no server)

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 14+ |
| Language | TypeScript | 5.x |
| UI | React 18 | - |
| Styling | CSS (globals.css) | - |
| Charts | Chart.js | via CDN |
| Parser | DOMParser | Browser native |

## Key Files

```
app/
├── page.tsx          # Main entry
├── layout.tsx        # Root layout
├── globals.css       # All styles (~25K lines)
components/
├── Dashboard.tsx     # Main dashboard (~37K lines)
├── HomeClient.tsx    # Home page client
├── site-header.tsx   # Header component
lib/
└── parser.ts         # Watch history parser
```

## Important Constraints

1. **No server-side code** — All components must be client-safe
2. **No API routes** — No `/app/api/*` routes
3. **No database** — Data never leaves browser
4. **No cookies/localStorage for analytics** — Privacy first

## Build & Deploy

```bash
# Development
pnpm dev  # Port 3013

# Production build
pnpm build

# Dockerfile uses standalone output
# No public/ folder needed
```

## Known Technical Debt

1. **globals.css is ~25K lines** — Needs cleanup
2. **Dashboard.tsx is ~37K lines** — Should be split
3. **No testing suite** — No Playwright tests
4. **No TypeScript strict mode** — Needs auditing

## Future Considerations

- Service worker for offline support?
- PWA manifest for "Add to Home Screen"?
- WebAssembly for faster parsing?
