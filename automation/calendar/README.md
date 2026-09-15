# Calendar input

Edit `events.json` and commit. The GitHub workflow validates the file and, once the repository secrets are configured, synchronizes it to Google Calendar.

Example event object:

```json
{
  "id": "study-karpathy-001",
  "title": "Study — Neural Networks",
  "start": "2026-09-18T19:00:00-03:00",
  "end": "2026-09-18T20:30:00-03:00",
  "description": "Self-study block",
  "location": ""
}
```

Keep `id` stable. The Apps Script bridge uses it as the idempotency marker when updating an existing event.
