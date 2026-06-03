# Frontend web — Ofertas GT

App Next.js 14 (App Router) + Tailwind CSS que consume el backend Express.

## Setup local

```bash
cd frontend-web
npm install
cp .env.example .env.local
```

Edita `.env.local` y apunta `NEXT_PUBLIC_API_URL` a tu backend (por defecto `http://localhost:3000`).
Recuerda que tu backend escucha en el puerto definido en `backend/.env` (puede ser 3001).

## Correr en desarrollo

```bash
npm run dev
```

La web abre en [http://localhost:3000](http://localhost:3000). Si chocas con el backend en ese puerto, Next.js automaticamente usa 3001/3002/etc.

## Build de producción

```bash
npm run build
npm start
```

## Páginas
- `/` — listado de ofertas con filtros (canasta básica, semáforo, categoría, supermercado)
- `/buscar?q=...` — búsqueda por nombre de producto
- `/producto/:id` — detalle: mejor precio, comparación entre supermercados, gráfica de historial 24m
- `/alertas` — instrucciones para suscribirse al bot de Telegram (cuando esté listo)

## Despliegue (Vercel)
1. Conecta el repo en [vercel.com](https://vercel.com/)
2. Root directory: `frontend-web`
3. Variable de entorno: `NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com`
