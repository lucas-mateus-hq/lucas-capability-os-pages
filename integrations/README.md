# Personal integrations

## Google Calendar

Source of truth: `automation/calendar/events.json`.

Each event must contain `id`, `title`, `start`, and `end`. Use RFC3339 timestamps with an explicit offset, for example `2026-09-18T19:00:00-03:00`.

GitHub Actions runs `scripts/sync-calendar.mjs` and sends the validated payload to the Apps Script web app in `integrations/google-calendar/`.

### Apps Script deployment

The Apps Script project contains:

- `Code.gs` — token-gated sync endpoint plus read-only health/status API;
- `Index.html` — bilingual PT/EN operator status surface; it exposes no event data, calendar ID or credential values;
- `appsscript.json` — V8 web-app configuration.

Deploy the project as a **Web App** executing as the deploying user. Anonymous web access is required for the GitHub webhook path; write access remains protected by the shared token checked inside `doPost()`.

Required Apps Script properties:

- `CAPLAB_SHARED_TOKEN` — long random secret; must match `CALENDAR_WEBHOOK_TOKEN` in GitHub;
- `TARGET_CALENDAR_ID` — optional; omit to use the primary calendar.

Required GitHub repository secrets:

- `CALENDAR_WEBHOOK_URL` — deployed Apps Script `/exec` URL;
- `CALENDAR_WEBHOOK_TOKEN` — same value as `CAPLAB_SHARED_TOKEN`.

### Human-facing status UX

Opening the deployed `/exec` URL shows a read-only status screen. It checks only:

- whether a shared token is configured;
- whether the target calendar is reachable;
- whether the target mode is primary or custom.

The browser UI cannot create, update or delete events. It never returns token values, calendar IDs, event titles, descriptions or participant information.

A **Ready / Ponte pronta** status proves only the Apps Script side is configured. GitHub Secrets must still be configured separately before automated sync can run.

## LinkedIn

`scripts/publish-linkedin.mjs` implements the LinkedIn Posts API client. It only publishes JSON files explicitly marked with `publish: true`, and requires OAuth credentials at runtime.

Expected environment variables:

- `LINKEDIN_ACCESS_TOKEN`
- `LINKEDIN_AUTHOR_URN`
- `LINKEDIN_API_VERSION` — optional; defaults to `202608`

The LinkedIn executable workflow is intentionally not enabled until OAuth is configured. Keep tokens only in GitHub Secrets, never in repository files.

## Search discovery

`public/robots.txt` points crawlers to `public/sitemap.xml`. The initial sitemap lists only the indexable professional portfolio; the project home remains intentionally `noindex` until its publication policy changes.
