# AI Steering — ViewPulse

*Plugin configuration for AI agents working on the ViewPulse startup.*

## Startup Identity

- **Name:** ViewPulse
- **Type:** YouTube Analytics / Privacy Tool
- **Stage:** Launch (2026-04-12)
- **Tagline:** "Privacy-first YouTube watch history analytics"
- **URL:** https://viewpulse.xyz (or current)
- **Founder:** Yev Rachkovan
- **Target:** YouTube power users, content creators, researchers, privacy-conscious users

## Framework Alignment

This startup follows the **Startup Factory OS** (8-stage lifecycle). All agents must adhere to:

1. **Universal Expert Loop:** Listen → Decide → Delegate → Validate → Persist → Reflect
2. **Never do work yourself** — delegate to sub-agents
3. **Never hold long-term memory** outside files
4. **Everything as code** — git, IaaC, reproducible

## Core Product

ViewPulse is a privacy-first, client-side YouTube watch history analyzer. All data processing happens in the browser — no backend, no database, no data collection.

### Key Features
- Upload watch history HTML/JSON export
- Interactive dashboard with engagement metrics
- Category/channel analytics
- Time-based patterns
- No data leaves the browser

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Client-side only (no server)
- Deployment: Coolify + Docker

## Stage Artifacts (Launch)

### What's Done ✅
- Production deployment
- Core analytics dashboard
- Privacy-first architecture
- Social media accounts

### What's Needed Next
- User feedback loop
- Feature prioritization
- Growth experiments
- Distribution channels

## Skills Available

From the global skills repo:
- `frontend-design` — UI/UX improvements
- `shadcn` — component library
- `next-best-practices` — Next.js optimization
- `playwright-best-practices` — testing
- `security-best-practices` — security audit
- `coolify-manager` — deployment management
- `find-skills` — discover new skills
- `skill-creator` — create new skills

## Prohibited

- Any backend/server dependencies (client-side only)
- Data collection or tracking
- Breaking privacy guarantees
- Adding dependencies that require server-side rendering

## Workspace Structure

```
youtube-analytic/          # ViewPulse repo
├── .viewpulse/           # AI steering (this file + plugin.json)
├── docs/
│   ├── business_stages/  # Stage-specific artifacts
│   ├── operations/       # Running the startup
│   ├── technology/       # Tech decisions
│   └── growth/          # Marketing & distribution
├── app/                  # Next.js app
├── components/           # React components
├── lib/                  # Utilities
└── docker/               # Deployment configs
```
