const STORAGE_KEY = 'caplab.relay.self.v1';
const SESSION_KEY = 'caplab.relay.fast_session.v1';
const SESSION_TTL_MS = 30 * 60 * 1000;
const PBKDF2_ITERATIONS = 250000;
const MAX_MESSAGE_LENGTH = 4000;
const ALLOWED_HANDOFF_KEYS = new Set(['m', 'text']);
const FORBIDDEN_DESTINATION_KEYS = new Set([
  'phone', 'phoneNumber', 'number', 'recipient', 'destination', 'jid', 'chat', 'contact',
]);
const enc = new TextEncoder();
const dec = new TextDecoder();

const $ = (id) => document.getElementById(id);
const phoneInput = $('phone');
const bindPinInput = $('bind-pin');
const sendPinInput = $('send-pin');
const messageInput = $('message');
const bindingStatus = $('binding-status');
const sendStatus = $('send-status');
const fastSessionInput = $('fast-session');

let handoffAutostartPending = false;

function setStatus(node, text, kind = '') {
  node.textContent = text;
  node.dataset.kind = kind;
}

function normalizePhone(value) {
  const phone = String(value || '').replace(/\D/g, '');
  if (!/^[1-9]\d{7,14}$/.test(phone)) throw new Error('PHONE_INVALID');
  return phone;
}

function validatePin(value) {
  const pin = String(value || '');
  if (pin.length < 6) throw new Error('PIN_TOO_SHORT');
  return pin;
}

function validateMessage(value) {
  const message = String(value || '').trim();
  if (!message) throw new Error('MESSAGE_REQUIRED');
  if (message.length > MAX_MESSAGE_LENGTH) throw new Error('MESSAGE_TOO_LONG');
  return message;
}

function b64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromB64url(value) {
  const normalized = String(value).replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

async function deriveKey(pin, salt) {
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

async function createEncryptedBinding(phone, pin) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(phone),
  ));
  return {
    version: 1,
    kdf: 'PBKDF2-SHA256',
    iterations: PBKDF2_ITERATIONS,
    cipher: 'AES-256-GCM',
    salt: b64url(salt),
    iv: b64url(iv),
    ciphertext: b64url(ciphertext),
    createdAt: new Date().toISOString(),
  };
}

function readBinding() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error('BINDING_MISSING');
  const record = JSON.parse(raw);
  if (
    record?.version !== 1 ||
    record?.kdf !== 'PBKDF2-SHA256' ||
    record?.cipher !== 'AES-256-GCM' ||
    record?.iterations !== PBKDF2_ITERATIONS ||
    !record?.salt || !record?.iv || !record?.ciphertext
  ) throw new Error('BINDING_INVALID');
  return record;
}

async function decryptPhone(pin) {
  const record = readBinding();
  const salt = fromB64url(record.salt);
  const iv = fromB64url(record.iv);
  const ciphertext = fromB64url(record.ciphertext);
  const key = await deriveKey(pin, salt);
  const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return normalizePhone(dec.decode(clear));
}

function bindingExists() {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}

function clearFastSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function saveFastSession(phone) {
  const record = {
    version: 1,
    phone: normalizePhone(phone),
    expiresAt: Date.now() + SESSION_TTL_MS,
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(record));
}

function readFastSessionPhone() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return '';
    const record = JSON.parse(raw);
    if (record?.version !== 1 || !Number.isFinite(record?.expiresAt) || record.expiresAt <= Date.now()) {
      clearFastSession();
      return '';
    }
    return normalizePhone(record.phone);
  } catch {
    clearFastSession();
    return '';
  }
}

function refreshBindingStatus() {
  if (bindingExists()) {
    const fast = Boolean(readFastSessionPhone());
    setStatus(
      bindingStatus,
      fast
        ? 'Vínculo local encontrado. Sessão rápida ativa por até 30 minutos nesta aba/sessão do navegador.'
        : 'Vínculo local encontrado. O número armazenado está criptografado.',
      'ok',
    );
  } else {
    setStatus(bindingStatus, 'Nenhum vínculo local salvo neste navegador.');
  }
}

