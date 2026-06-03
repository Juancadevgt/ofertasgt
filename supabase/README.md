# Base de datos (Supabase)

Esta carpeta contiene los scripts SQL para configurar la base de datos del proyecto.

## Cómo aplicar el schema a tu proyecto de Supabase

1. Entra a tu proyecto en [supabase.com](https://supabase.com/)
2. Ve a **SQL Editor** (barra lateral izquierda)
3. Haz clic en **New query**
4. Copia y pega el contenido de [`schema.sql`](schema.sql) y dale **Run**
5. (Opcional pero recomendado para desarrollo) Repite con [`seed.sql`](seed.sql) para tener datos de muestra

## Tablas

| Tabla                | Propósito                                                  |
|----------------------|------------------------------------------------------------|
| `supermercados`      | Catálogo de cadenas (Walmart, Maxi Despensa, La Torre, Paiz) |
| `categorias`         | Granos, lácteos, carnes, frutas, etc.                       |
| `productos`          | Productos individuales con marca, unidad, categoría        |
| `ofertas`            | Precio actual con descuento, fechas y semáforo             |
| `historial_precios`  | Snapshots para detectar si una oferta es real              |
| `alertas`            | Suscripciones de usuarios por Telegram                     |

## Detector de oferta real (semáforo)

Cada oferta se evalúa automáticamente contra el historial de los últimos 24 meses del mismo producto:

- 🟢 **Verde**: precio actual ≤ percentil 25 → realmente barato
- 🟡 **Amarillo**: entre P25 y P50 → oferta normal
- 🔴 **Rojo**: > P50 → precio regular disfrazado de oferta

La lógica vive en la función `calcular_semaforo()` y se aplica via trigger `trg_ofertas_semaforo`.

## Vista útil

`vista_ofertas` ya hace el join de oferta + producto + categoría + supermercado, lista para consumir desde el backend.

## RLS (Row Level Security)

- Lectura pública: `supermercados`, `categorias`, `productos`, `ofertas`, `historial_precios`
- Sin lectura pública: `alertas` (solo accesible con `service_role` desde el backend)
