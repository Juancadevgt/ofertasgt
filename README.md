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