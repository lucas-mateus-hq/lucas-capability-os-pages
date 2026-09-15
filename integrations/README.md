# Personal integrations

## Google Calendar

Source of truth: `automation/calendar/events.json`.

Each event must contain `id`, `title`, `start`, and `end`. Use RFC3339 timestamps with an explicit offset, for example `2026-09-18T19:00:00-03:00`.

GitHub Actions runs `scripts/sync-calendar.mjs` and sends the validated payload to the Apps Script web app in `integrations/google-calendar/`.

Required GitHub repository secrets:

- `CALENDAR_WEBHOOK_URL`
- `CALENDAR_WEBHOOK_TOKEN`

Required Apps Script properties:

- `CAPLAB_SHARED_TOKEN` — same value as `CALENDAR_WEBHOOK_TOKEN`
- `TARGET_CALENDAR_ID` — optional; omit to use the primary calendar

Deploy the Apps Script project as a Web App executing as the deploying user. The shared token is checked before any calendar mutation.

## LinkedIn

`scripts/publish-linkedin.mjs` implements the LinkedIn Posts API client. It only publishes JSON files explicitly marked with `publish: true`, and requires OAuth credentials at runtime.

Expected environment variables:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN`
- `LINKEDIN_API_VERSION` — optional; defaults to `202606`

The LinkedIn executable workflow is intentionally not enabled until OAuth is configured. Keep tokens only in GitHub Secrets, never in repository files.

## Search discovery

`public/robots.txt` points crawlers to `public/sitemap.xml`. The initial sitemap lists only the indexable professional portfolio; the project home remains intentionally `noindex` until its publication policy changes.
