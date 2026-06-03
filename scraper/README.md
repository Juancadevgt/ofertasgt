# Scraper — Ofertas GT

Scraper en Python + Playwright que obtiene ofertas de supermercados y las guarda en Supabase.

## Setup local

```bash
cd scraper
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python -m playwright install chromium

cp .env.example .env
# edita .env con SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
```

> Usa la **service role key** de Supabase (no la `anon`). El scraper escribe a tablas con RLS;
> solo el service role pasa por alto las políticas. Esta key **nunca** debe ir en frontend ni móvil.

## Correr

### Modo mock (sin scrapear nada, datos falsos)
Útil para validar conexión con Supabase y triggers del schema:
```bash
python main.py --super walmart --mock
```

### Modo real
```bash
python main.py --super walmart
```

Solo `walmart` está implementado por ahora. Para agregar `maxi-despensa`, `la-torre` o `paiz`:
1. Crea un archivo nuevo en `scrapers/`, p.ej. `scrapers/la_torre.py`
2. Hereda de `BaseScraper`, define `slug` y el método `fetch()`
3. Regístralo en el diccionario `SCRAPERS` de `main.py`

## Cómo funciona

```
main.py
  ├─ Cargo .env
  ├─ Conecto a Supabase (service role)
  ├─ Instancio scraper según --super
  └─ scraper.run()
        ├─ Para cada oferta encontrada:
        │   ├─ Upsert del producto (productos)
        │   ├─ Marca ofertas previas como inactivas
        │   ├─ Inserta nueva oferta (ofertas) — el trigger calcula el semáforo
        │   └─ Inserta snapshot en historial_precios
        └─ Reporta totales
```

## Mantenimiento de selectores

Los sitios cambian su HTML con cierta frecuencia. Si el scraper deja de encontrar productos:
1. Abre el sitio en tu navegador
2. Inspecciona una tarjeta de producto (click derecho → Inspeccionar)
3. Identifica el contenedor de la tarjeta y los selectores de nombre / precio
4. Actualiza los `query_selector(...)` en `scrapers/walmart.py`

Para depurar: cambia `headless=True` a `headless=False` y ejecuta — verás el browser en vivo.

## Automatización (GitHub Actions)

El workflow `.github/workflows/scraper.yml` corre el scraper cada 6 horas
usando los secrets `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` del repositorio.
