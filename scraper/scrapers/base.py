"""Clase base para todos los scrapers."""
from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from typing import Iterable

from db import OfertaInput, Repo

log = logging.getLogger(__name__)


class BaseScraper(ABC):
    #: Slug del supermercado en la tabla supermercados (debe existir)
    slug: str = ""

    def __init__(self, repo: Repo) -> None:
        self.repo = repo

    @abstractmethod
    def fetch(self) -> Iterable[OfertaInput]:
        """Devuelve un iterable de OfertaInput. Cada scraper concreto lo implementa."""
        ...

    def run(self) -> int:
        count = 0
        errors = 0
        for oferta in self.fetch():
            try:
                self.repo.insert_oferta(oferta)
                count += 1
            except Exception:
                errors += 1
                log.exception("Error guardando oferta de %s: %s", self.slug, oferta.producto_nombre)
        log.info("[%s] %d ofertas guardadas, %d errores", self.slug, count, errors)
        return count
