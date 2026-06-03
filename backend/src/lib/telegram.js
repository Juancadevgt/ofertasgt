const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = TOKEN ? `https://api.telegram.org/bot${TOKEN}` : null;

function ensureToken() {
  if (!API) throw new Error('Falta TELEGRAM_BOT_TOKEN en el entorno');
}

async function sendMessage(chatId, text, opts = {}) {
  ensureToken();
  const res = await fetch(`${API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      ...opts,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram sendMessage falló (${res.status}): ${body}`);
  }
  return res.json();
}

module.exports = { sendMessage };
