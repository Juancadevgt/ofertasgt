-- Migración: tracking de notificaciones enviadas a usuarios via Telegram.
-- Aplicar después del schema.sql inicial. Idempotente.

alter table public.alertas
  add column if not exists last_notified_at  timestamptz,
  add column if not exists last_notified_price numeric(10,2);

create index if not exists idx_alertas_notif on public.alertas(last_notified_at);
