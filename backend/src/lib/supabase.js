const { createClient } = require('@supabase/supabase-js');

const { SUPABASE_URL, SUPABASE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_KEY');
  console.error('Copia backend/.env.example a backend/.env y completa los valores.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

module.exports = { supabase };
