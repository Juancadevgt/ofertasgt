"""Wrapper sencillo de Supabase para el scraper."""
from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import date
from typing import Optional

from supabase import Client, create_client


def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ["SUPABASE_KEY"]
    return create_client(url, key)


@dataclass
class OfertaInput:
    supermercado_slug: str
    producto_nombre: str
    producto_marca: Optional[str]
    producto_unidad: str
    categoria_slug: Optional[str]
    precio_regular: float
    precio_oferta: float
    fecha_fin: Optional[date] = None
    url_origen: Optional[str] = None
    es_canasta_basica: bool = False


class Repo:
    def __init__(self, client: Optional[Client] = None) -> None:
        self.s = client or get_client()

    def supermercado_id(self, slug: str) -> str:
        r = self.s.table("supermercados").select("id").eq("slug", slug).limit(1).execute()
        if not r.data:
            raise RuntimeError(f"Supermercado '{slug}' no existe en la base. Corre el schema.sql primero.")
        return r.data[0]["id"]

    def categoria_id(self, slug: Optional[str]) -> Optional[str]:
        if not slug:
            return None
        r = self.s.table("categorias").select("id").eq("slug", slug).limit(1).execute()
        return r.data[0]["id"] if r.data else None

    def upsert_producto(self, nombre: str, marca: Optional[str], unidad: str,
                        categoria_slug: Optional[str], es_canasta_basica: bool) -> str:
        # Idempotente por nombre+marca (no hay constraint pero buscamos primero)
        q = self.s.table("productos").select("id").eq("nombre", nombre)
        if marca:
            q = q.eq("marca", marca)
        else:
            q = q.is_("marca", "null")
        existing = q.limit(1).execute()
        if existing.data:
            return existing.data[0]["id"]

        payload = {
            "nombre": nombre,
            "marca": marca,
            "unidad": unidad,
            "categoria_id": self.categoria_id(categoria_slug),
            "es_canasta_basica": es_canasta_basica,
        }
        r = self.s.table("productos").insert(payload).execute()
        return r.data[0]["id"]

    def insert_oferta(self, o: OfertaInput) -> None:
        super_id = self.supermercado_id(o.supermercado_slug)
        producto_id = self.upsert_producto(
            o.producto_nombre, o.producto_marca, o.producto_unidad,
            o.categoria_slug, o.es_canasta_basica,
        )

        # Marca como inactivas las ofertas previas del mismo producto+super
        self.s.table("ofertas").update({"activa": False}).match({
            "producto_id": producto_id,
            "supermercado_id": super_id,
            "activa": True,
        }).execute()

        # Inserta la nueva oferta (el trigger calcula el semaforo)
        self.s.table("ofertas").insert({
            "producto_id": producto_id,
            "supermercado_id": super_id,
            "precio_regular": o.precio_regular,
            "precio_oferta": o.precio_oferta,
            "fecha_fin": o.fecha_fin.isoformat() if o.fecha_fin else None,
            "url_origen": o.url_origen,
        }).execute()

        # Guarda snapshot en historial
        self.s.table("historial_precios").insert({
            "producto_id": producto_id,
            "supermercado_id": super_id,
            "precio": o.precio_oferta,
            "es_oferta": True,
        }).execute()
