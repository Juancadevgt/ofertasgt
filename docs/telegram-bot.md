# Bot de Telegram — Ofertas GT

El bot tiene dos partes:

1. **Webhook** (en el backend): recibe los mensajes que los usuarios envían al bot
   y responde con búsquedas, listado de alertas, etc.
2. **Job de alertas** (GitHub Action cada hora): revisa las suscripciones y manda
   notificación a quien tenga una bajada de precio.

## Pasos para activarlo

### 1. Crear el bot en Telegram
1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot` y sigue las instrucciones
3. Guarda el **token** que te da (algo como `123456:ABC-DEF...`)

### 2. Aplicar la migración de la tabla `alertas`
Si tu base ya tenía corrido `schema.sql` antes de esta funcionalidad,
ejecuta también [`supabase/migrations/001_alertas_notificaciones.sql`](../supabase/migrations/001_alertas_notificaciones.sql)
en el SQL Editor de Supabase. (Si vas a correr `schema.sql` desde cero, no necesitas
hacer nada — ya incluye los campos.)

### 3. Configurar las variables de entorno

**Local (`backend/.env`)** — para probar el job de alertas en tu máquina:
```
TELEGRAM_BOT_TOKEN=123456:el_token_que_te_dio_botfather
TELEGRAM_WEBHOOK_SECRET=cualquier-string-aleatorio-largo
```

**Producción** (Render o donde despliegues el backend):
- `TELEGRAM_BOT_TOKEN` y `TELEGRAM_WEBHOOK_SECRET` en variables de entorno

**GitHub Actions** (para el job de alertas) — secrets del repo:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (service role, no la anon)
- `TELEGRAM_BOT_TOKEN`

### 4. Registrar el webhook con Telegram
Una sola vez, después de desplegar el backend:

```bash
curl "https://api.telegram.org/bot<TU_TOKEN>/setWebhook" \
  -d "url=https://tu-backend.onrender.com/api/telegram/webhook&secret_token=<TU_WEBHOOK_SECRET>"
```

Verifica con:
```bash
curl "https://api.telegram.org/bot<TU_TOKEN>/getWebhookInfo"
```

### 5. Probarlo
- Busca tu bot en Telegram (por el username que escogiste en BotFather)
- Envía `/start` — debería contestar con el mensaje de bienvenida
- Envíale el nombre de un producto (ej. `frijol`) — devuelve los mejores precios

## Comandos del bot
| Comando | Acción |
|---------|--------|
| `/start` | Mensaje de bienvenida y ayuda |
| `/ayuda` | Igual que `/start` |
| `/mis_alertas` | Lista las suscripciones activas del usuario |
| *cualquier texto* | Búsqueda de producto, devuelve top 5 con su mejor precio |

## Cómo se suscribe un usuario
Por ahora la suscripción se crea desde la API (`POST /api/alertas`) con el `chat_id`
del usuario. En una iteración futura agregaremos un botón "Avisarme" en la web/app
que recoja el `chat_id` (usuario lo obtiene en Telegram con `@userinfobot`).

## El job de alertas
- Corre cada hora con [.github/workflows/alertas.yml](../.github/workflows/alertas.yml)
- Para cada alerta activa busca la mejor oferta del producto
- Notifica si:
  - Hay `precio_objetivo` y el precio actual ≤ objetivo, o
  - No hay objetivo y el precio actual es menor al último notificado
- Cooldown de 24h entre avisos para no spamear
