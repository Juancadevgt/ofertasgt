const { supabase } = require('../lib/supabase');
const { sendMessage } = require('../lib/telegram');

// Reenvía como máximo 1 alerta por usuario+producto cada N horas
const COOLDOWN_HORAS = 24;

async function checkAlertas() {
  const { data: alertas, error } = await supabase
    .from('alertas')
    .select('id, producto_id, usuario_telegram_id, precio_objetivo, last_notified_at, last_notified_price, producto:productos(nombre, marca, unidad)')
    .eq('activa', true);

  if (error) throw error;
  if (!alertas || !alertas.length) {
    console.log('[alertas] no hay alertas activas');
    return { revisadas: 0, enviadas: 0 };
  }

  let enviadas = 0;
  const ahora = new Date();

  for (const a of alertas) {
    // Obtener la mejor oferta activa para este producto
    const { data: ofertas } = await supabase
      .from('vista_ofertas')
      .select('precio_oferta, supermercado_nombre, semaforo, descuento_pct')
      .eq('producto_id', a.producto_id).eq('activa', true)
      .order('precio_oferta', { ascending: true }).limit(1);

    const mejor = ofertas?.[0];
    if (!mejor) continue;

    // ¿Debemos notificar?
    const cumpleObjetivo = a.precio_objetivo == null
      ? (a.last_notified_price == null || Number(mejor.precio_oferta) < Number(a.last_notified_price))
      : Number(mejor.precio_oferta) <= Number(a.precio_objetivo);

    const cooldownOk = !a.last_notified_at ||
      (ahora.getTime() - new Date(a.last_notified_at).getTime()) > COOLDOWN_HORAS * 3600 * 1000;

    if (!cumpleObjetivo || !cooldownOk) continue;

    const nombre = a.producto?.nombre + (a.producto?.marca ? ` · ${a.producto.marca}` : '');
    const emoji = mejor.semaforo === 'verde' ? '🟢' : mejor.semaforo === 'amarillo' ? '🟡' : '🔴';
    const msg =
      `${emoji} *Bajó el precio*\n\n` +
      `*${nombre}* (${a.producto?.unidad})\n` +
      `Ahora a *Q${mejor.precio_oferta}* en ${mejor.supermercado_nombre}\n` +
      (mejor.descuento_pct > 0 ? `Descuento: ${Math.round(mejor.descuento_pct)}%` : '');

    try {
      await sendMessage(a.usuario_telegram_id, msg);
      await supabase.from('alertas').update({
        last_notified_at: ahora.toISOString(),
        last_notified_price: mejor.precio_oferta,
      }).eq('id', a.id);
      enviadas += 1;
    } catch (err) {
      console.error(`[alertas] error enviando a ${a.usuario_telegram_id}:`, err.message);
    }
  }

  console.log(`[alertas] revisadas=${alertas.length} enviadas=${enviadas}`);
  return { revisadas: alertas.length, enviadas };
}

module.exports = { checkAlertas };
