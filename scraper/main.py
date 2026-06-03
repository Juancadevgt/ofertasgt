"""Punto de entrada del scraper.

Uso:
    python main.py --super walmart
    python main.py --super walmart --mock   # genera datos falsos sin scrapear
"""
from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# Permite imports relativos cuando se ejecuta directamente
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv  # noqa: E402

from db import Repo  # noqa: E402
from scrapers.mock import MockScraper  # noqa: E402
from scrapers.walmart import WalmartGTScraper  # noqa: E402

load_dotenv()
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("scraper")


SCRAPERS = {
    "walmart": WalmartGTScraper,
    # Agrega aqui maxi-despensa, la-torre, paiz, etc cuando los implementes
}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--super", dest="super_slug", default="walmart",
                        help="slug del supermercado (default: walmart)")
    parser.add_argument("--mock", action="store_true",
                        help="usa datos falsos en vez de scrapear el sitio real")
    args = parser.parse_args()

    repo = Repo()
    if args.mock:
        log.info("Modo mock activado")
        scraper = MockScraper(repo, slug=args.super_slug)
    else:
        cls = SCRAPERS.get(args.super_slug)
        if not cls:
            log.error("No hay scraper implementado para '%s'. Usa --mock o agrega uno en scrapers/.",
                      args.super_slug)
            return 1
        scraper = cls(repo)

    count = scraper.run()
    log.info("Listo. %d ofertas procesadas.", count)
    return 0


if __name__ == "__main__":
    sys.exit(main())
