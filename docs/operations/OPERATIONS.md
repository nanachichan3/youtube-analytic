# Operations — ViewPulse

## Deployment

**Platform:** Coolify
**Region:** Unknown (Cloud provider)
**URL:** https://viewpulse.xyz (or similar)

## Maintenance

### Regular Tasks
| Task | Frequency | Owner |
|------|-----------|-------|
| Dependency updates | Weekly | CTO |
| Monitor uptime | Daily | Heartbeat |
| YouTube export format changes | As needed | CTO |

### Known Fragilities
1. **YouTube export format changes** — Parser breaks
2. **Browser compatibility** — CSS assumes modern browser
3. **Large file handling** — No progress indicator

## Support

### User Issues
- Privacy questions → Direct to docs
- Parser errors → GitHub issues
- Feature requests → GitHub discussions

### No Current Support Infrastructure
- No email support
- No status page
- No bug bounty program

## Security

### Privacy Guarantees
1. **No data collection** — Nothing sent to any server
2. **No cookies** — No tracking
3. **No analytics** — No third-party scripts
4. **Open source** — Code can be audited

### Audit Needed
- [ ] Security best practices review
- [ ] Dependency audit
- [ ] CSP headers review

## Environment Variables

```bash
# None required — client-side only!
# Next.js public vars are in .env (committed)
NEXT_PUBLIC_GITHUB_URL=https://github.com/nanachichan3/youtube-analytic
```
