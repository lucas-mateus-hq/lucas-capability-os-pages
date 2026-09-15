import { readFile } from 'node:fs/promises';

const file = process.argv[2] || 'automation/calendar/events.json';
const raw = await readFile(file, 'utf8');
const payload = JSON.parse(raw);

if (!Array.isArray(payload.events)) throw new Error('events must be an array');

const ids = new Set();
for (const event of payload.events) {
  for (const key of ['id', 'title', 'start', 'end']) {
    if (!event[key] || typeof event[key] !== 'string') throw new Error(`event missing string field: ${key}`);
  }
  if (ids.has(event.id)) throw new Error(`duplicate event id: ${event.id}`);
  ids.add(event.id);

  const start = new Date(event.start);
  const end = new Date(event.end);
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) throw new Error(`invalid date in event ${event.id}`);
  if (end <= start) throw new Error(`end must be after start for ${event.id}`);
}

const url = process.env.CALENDAR_WEBHOOK_URL;
const token = process.env.CALENDAR_WEBHOOK_TOKEN;
if (!url || !token) {
  console.log(`Validated ${payload.events.length} event(s). Calendar secrets are not configured; sync skipped.`);
  process.exit(0);
}

const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ token, source: 'github', events: payload.events })
});

const text = await response.text();
if (!response.ok) throw new Error(`calendar webhook HTTP ${response.status}: ${text}`);

let result;
try {
  result = JSON.parse(text);
} catch {
  throw new Error(`calendar webhook returned non-JSON response: ${text}`);
}

if (result?.ok !== true) {
  throw new Error(`calendar sync rejected: ${result?.error || 'unknown error'}`);
}

console.log(JSON.stringify(result));
