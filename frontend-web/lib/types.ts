export type Semaforo = 'verde' | 'amarillo' | 'rojo';

export type Supermercado = {
  id: string;
  nombre: string;
  slug: string;
  logo_url?: string | null;
  sitio_web?: string | null;
  activo: boolean;
};

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  icono?: string | null;
  orden: number;
};

export type Producto = {
  id: string;
  nombre: string;
  marca?: string | null;
  unidad: string;
  imagen_url?: string | null;
  es_canasta_basica: boolean;
  categoria?: Categoria | null;
};

export type Oferta = {
  id: string;
  precio_regular: number;
  precio_oferta: number;
  descuento_pct: number;
  semaforo: Semaforo;
  fecha_inicio: string;
  fecha_fin?: string | null;
  url_origen?: string | null;
  activa: boolean;
  producto_id: string;
  producto_nombre: string;
  producto_marca?: string | null;
  producto_unidad: string;
  producto_imagen?: string | null;
  es_canasta_basica: boolean;
  categoria_id?: string | null;
  categoria_nombre?: string | null;
  categoria_slug?: string | null;
  categoria_icono?: string | null;
  supermercado_id: string;
  supermercado_nombre: string;
  supermercado_slug: string;
  supermercado_logo?: string | null;
};

export type HistorialPunto = {
  precio: number;
  fecha: string;
  es_oferta: boolean;
  supermercado_id: string;
  supermercado?: { nombre: string; slug: string };
};
