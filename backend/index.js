require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY, PORT = 3000 } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_KEY');
  console.error('Copia backend/.env.example a backend/.env y completa los valores.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    name: 'Ofertas GT API',
    status: 'ok',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/ofertas', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('ofertas')
      .select('*')
      .order('fecha_inicio', { ascending: false })
      .limit(50);

    if (error) return next(error);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

app.get('/api/productos', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = supabase.from('productos').select('*').limit(50);
    if (search) query = query.ilike('nombre', `%${search}%`);

    const { data, error } = await query;
    if (error) return next(error);
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
