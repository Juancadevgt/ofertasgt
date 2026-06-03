const { Router } = require('express');
const { supabase } = require('../lib/supabase');
const asyncHandler = require('../lib/asyncHandler');

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('supermercados')
    .select('*')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  res.json({ data });
}));

module.exports = router;
