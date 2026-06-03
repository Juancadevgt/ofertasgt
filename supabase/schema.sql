-- ============================================================
-- Ofertas Guatemala — Schema de base de datos (Supabase / PostgreSQL)
-- ============================================================
-- Copia y pega este archivo completo en el SQL Editor de Supabase
-- y dale "Run". Es idempotente: lo puedes correr de nuevo sin romper nada.
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- para busqueda por similitud en nombres

-- ------------------------------------------------------------
-- Tabla: supermercados
-- ------------------------------------------------------------
create table if not exists public.supermercados (
  id           uuid primary key default uuid_generate_v4(),
  nombre       text not null unique,
  slug         text not null unique,
  logo_url     text,
  sitio_web    text,
  activo       boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: categorias
-- ------------------------------------------------------------
create table if not exists public.categorias (
  id           uuid primary key default uuid_generate_v4(),
  nombre       text not null unique,
  slug         text not null unique,
  icono        text, -- emoji o nombre de icono
  orden        integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: productos
-- ------------------------------------------------------------
create table if not exists public.productos (
  id                 uuid primary key default uuid_generate_v4(),
  nombre             text not null,
  marca              text,
  categoria_id       uuid references public.categorias(id) on delete set null,
  unidad             text not null default 'unidad', -- libra, kg, litro, unidad, etc.
  imagen_url         text,
  es_canasta_basica  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_productos_categoria on public.productos(categoria_id);
create index if not exists idx_productos_canasta on public.productos(es_canasta_basica) where es_canasta_basica = true;
create index if not exists idx_productos_nombre_trgm on public.productos using gin (nombre gin_trgm_ops);

-- ------------------------------------------------------------
-- Tabla: ofertas (precio actual con descuento)
-- ------------------------------------------------------------
create table if not exists public.ofertas (
  id                uuid primary key default uuid_generate_v4(),
  producto_id       uuid not null references public.productos(id) on delete cascade,
  supermercado_id   uuid not null references public.supermercados(id) on delete cascade,
  precio_regular    numeric(10,2) not null check (precio_regular >= 0),
  precio_oferta     numeric(10,2) not null check (precio_oferta >= 0),
  descuento_pct     numeric(5,2) generated always as (
    case when precio_regular > 0
      then round(((precio_regular - precio_oferta) / precio_regular) * 100, 2)
      else 0
    end
  ) stored,
  fecha_inicio      date not null default current_date,
  fecha_fin         date,
  url_origen        text,
  semaforo          text not null default 'amarillo' check (semaforo in ('verde','amarillo','rojo')),
  activa            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_ofertas_activa on public.ofertas(activa) where activa = true;
create index if not exists idx_ofertas_producto on public.ofertas(producto_id);
create index if not exists idx_ofertas_super on public.ofertas(supermercado_id);
create index if not exists idx_ofertas_fecha_inicio on public.ofertas(fecha_inicio desc);

-- ------------------------------------------------------------
-- Tabla: historial_precios (snapshots para detectar oferta real)
-- ------------------------------------------------------------
create table if not exists public.historial_precios (
  id                bigserial primary key,
  producto_id       uuid not null references public.productos(id) on delete cascade,
  supermercado_id   uuid not null references public.supermercados(id) on delete cascade,
  precio            numeric(10,2) not null check (precio >= 0),
  fecha             date not null default current_date,
  es_oferta         boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists idx_historial_producto_fecha on public.historial_precios(producto_id, fecha desc);
create index if not exists idx_historial_super on public.historial_precios(supermercado_id);

-- ------------------------------------------------------------
-- Tabla: alertas (suscripciones de usuarios via Telegram)
-- ------------------------------------------------------------
create table if not exists public.alertas (
  id                   uuid primary key default uuid_generate_v4(),
  producto_id          uuid not null references public.productos(id) on delete cascade,
  usuario_telegram_id  text not null,
  precio_objetivo      numeric(10,2),
  activa               boolean not null default true,
  created_at           timestamptz not null default now(),
  unique (producto_id, usuario_telegram_id)
);

create index if not exists idx_alertas_activa on public.alertas(activa) where activa = true;
create index if not exists idx_alertas_producto on public.alertas(producto_id);

-- ============================================================
-- Funciones
-- ============================================================

-- Calcula el semáforo de una oferta comparando contra el percentil 25
-- del historial de los últimos 24 meses del mismo producto.
--   verde   = precio_oferta <= P25 (realmente barato)
--   amarillo= entre P25 y P50
--   rojo    = > P50 (precio normal, oferta falsa)
create or replace function public.calcular_semaforo(
  p_producto_id uuid,
  p_precio numeric
) returns text language plpgsql stable as $$
declare
  v_p25 numeric;
  v_p50 numeric;
begin
  select
    percentile_cont(0.25) within group (order by precio),
    percentile_cont(0.50) within group (order by precio)
  into v_p25, v_p50
  from public.historial_precios
  where producto_id = p_producto_id
    and fecha >= current_date - interval '24 months';

  if v_p25 is null then
    return 'amarillo'; -- sin historial suficiente
  end if;

  if p_precio <= v_p25 then return 'verde';
  elsif p_precio <= v_p50 then return 'amarillo';
  else return 'rojo';
  end if;
end;
$$;

-- Trigger: actualiza updated_at automáticamente
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_productos_updated_at on public.productos;
create trigger trg_productos_updated_at before update on public.productos
for each row execute function public.set_updated_at();

drop trigger if exists trg_ofertas_updated_at on public.ofertas;
create trigger trg_ofertas_updated_at before update on public.ofertas
for each row execute function public.set_updated_at();

-- Trigger: calcula semáforo automáticamente al insertar/actualizar oferta
create or replace function public.calcular_semaforo_oferta() returns trigger language plpgsql as $$
begin
  new.semaforo = public.calcular_semaforo(new.producto_id, new.precio_oferta);
  return new;
end;
$$;

drop trigger if exists trg_ofertas_semaforo on public.ofertas;
create trigger trg_ofertas_semaforo before insert or update of precio_oferta, producto_id on public.ofertas
for each row execute function public.calcular_semaforo_oferta();

-- ============================================================
-- Vista: ofertas con info completa (join con producto + super + categoria)
-- ============================================================
create or replace view public.vista_ofertas as
select
  o.id,
  o.precio_regular,
  o.precio_oferta,
  o.descuento_pct,
  o.semaforo,
  o.fecha_inicio,
  o.fecha_fin,
  o.url_origen,
  o.activa,
  o.created_at,
  p.id            as producto_id,
  p.nombre        as producto_nombre,
  p.marca         as producto_marca,
  p.unidad        as producto_unidad,
  p.imagen_url    as producto_imagen,
  p.es_canasta_basica,
  c.id            as categoria_id,
  c.nombre        as categoria_nombre,
  c.slug          as categoria_slug,
  c.icono         as categoria_icono,
  s.id            as supermercado_id,
  s.nombre        as supermercado_nombre,
  s.slug          as supermercado_slug,
  s.logo_url      as supermercado_logo
from public.ofertas o
join public.productos p     on p.id = o.producto_id
left join public.categorias c on c.id = p.categoria_id
join public.supermercados s on s.id = o.supermercado_id;

-- ============================================================
-- Row Level Security (lectura pública, escritura solo service_role)
-- ============================================================
alter table public.supermercados      enable row level security;
alter table public.categorias         enable row level security;
alter table public.productos          enable row level security;
alter table public.ofertas            enable row level security;
alter table public.historial_precios  enable row level security;
alter table public.alertas            enable row level security;

-- Lectura pública para catálogo y ofertas
drop policy if exists "lectura publica supermercados" on public.supermercados;
create policy "lectura publica supermercados" on public.supermercados for select using (true);

drop policy if exists "lectura publica categorias" on public.categorias;
create policy "lectura publica categorias" on public.categorias for select using (true);

drop policy if exists "lectura publica productos" on public.productos;
create policy "lectura publica productos" on public.productos for select using (true);

drop policy if exists "lectura publica ofertas" on public.ofertas;
create policy "lectura publica ofertas" on public.ofertas for select using (true);

drop policy if exists "lectura publica historial" on public.historial_precios;
create policy "lectura publica historial" on public.historial_precios for select using (true);

-- Alertas: solo se manejan desde el backend con service_role, no exponer al cliente
-- (sin policy de SELECT pública => bloqueado por defecto bajo RLS)
