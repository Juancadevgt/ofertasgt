-- ============================================================
-- Ofertas Guatemala — Datos de muestra (seed)
-- ============================================================
-- Corre este archivo DESPUES de schema.sql.
-- Sirve para tener datos de ejemplo mientras el scraper aún no corre.
-- Es idempotente: usa ON CONFLICT para no duplicar.
-- ============================================================

-- ------------------------------------------------------------
-- Supermercados
-- ------------------------------------------------------------
insert into public.supermercados (nombre, slug, sitio_web) values
  ('Walmart',        'walmart',        'https://www.walmart.com.gt'),
  ('Maxi Despensa',  'maxi-despensa',  'https://www.maxidespensa.com.gt'),
  ('La Torre',       'la-torre',       'https://www.superlatorre.com'),
  ('Paiz',           'paiz',           'https://www.walmart.com.gt')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Categorias
-- ------------------------------------------------------------
insert into public.categorias (nombre, slug, icono, orden) values
  ('Granos basicos',     'granos',          '🌾', 1),
  ('Lacteos',            'lacteos',         '🥛', 2),
  ('Carnes y pollo',     'carnes',          '🍗', 3),
  ('Frutas y verduras',  'frutas-verduras', '🥕', 4),
  ('Abarrotes',          'abarrotes',       '🧂', 5),
  ('Panaderia',          'panaderia',       '🥖', 6),
  ('Bebidas',            'bebidas',         '🥤', 7),
  ('Limpieza del hogar', 'limpieza',        '🧼', 8)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Productos de canasta basica
-- ------------------------------------------------------------
with cat as (select id, slug from public.categorias)
insert into public.productos (nombre, marca, categoria_id, unidad, es_canasta_basica)
select * from (values
  ('Frijol negro',        null,          (select id from cat where slug='granos'),          'libra', true),
  ('Arroz blanco',        null,          (select id from cat where slug='granos'),          'libra', true),
  ('Maiz blanco',         null,          (select id from cat where slug='granos'),          'libra', true),
  ('Azucar blanca',       null,          (select id from cat where slug='abarrotes'),       'libra', true),
  ('Aceite vegetal',      'Capullo',     (select id from cat where slug='abarrotes'),       'litro', true),
  ('Leche entera',        'Foremost',    (select id from cat where slug='lacteos'),         'litro', true),
  ('Huevos blancos',      null,          (select id from cat where slug='lacteos'),         'docena', true),
  ('Pollo entero',        null,          (select id from cat where slug='carnes'),          'libra', true),
  ('Tomate',              null,          (select id from cat where slug='frutas-verduras'), 'libra', true),
  ('Cebolla',             null,          (select id from cat where slug='frutas-verduras'), 'libra', true),
  ('Pan frances',         null,          (select id from cat where slug='panaderia'),       'unidad', false),
  ('Jabon de lavar',      'Xtra',        (select id from cat where slug='limpieza'),        'unidad', false)
) as t(nombre, marca, categoria_id, unidad, es_canasta_basica)
where not exists (
  select 1 from public.productos p where p.nombre = t.nombre and coalesce(p.marca,'') = coalesce(t.marca,'')
);

-- ------------------------------------------------------------
-- Historial de precios (ultimos 6 meses, para que el semaforo tenga base)
-- ------------------------------------------------------------
-- Genera puntos de historial pseudo-aleatorios alrededor de un precio base por producto
with base as (
  select
    p.id as producto_id,
    s.id as supermercado_id,
    case p.nombre
      when 'Frijol negro'   then 9.00
      when 'Arroz blanco'   then 6.50
      when 'Maiz blanco'    then 4.00
      when 'Azucar blanca'  then 5.00
      when 'Aceite vegetal' then 30.00
      when 'Leche entera'   then 16.00
      when 'Huevos blancos' then 32.00
      when 'Pollo entero'   then 18.00
      when 'Tomate'         then 6.00
      when 'Cebolla'        then 4.50
      when 'Pan frances'    then 1.25
      when 'Jabon de lavar' then 7.00
    end as precio_base
  from public.productos p
  cross join public.supermercados s
  where s.slug in ('walmart','maxi-despensa','la-torre','paiz')
),
fechas as (
  select generate_series(current_date - interval '180 days', current_date - interval '7 days', interval '15 days')::date as fecha
)
insert into public.historial_precios (producto_id, supermercado_id, precio, fecha, es_oferta)
select
  b.producto_id,
  b.supermercado_id,
  -- variacion +/- 15% del precio base
  round((b.precio_base * (0.85 + (random() * 0.30)))::numeric, 2),
  f.fecha,
  false
from base b
cross join fechas f
where b.precio_base is not null
  and not exists (
    select 1 from public.historial_precios h
    where h.producto_id = b.producto_id
      and h.supermercado_id = b.supermercado_id
      and h.fecha = f.fecha
  );

-- ------------------------------------------------------------
-- Ofertas actuales (algunas reales-verde, algunas falsas-rojo, mixtas-amarillo)
-- ------------------------------------------------------------
insert into public.ofertas (producto_id, supermercado_id, precio_regular, precio_oferta, fecha_inicio, fecha_fin, url_origen)
select * from (
  -- Walmart: buenas ofertas
  select p.id, s.id, 10.50::numeric, 7.50::numeric, current_date, current_date + 14, 'https://walmart.com.gt/frijol'
  from public.productos p, public.supermercados s where p.nombre='Frijol negro' and s.slug='walmart'
  union all
  select p.id, s.id, 7.50::numeric, 5.50::numeric, current_date, current_date + 14, null
  from public.productos p, public.supermercados s where p.nombre='Arroz blanco' and s.slug='walmart'
  union all
  -- Maxi Despensa: oferta media
  select p.id, s.id, 32.00::numeric, 28.00::numeric, current_date, current_date + 7, null
  from public.productos p, public.supermercados s where p.nombre='Aceite vegetal' and s.slug='maxi-despensa'
  union all
  -- La Torre: oferta floja (rojo)
  select p.id, s.id, 18.00::numeric, 17.50::numeric, current_date, current_date + 7, null
  from public.productos p, public.supermercados s where p.nombre='Leche entera' and s.slug='la-torre'
  union all
  -- Paiz: oferta de huevos
  select p.id, s.id, 35.00::numeric, 27.00::numeric, current_date, current_date + 5, null
  from public.productos p, public.supermercados s where p.nombre='Huevos blancos' and s.slug='paiz'
  union all
  select p.id, s.id, 20.00::numeric, 14.50::numeric, current_date, current_date + 10, null
  from public.productos p, public.supermercados s where p.nombre='Pollo entero' and s.slug='paiz'
  union all
  select p.id, s.id, 6.50::numeric, 4.00::numeric, current_date, current_date + 5, null
  from public.productos p, public.supermercados s where p.nombre='Tomate' and s.slug='maxi-despensa'
) as nuevas(producto_id, supermercado_id, precio_regular, precio_oferta, fecha_inicio, fecha_fin, url_origen)
where not exists (
  select 1 from public.ofertas o
  where o.producto_id = nuevas.producto_id
    and o.supermercado_id = nuevas.supermercado_id
    and o.fecha_inicio = nuevas.fecha_inicio
);
