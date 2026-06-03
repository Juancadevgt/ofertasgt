"""Scraper de prueba: genera ofertas falsas para validar el pipeline sin tocar nada externo."""
from __future__ import annotations

import random
from datetime import date, timedelta
from typing import Iterable

from db import OfertaInput
from scrapers.base import BaseScraper


PRODUCTOS_DEMO = [
    ("Frijol negro",   None,        "libra",  "granos",          True),
    ("Arroz blanco",   None,        "libra",  "granos",          True),
    ("Aceite vegetal", "Capullo",   "litro",  "abarrotes",       True),
    ("Leche entera",   "Foremost",  "litro",  "lacteos",         True),
    ("Huevos blancos", None,        "docena", "lacteos",         True),
    ("Tomate",         None,        "libra",  "frutas-verduras", True),
]


class MockScraper(BaseScraper):
    slug = "walmart"  # usa walmart por defecto; --super lo sobreescribe

    def __init__(self, repo, slug: str = "walmart") -> None:
        super().__init__(repo)
        self.slug = slug

    def fetch(self) -> Iterable[OfertaInput]:
        for nombre, marca, unidad, cat, canasta in PRODUCTOS_DEMO:
            base = round(random.uniform(5, 35), 2)
            descuento = round(random.uniform(0.10, 0.40), 2)
            yield OfertaInput(
                supermercado_slug=self.slug,
                producto_nombre=nombre,
                producto_marca=marca,
                producto_unidad=unidad,
                categoria_slug=cat,
                precio_regular=base,
                precio_oferta=round(base * (1 - descuento), 2),
                fecha_fin=date.today() + timedelta(days=random.randint(3, 14)),
                es_canasta_basica=canasta,
            )
