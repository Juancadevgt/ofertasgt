import type {
  Oferta, Producto, Supermercado, Categoria, HistorialPunto,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Json<T> = { data: T; total?: number };

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export type OfertasParams = {
  super?: string;
  categoria?: string;
  search?: string;
  semaforo?: 'verde' | 'amarillo' | 'rojo';
  canasta?: boolean;
  limit?: number;
};

export const api = {
  async ofertas(params: OfertasParams = {}): Promise<Oferta[]> {
    const qs = new URLSearchParams();
    if (params.super)     qs.set('super', params.super);
    if (params.categoria) qs.set('categoria', params.categoria);
    if (params.search)    qs.set('search', params.search);
    if (params.semaforo)  qs.set('semaforo', params.semaforo);
    if (params.canasta)   qs.set('canasta', '1');
    if (params.limit)     qs.set('limit', String(params.limit));
    const j = await fetchJson<Json<Oferta[]>>(`/api/ofertas?${qs}`);
    return j.data;
  },

  async productos(params: { search?: string; categoria?: string; canasta?: boolean } = {}): Promise<Producto[]> {
    const qs = new URLSearchParams();
    if (params.search)    qs.set('search', params.search);
    if (params.categoria) qs.set('categoria', params.categoria);
    if (params.canasta)   qs.set('canasta', '1');
    const j = await fetchJson<Json<Producto[]>>(`/api/productos?${qs}`);
    return j.data;
  },

  async producto(id: string): Promise<{ producto: Producto; ofertas: Oferta[]; historial: HistorialPunto[] }> {
    const j = await fetchJson<Json<{ producto: Producto; ofertas: Oferta[]; historial: HistorialPunto[] }>>(`/api/productos/${id}`);
    return j.data;
  },

  async supermercados(): Promise<Supermercado[]> {
    const j = await fetchJson<Json<Supermercado[]>>('/api/supermercados');
    return j.data;
  },

  async categorias(): Promise<Categoria[]> {
    const j = await fetchJson<Json<Categoria[]>>('/api/categorias');
    return j.data;
  },
};

export function formatQ(amount: number): string {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
  }).format(amount);
}
