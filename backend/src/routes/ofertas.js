const { Router } = require('express');
const { supabase } = require('../lib/supabase');
const asyncHandler = require('../lib/asyncHandler');

const router = Router();

// GET /api/ofertas
// Filtros opcionales: ?super=walmart&categoria=granos&search=frijol&semaforo=verde&canasta=1&limit=50
router.get('/', asyncHandler(async (req, res) => {
  const {
    super: superSlug,
    categoria,
    search,
    semaforo,
    canasta,
    limit = 50,
  } = req.query;

  let query = supabase
    .from('vista_ofertas')
    .select('*')
    .eq('activa', true)
    .order('descuento_pct', { ascending: false })
    .limit(Math.min(Number(limit) || 50, 200));

  if (superSlug)  query = query.eq('supermercado_slug', superSlug);
  if (categoria)  query = query.eq('categoria_slug', categoria);
  if (semaforo)   query = query.eq('semaforo', semaforo);
  if (canasta)    query = query.eq('es_canasta_basica', true);
  if (search)     query = query.ilike('producto_nombre', `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  res.json({ data, total: data.length });
}));

// GET /api/ofertas/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('vista_ofertas')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return res.status(404).json({ error: 'Oferta no encontrada' });
  res.json({ data });
}));

module.exports = router;
