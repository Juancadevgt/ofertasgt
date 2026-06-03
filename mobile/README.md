# App móvil — Ofertas GT

App Expo + React Native que consume el mismo backend que la web. Una sola base
de código corre en Android, iOS y web.

## Setup local

```bash
cd mobile
npm install
cp .env.example .env
```

Edita `.env` y apunta `EXPO_PUBLIC_API_URL` al backend.
**Importante:** si vas a probar en un celular físico via Expo Go, `localhost`
no sirve — apunta a la **IP local** de tu computadora (por ejemplo
`http://192.168.1.100:3000`). Encuentra tu IP con `ipconfig` (Windows) o `ifconfig` (mac/linux).

## Correr en desarrollo

```bash
npm start
```

Se abre Expo Dev Tools. Opciones:
- Escanea el QR con **Expo Go** en tu Android/iOS
- `a` para abrir en emulador Android
- `i` para abrir en simulador iOS (solo macOS)
- `w` para abrir en navegador web

## Build de producción

Usa [EAS Build](https://docs.expo.dev/build/introduction/) (gratis con cuenta Expo):

```bash
npm install -g eas-cli
eas login
eas build -p android   # APK / AAB
eas build -p ios       # .ipa
```

## Pantallas
- `app/index.tsx` — Home con ofertas y filtros rápidos
- `app/buscar.tsx` — Búsqueda por nombre
- `app/producto/[id].tsx` — Detalle: mejor precio, comparativa, historial 24m (SVG)
- `app/alertas.tsx` — Instrucciones para suscribirse al bot

## Diseño
- Paleta consistente con la web (azul Guatemala + semáforo)
- Componentes nativos (no Tailwind) — estilo inline con tokens en `lib/api.ts`
- Touch-friendly: tarjetas grandes, botones cómodos para pulgares
