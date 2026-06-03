import type {
  Oferta, Producto, Supermercado, Categoria, HistorialPunto,
} from './types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

type Json<T> = { data: T };

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }
  return res.json();
}

export const api = {
  async ofertas(params: { super?: string; categoria?: string; search?: string; semaforo?: string; canasta?: boolean; limit?: number } = {}): Promise<Oferta[]> {
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

  async productos(params: { search?: string } = {}): Promise<Producto[]> {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    const j = await fetchJson<Json<Producto[]>>(`/api/productos?${qs}`);
    return j.data;
  },

  async producto(id: string): Promise<{ producto: Producto; ofertas: Oferta[]; historial: HistorialPunto[] }> {
    const j = await fetchJson<Json<{ producto: Producto; ofertas: Oferta[]; historial: HistorialPunto[] }>>(`/api/productos/${id}`);
    return j.data;
  },

  async categorias(): Promise<Categoria[]> {
    const j = await fetchJson<Json<Categoria[]>>(`/api/categorias`);
    return j.data;
  },

  async supermercados(): Promise<Supermercado[]> {
    const j = await fetchJson<Json<Supermercado[]>>(`/api/supermercados`);
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

export const COLORS = {
  primary:  '#1565c0',
  primaryDark: '#0d47a1',
  primaryLight: '#daecff',
  text:     '#0f172a',
  textMute: '#64748b',
  bg:       '#f8fafc',
  card:     '#ffffff',
  border:   '#e2e8f0',
  verde:    '#16a34a',
  amarillo: '#eab308',
  rojo:     '#dc2626',
};
