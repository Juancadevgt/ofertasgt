# Ofertas Guatemala

App multiplataforma (web + Android + iOS) que muestra las mejores ofertas
de supermercados en Guatemala, con historial de precios de los últimos 2 años
y detector de si la oferta es real o falsa.

## Funcionalidades
- Ver ofertas de Walmart GT, Maxi Despensa, La Torre, Paiz y más
- Historial de precios: ver el precio de los últimos 24 meses
- Detector de oferta real (semáforo verde/amarillo/rojo)
- Búsqueda por palabra clave
- Alertas: recibir aviso cuando un producto específico esté en oferta

## Estructura del proyecto
ofertas-guatemala/
├── backend/        → API Node.js (desplegada en Render)
├── scraper/        → Scraper Python (corre en GitHub Actions cada 6h)
├── frontend-web/   → Web Next.js (desplegada en Vercel)
├── mobile/         → App Expo React Native (Android + iOS)
├── supabase/       → Schema SQL y datos seed para la base de datos
└── .github/
    └── workflows/  → Automatización del scraper

## Stack tecnológico
- Base de datos: Supabase (PostgreSQL gratis)
- Backend API:   Node.js + Express (Render gratis)
- Scraper:       Python + Playwright (GitHub Actions gratis)
- Web:           Next.js + Tailwind (Vercel gratis)
- Móvil:         Expo + React Native (EAS Build gratis)
- Alertas:       Telegram Bot (gratis)

## Costo mensual: $0

## Requisitos previos
- [Node.js](https://nodejs.org/) 20 o superior (requerido por `@supabase/supabase-js`)
- [Git](https://git-scm.com/)
- Una cuenta gratuita en [Supabase](https://supabase.com/) para obtener `SUPABASE_URL` y `SUPABASE_KEY`

## Cómo clonar y configurar el proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/Juancadevgt/ofertasgt.git
cd ofertasgt
```

### 2. Crear las tablas en Supabase
1. Entra a tu proyecto en [supabase.com](https://supabase.com/) y abre **SQL Editor**
2. Copia y corre el contenido de [`supabase/schema.sql`](supabase/schema.sql)
3. (Opcional, recomendado) Copia y corre [`supabase/seed.sql`](supabase/seed.sql) para tener datos de muestra

Más detalle en [supabase/README.md](supabase/README.md).

### 3. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
```

Luego edita `backend/.env` con tus credenciales reales de Supabase
(`SUPABASE_URL` y `SUPABASE_KEY` están en *Project Settings → API* en Supabase).

### 4. Ejecutar el backend
```bash
npm start          # modo normal
npm run dev        # modo con reinicio automatico al editar (node --watch)
```

El servidor escucha en el puerto definido en `.env` (por defecto `3000`).
Endpoints disponibles:

| Método | Ruta                                | Descripción                                        |
|--------|-------------------------------------|----------------------------------------------------|
| GET    | `/`                                 | Info de la API                                      |
| GET    | `/health`                           | Chequeo de salud                                    |
| GET    | `/api/ofertas`                      | Lista ofertas (filtros: `super`, `categoria`, `search`, `semaforo`, `canasta`, `limit`) |
| GET    | `/api/ofertas/:id`                  | Detalle de una oferta                               |
| GET    | `/api/productos`                    | Lista productos (filtros: `search`, `categoria`, `canasta`) |
| GET    | `/api/productos/:id`                | Producto + ofertas activas + historial 24m          |
| GET    | `/api/supermercados`                | Lista de supermercados                              |
| GET    | `/api/categorias`                   | Lista de categorías                                 |
| POST   | `/api/alertas`                      | Suscribirse a alertas Telegram para un producto     |
| DELETE | `/api/alertas/:id`                  | Cancelar una alerta                                 |
| POST   | `/api/telegram/webhook`             | Webhook que Telegram llama con mensajes del bot     |

## Variables de entorno
El backend necesita un archivo `.env` con las siguientes variables (ver `backend/.env.example`):

| Variable       | Descripción                                |
|----------------|--------------------------------------------|
| `SUPABASE_URL` | URL del proyecto de Supabase               |
| `SUPABASE_KEY` | API key (anon o service role) de Supabase  |
| `PORT`         | Puerto donde escucha el backend (ej. 3000) |

**Importante:** nunca subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

## Estado de los módulos
- ✅ `supabase/` — schema SQL + seed listos para correr
- ✅ `backend/` — API Express con todos los endpoints
- ✅ `frontend-web/` — Next.js 14 + Tailwind, todas las páginas
- ✅ `scraper/` — Python + Playwright, scraper de Walmart GT + modo mock + GitHub Action cada 6h
- ✅ `mobile/` — Expo + React Native + Expo Router, todas las pantallas
- ✅ Bot de Telegram — webhook + job de alertas cada hora (ver [docs/telegram-bot.md](docs/telegram-bot.md))