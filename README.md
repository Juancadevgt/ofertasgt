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

### 2. Configurar el backend
```bash
cd backend
npm install
cp .env.example .env
```

Luego edita `backend/.env` y reemplaza los valores con tus credenciales reales de Supabase.

### 3. Ejecutar el backend
```bash
npm start          # modo normal
npm run dev        # modo con reinicio automatico al editar (node --watch)
```

El servidor escucha en el puerto definido en `.env` (por defecto `3000`).
Endpoints disponibles:
- `GET /` — info de la API
- `GET /health` — chequeo de salud
- `GET /api/ofertas` — ultimas ofertas (consulta tabla `ofertas` en Supabase)
- `GET /api/productos?search=<texto>` — buscar productos por nombre

## Variables de entorno
El backend necesita un archivo `.env` con las siguientes variables (ver `backend/.env.example`):

| Variable       | Descripción                                |
|----------------|--------------------------------------------|
| `SUPABASE_URL` | URL del proyecto de Supabase               |
| `SUPABASE_KEY` | API key (anon o service role) de Supabase  |
| `PORT`         | Puerto donde escucha el backend (ej. 3000) |

**Importante:** nunca subas tu archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

## Estado de los módulos
- ✅ `backend/` — API Express con Supabase, lista para correr
- ⏳ `scraper/` — pendiente de implementar
- ⏳ `frontend-web/` — pendiente de implementar
- ⏳ `mobile/` — pendiente de implementar