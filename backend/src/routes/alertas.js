const { Router } = require('express');
const { supabase } = require('../lib/supabase');
const asyncHandler = require('../lib/asyncHandler');

const router = Router();

// POST /api/alertas
// body: { producto_id, usuario_telegram_id, precio_objetivo? }
router.post('/', asyncHandler(async (req, res) => {
  const { producto_id, usuario_telegram_id, precio_objetivo } = req.body || {};
  if (!producto_id || !usuario_telegram_id) {
    return res.status(400).json({ error: 'producto_id y usuario_telegram_id son requeridos' });
  }

  const { data, error } = await supabase
    .from('alertas')
    .upsert(
      { producto_id, usuario_telegram_id, precio_objetivo: precio_objetivo ?? null, activa: true },
      { onConflict: 'producto_id,usuario_telegram_id' }
    )
    .select()
    .single();

  if (error) throw error;
  res.status(201).json({ data });
}));

// DELETE /api/alertas/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('alertas').update({ activa: false }).eq('id', req.params.id);
  if (error) throw error;
  res.status(204).end();
}));

module.exports = router;
