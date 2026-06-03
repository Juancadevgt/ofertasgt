const { Router } = require('express');
const { supabase } = require('../lib/supabase');
const asyncHandler = require('../lib/asyncHandler');

const router = Router();

// GET /api/productos?search=frijol&categoria=granos&canasta=1
router.get('/', asyncHandler(async (req, res) => {
  const { search, categoria, canasta, limit = 50 } = req.query;

  let query = supabase
    .from('productos')
    .select('*, categoria:categorias(id, nombre, slug, icono)')
    .order('nombre', { ascending: true })
    .limit(Math.min(Number(limit) || 50, 200));

  if (search)   query = query.ilike('nombre', `%${search}%`);
  if (canasta)  query = query.eq('es_canasta_basica', true);
  if (categoria) {
    const { data: cat } = await supabase
      .from('categorias').select('id').eq('slug', categoria).maybeSingle();
    if (cat) query = query.eq('categoria_id', cat.id);
    else return res.json({ data: [], total: 0 });
  }

  const { data, error } = await query;
  if (error) throw error;
  res.json({ data, total: data.length });
}));

// GET /api/productos/:id  → detalle del producto + ofertas activas + historial
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [{ data: producto, error: e1 },
         { data: ofertas, error: e2 },
         { data: historial, error: e3 }] = await Promise.all([
    supabase.from('productos')
      .select('*, categoria:categorias(id, nombre, slug, icono)')
      .eq('id', id).maybeSingle(),
    supabase.from('vista_ofertas')
      .select('*').eq('producto_id', id).eq('activa', true)
      .order('precio_oferta', { ascending: true }),
    supabase.from('historial_precios')
      .select('precio, fecha, es_oferta, supermercado_id, supermercado:supermercados(nombre, slug)')
      .eq('producto_id', id)
      .gte('fecha', new Date(Date.now() - 730 * 86400000).toISOString().slice(0, 10))
      .order('fecha', { ascending: true }),
  ]);

  if (e1 || e2 || e3) throw e1 || e2 || e3;
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  res.json({ data: { producto, ofertas: ofertas || [], historial: historial || [] } });
}));

module.exports = router;
