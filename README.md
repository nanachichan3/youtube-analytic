# YouTube Analytics (Standalone-ready)

This app lives in `apps/youtube-analytics` but is built as an independent project.

## Goals

- Next.js App Router architecture
- SEO-optimized, multi-page structure for YouTube analytics use cases
- No local monorepo libraries (`workspace:*` dependencies)
- Promotional links to Self Degree

## Run

```bash
pnpm --filter youtube-analytics-site dev
```

## Environment

Set your repository URL so all GitHub links render correctly:

```bash
NEXT_PUBLIC_GITHUB_URL=https://github.com/your-org/your-repo
```

## Suggested extraction to separate git repo

1. Copy this folder as-is.
2. Run `pnpm install` in the new repository.
3. Update `site.url` in `lib/seo.ts` to your final production domain.