function buildWhatsAppDestination(phone, message) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(validateMessage(message))}`;
}

function openWhatsApp(phone, message) {
  setStatus(sendStatus, 'Abrindo seu WhatsApp. O envio final continua manual.', 'ok');
  window.location.assign(buildWhatsAppDestination(phone, message));
}

function parseHandoffFragment() {
  const rawFragment = location.hash.slice(1);
  if (!rawFragment) return null;

  history.replaceState(null, '', location.pathname + location.search);

  const params = new URLSearchParams(rawFragment);
  const keys = [...params.keys()];

  if (keys.some((key) => FORBIDDEN_DESTINATION_KEYS.has(key))) {
    throw new Error('DESTINATION_OVERRIDE_FORBIDDEN');
  }
  if (keys.some((key) => !ALLOWED_HANDOFF_KEYS.has(key))) {
    throw new Error('HANDOFF_FIELD_FORBIDDEN');
  }

  const packed = params.get('m');
  const plain = params.get('text');
  if (packed && plain) throw new Error('AMBIGUOUS_MESSAGE_INPUT');

  let text = '';
  if (packed) text = dec.decode(fromB64url(packed));
  else if (plain) text = plain;
  else return null;

  return validateMessage(text);
}

function loadMessageFromFragment() {
  try {
    const text = parseHandoffFragment();
    if (!text) return;

    messageInput.value = text;
    const fastPhone = readFastSessionPhone();
    if (fastPhone) {
      handoffAutostartPending = false;
      setStatus(sendStatus, 'Handoff válido recebido. Sessão rápida ativa; abrindo seu WhatsApp automaticamente.', 'ok');
      window.setTimeout(() => openWhatsApp(fastPhone, text), 40);
      return;
    }

    handoffAutostartPending = true;
    setStatus(
      sendStatus,
      'Mensagem recebida da IA. Digite seu PIN uma vez; se ativar a sessão rápida, próximos handoffs desta sessão irão direto ao WhatsApp.',
      'ok',
    );
    sendPinInput.focus();
  } catch (error) {
    const code = error?.message || 'HANDOFF_INVALID';
    handoffAutostartPending = false;
    if (code === 'DESTINATION_OVERRIDE_FORBIDDEN' || code === 'HANDOFF_FIELD_FORBIDDEN') {
      setStatus(sendStatus, 'Link rejeitado: a IA só pode preencher a mensagem, nunca o destinatário.', 'error');
    } else {
      setStatus(sendStatus, 'Não foi possível ler a mensagem do link. Cole o texto manualmente.', 'error');
    }
  }
}

$('save-binding').addEventListener('click', async () => {
  let phone = '';
  let pin = '';
  try {
    setStatus(bindingStatus, 'Criptografando vínculo local...');
    phone = normalizePhone(phoneInput.value);
    pin = validatePin(bindPinInput.value);
    const record = await createEncryptedBinding(phone, pin);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    clearFastSession();
    phoneInput.value = '';
    bindPinInput.value = '';
    setStatus(bindingStatus, 'Vínculo salvo. O telefone em texto puro não foi persistido.', 'ok');
  } catch (error) {
    const code = error?.message || 'BINDING_ERROR';
    setStatus(bindingStatus, code === 'PHONE_INVALID' ? 'Número inválido. Use DDI + DDD + número, somente dígitos.' : code === 'PIN_TOO_SHORT' ? 'Use um PIN com pelo menos 6 caracteres.' : 'Falha ao salvar o vínculo local.', 'error');
  } finally {
    phone = '';
    pin = '';
  }
});

$('clear-binding').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  clearFastSession();
  phoneInput.value = '';
  bindPinInput.value = '';
  sendPinInput.value = '';
  refreshBindingStatus();
});

$('clear-session').addEventListener('click', () => {
  clearFastSession();
  fastSessionInput.checked = false;
  refreshBindingStatus();
  setStatus(sendStatus, 'Sessão rápida encerrada.', 'ok');
});

$('send').addEventListener('click', async () => {
  let phone = '';
  let pin = '';
  try {
    const message = validateMessage(messageInput.value);
    phone = readFastSessionPhone();

    if (!phone) {
      pin = validatePin(sendPinInput.value);
      setStatus(sendStatus, 'Desbloqueando destino local...');
      phone = await decryptPhone(pin);
      if (fastSessionInput.checked) saveFastSession(phone);
    }

    sendPinInput.value = '';
    handoffAutostartPending = false;
    openWhatsApp(phone, message);
  } catch (error) {
    const code = error?.message || 'RELAY_ERROR';
    if (code === 'BINDING_MISSING') setStatus(sendStatus, 'Crie primeiro o vínculo local do seu WhatsApp.', 'error');
    else if (code === 'MESSAGE_REQUIRED') setStatus(sendStatus, 'Digite ou cole uma mensagem.', 'error');
    else if (code === 'MESSAGE_TOO_LONG') setStatus(sendStatus, `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.`, 'error');
    else if (code === 'PIN_TOO_SHORT') setStatus(sendStatus, 'PIN inválido.', 'error');
    else setStatus(sendStatus, 'Não foi possível desbloquear o vínculo. Confira o PIN.', 'error');
  } finally {
    phone = '';
    pin = '';
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(() => {
    setStatus(sendStatus, 'O modo de compartilhamento do dispositivo não pôde ser ativado. O handoff por link continua disponível.', 'error');
  });
}

window.addEventListener('hashchange', loadMessageFromFragment);
refreshBindingStatus();
loadMessageFromFragment();

// O que isso faz: mantém o self-destination criptografado localmente, adiciona uma sessão rápida temporária para handoffs repetidos, abre automaticamente o WhatsApp quando um handoff válido chega durante essa sessão e preserva o envio final manual.
