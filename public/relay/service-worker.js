const MAX_MESSAGE_LENGTH = 4000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

function sanitizeSharedText(form) {
  const parts = [];
  for (const key of ['title', 'text', 'url']) {
    const value = form.get(key);
    if (typeof value === 'string' && value.trim()) parts.push(value.trim());
  }
  const message = parts.join('\n\n').trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return '';
  return message;
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isShareTarget = event.request.method === 'POST' && url.pathname.endsWith('/relay/share-target');
  if (!isShareTarget) return;

  event.respondWith((async () => {
    try {
      const form = await event.request.formData();
      const message = sanitizeSharedText(form);
      if (!message) return Response.redirect('./', 303);
      return Response.redirect(`./#text=${encodeURIComponent(message)}`, 303);
    } catch {
      return Response.redirect('./', 303);
    }
  })());
});

// O que isso faz: intercepta localmente o POST do Web Share Target e converte o conteúdo compartilhado em fragmento de mensagem, sem aceitar nem criar campo de destinatário.
