require('dotenv').config();

const express = require('express');
const cors = require('cors');

const ofertas         = require('./src/routes/ofertas');
const productos       = require('./src/routes/productos');
const supermercados   = require('./src/routes/supermercados');
const categorias      = require('./src/routes/categorias');
const alertas         = require('./src/routes/alertas');
const telegramWebhook = require('./src/routes/telegramWebhook');

const { PORT = 3000 } = process.env;

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ name: 'Ofertas GT API', status: 'ok', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/ofertas',       ofertas);
app.use('/api/productos',     productos);
app.use('/api/supermercados', supermercados);
app.use('/api/categorias',    categorias);
app.use('/api/alertas',       alertas);
app.use('/api/telegram',      telegramWebhook);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
