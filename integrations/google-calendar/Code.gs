const SYNC_MARKER_PREFIX = 'GITHUB_SYNC_ID:';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('CAPLAB_SHARED_TOKEN');
    if (!expected || body.token !== expected) return json_({ ok: false, error: 'unauthorized' });
    if (!Array.isArray(body.events)) return json_({ ok: false, error: 'events must be an array' });

    const calendarId = PropertiesService.getScriptProperties().getProperty('TARGET_CALENDAR_ID') || 'primary';
    const calendar = calendarId === 'primary'
      ? CalendarApp.getDefaultCalendar()
      : CalendarApp.getCalendarById(calendarId);
    if (!calendar) return json_({ ok: false, error: 'calendar not found' });

    const results = body.events.map(event => upsertEvent_(calendar, event));
    return json_({ ok: true, count: results.length, results });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function upsertEvent_(calendar, event) {
  ['id', 'title', 'start', 'end'].forEach(key => {
    if (!event[key] || typeof event[key] !== 'string') throw new Error('invalid event field: ' + key);
  });

  const start = new Date(event.start);
  const end = new Date(event.end);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) throw new Error('invalid event dates: ' + event.id);

  const marker = SYNC_MARKER_PREFIX + event.id;
  const searchStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
  const searchEnd = new Date(end.getTime() + 7 * 24 * 60 * 60 * 1000);
  const matches = calendar.getEvents(searchStart, searchEnd, { search: marker });
  const description = [event.description || '', marker, 'SOURCE:github'].filter(Boolean).join('\n\n');

  if (matches.length > 0) {
    const existing = matches[0];
    existing.setTitle(event.title);
    existing.setTime(start, end);
    existing.setDescription(description);
    existing.setLocation(event.location || '');
    return { id: event.id, action: 'updated', calendarEventId: existing.getId() };
  }

  const created = calendar.createEvent(event.title, start, end, {
    description,
    location: event.location || ''
  });
  return { id: event.id, action: 'created', calendarEventId: created.getId() };
}

function json_(payload) {
  const out = ContentService.createTextOutput(JSON.stringify(payload));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
