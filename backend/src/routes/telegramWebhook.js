const { Router } = require('express');
const { supabase } = require('../lib/supabase');
const { sendMessage } = require('../lib/telegram');
const asyncHandler = require('../lib/asyncHandler');

const router = Router();

const SECRET_HEADER = 'x-telegram-bot-api-secret-token';

/**
 * Webhook que Telegram llama cuando un usuario envía un mensaje al bot.
 * Configurar una sola vez:
 *   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *     -d "url=https://tu-backend.onrender.com/api/telegram/webhook&secret_token=<TU_SECRETO>"
 */
router.post('/webhook', asyncHandler(async (req, res) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers[SECRET_HEADER] !== secret) {
    return res.status(401).end();
  }

  const update = req.body || {};
  const message = update.message;
  if (!message || !message.text) return res.status(200).end();

  const chatId = String(message.chat.id);
  const text = message.text.trim();

  if (text === '/start' || text === '/ayuda') {
    await sendMessage(chatId,
      '👋 *Bienvenido a Ofertas GT*\n\n' +
      'Te aviso cuando un producto que te interesa baje de precio en Walmart, Maxi Despensa, La Torre o Paiz.\n\n' +
      '*Comandos:*\n' +
      '• Escribe el nombre de un producto para buscarlo (ej: `frijol`)\n' +
      '• `/mis_alertas` — ver tus suscripciones\n' +
      '• `/ayuda` — este mensaje');
    return res.status(200).end();
  }

  if (text === '/mis_alertas') {
    const { data } = await supabase
      .from('alertas')
      .select('id, precio_objetivo, producto:productos(nombre, marca)')
      .eq('usuario_telegram_id', chatId)
      .eq('activa', true);
    if (!data || !data.length) {
      await sendMessage(chatId, 'No tienes alertas activas. Busca un producto y suscríbete.');
    } else {
      const lines = data.map((a) => {
        const nombre = a.producto?.nombre + (a.producto?.marca ? ` · ${a.producto.marca}` : '');
        const obj = a.precio_objetivo ? ` (objetivo: Q${a.precio_objetivo})` : '';
        return `• ${nombre}${obj}`;
      });
      await sendMessage(chatId, '*Tus alertas activas:*\n' + lines.join('\n'));
    }
    return res.status(200).end();
  }

  // Búsqueda libre: tratamos el texto como término de búsqueda
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, marca, unidad')
    .ilike('nombre', `%${text}%`)
    .limit(5);

  if (!productos || !productos.length) {
    await sendMessage(chatId, `No encontré productos para "${text}". Prueba con otro nombre.`);
    return res.status(200).end();
  }

  const lines = await Promise.all(productos.map(async (p) => {
    const { data: ofertas } = await supabase
      .from('vista_ofertas')
      .select('precio_oferta, supermercado_nombre, semaforo')
      .eq('producto_id', p.id).eq('activa', true)
      .order('precio_oferta', { ascending: true }).limit(1);
    const mejor = ofertas?.[0];
    const marca = p.marca ? ` · ${p.marca}` : '';
    if (mejor) {
      const emoji = mejor.semaforo === 'verde' ? '🟢' : mejor.semaforo === 'amarillo' ? '🟡' : '🔴';
      return `${emoji} *${p.nombre}*${marca}\n    Q${mejor.precio_oferta} en ${mejor.supermercado_nombre}`;
    }
    return `⚪ *${p.nombre}*${marca}\n    Sin ofertas activas`;
  }));

  await sendMessage(chatId, lines.join('\n\n'));
  res.status(200).end();
}));

module.exports = router;
