const SYNC_MARKER_PREFIX = 'GITHUB_SYNC_ID:';
const MAX_EVENTS_PER_SYNC = 50;

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Capability Lab · Calendar Bridge')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getBridgeStatus() {
  const props = PropertiesService.getScriptProperties();
  const tokenConfigured = Boolean(props.getProperty('CAPLAB_SHARED_TOKEN'));
  const calendarId = props.getProperty('TARGET_CALENDAR_ID') || 'primary';
  let calendarReachable = false;
  try {
    const calendar = calendarId === 'primary'
      ? CalendarApp.getDefaultCalendar()
      : CalendarApp.getCalendarById(calendarId);
    calendarReachable = Boolean(calendar);
  } catch (err) {
    calendarReachable = false;
  }

  return {
    ready: tokenConfigured && calendarReachable,
    tokenConfigured: tokenConfigured,
    calendarReachable: calendarReachable,
    targetMode: calendarId === 'primary' ? 'primary' : 'custom',
    timezone: Session.getScriptTimeZone(),
    writesFromUi: false
  };
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const expected = PropertiesService.getScriptProperties().getProperty('CAPLAB_SHARED_TOKEN');
    if (!expected || body.token !== expected) return json_({ ok: false, error: 'unauthorized' });
    if (body.source !== 'github') return json_({ ok: false, error: 'invalid source' });
    if (!Array.isArray(body.events)) return json_({ ok: false, error: 'events must be an array' });
    if (body.events.length > MAX_EVENTS_PER_SYNC) return json_({ ok: false, error: 'too many events in one sync' });

    const calendarId = PropertiesService.getScriptProperties().getProperty('TARGET_CALENDAR_ID') || 'primary';
    const calendar = calendarId === 'primary'
      ? CalendarApp.getDefaultCalendar()
      : CalendarApp.getCalendarById(calendarId);
    if (!calendar) return json_({ ok: false, error: 'calendar not found' });

    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) return json_({ ok: false, error: 'bridge busy' });
    try {
      const results = body.events.map(event => upsertEvent_(calendar, event));
      return json_({ ok: true, count: results.length, results: results });
    } finally {
      lock.releaseLock();
    }
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
    description: description,
    location: event.location || ''
  });
  return { id: event.id, action: 'created', calendarEventId: created.getId() };
}

function json_(payload) {
  const out = ContentService.createTextOutput(JSON.stringify(payload));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

// Read-only GET UX + token-gated POST sync. The browser UI never exposes credentials, event data, or mutation controls.
