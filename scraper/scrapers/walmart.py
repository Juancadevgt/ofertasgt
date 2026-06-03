"""Scraper de Walmart Guatemala usando Playwright.

NOTA IMPORTANTE: los selectores CSS dependen del DOM actual del sitio.
Walmart cambia el frontend con cierta frecuencia, asi que estos selectores
son una primera version y requieren ajuste cuando se rompan. Revisa el
README de scraper/ para guia de mantenimiento.
"""
from __future__ import annotations

import logging
import re
from typing import Iterable, Optional

from playwright.sync_api import sync_playwright

from db import OfertaInput
from scrapers.base import BaseScraper

log = logging.getLogger(__name__)

URL_OFERTAS = "https://www.walmart.com.gt/ofertas"


def _parse_precio(text: Optional[str]) -> Optional[float]:
    if not text:
        return None
    cleaned = re.sub(r"[^\d.,]", "", text).replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


class WalmartGTScraper(BaseScraper):
    slug = "walmart"

    def fetch(self) -> Iterable[OfertaInput]:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            ctx = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/126.0.0.0 Safari/537.36"
                ),
                locale="es-GT",
            )
            page = ctx.new_page()
            log.info("Abriendo %s", URL_OFERTAS)
            page.goto(URL_OFERTAS, wait_until="domcontentloaded", timeout=60_000)

            # Scroll para forzar lazy-loading
            for _ in range(6):
                page.mouse.wheel(0, 1500)
                page.wait_for_timeout(500)

            # Selector aproximado para tarjetas de producto en oferta.
            # Ajusta si el HTML cambia: inspecciona uno y busca el contenedor.
            cards = page.query_selector_all('[data-testid="product-card"], article[class*="product"]')
            log.info("Encontradas %d tarjetas", len(cards))

            for card in cards:
                nombre = card.query_selector('[data-testid="product-name"], h3, h4')
                precio_oferta_el = card.query_selector('[data-testid="price"], [class*="price"][class*="sale"], [class*="precio-actual"]')
                precio_regular_el = card.query_selector('[data-testid="price-original"], [class*="price"][class*="strike"], [class*="precio-anterior"], s')

                nombre_txt = (nombre.inner_text().strip() if nombre else "") if nombre else ""
                p_oferta = _parse_precio(precio_oferta_el.inner_text() if precio_oferta_el else None)
                p_regular = _parse_precio(precio_regular_el.inner_text() if precio_regular_el else None)
                if not nombre_txt or p_oferta is None:
                    continue
                if p_regular is None or p_regular < p_oferta:
                    p_regular = p_oferta  # no hay regular visible

                yield OfertaInput(
                    supermercado_slug=self.slug,
                    producto_nombre=nombre_txt,
                    producto_marca=None,
                    producto_unidad="unidad",
                    categoria_slug=None,
                    precio_regular=p_regular,
                    precio_oferta=p_oferta,
                    url_origen=page.url,
                    es_canasta_basica=False,
                )

            browser.close()
