import Link from 'next/link';
import { Semaforo } from './Semaforo';
import { formatQ } from '@/lib/api';
import type { Oferta } from '@/lib/types';

export function OfertaCard({ oferta }: { oferta: Oferta }) {
  return (
    <Link
      href={`/producto/${oferta.producto_id}`}
      className="block bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            {oferta.categoria_icono && <span>{oferta.categoria_icono}</span>}
            <span>{oferta.categoria_nombre || 'Sin categoría'}</span>
            {oferta.es_canasta_basica && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-[10px] font-semibold">
                CANASTA BÁSICA
              </span>
            )}
          </div>
          <h3 className="font-semibold text-slate-900 leading-tight">
            {oferta.producto_nombre}
            {oferta.producto_marca && (
              <span className="text-slate-500 font-normal"> · {oferta.producto_marca}</span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            por {oferta.producto_unidad} · en {oferta.supermercado_nombre}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-bold text-primary-700">
            {formatQ(oferta.precio_oferta)}
          </div>
          {oferta.precio_regular > oferta.precio_oferta && (
            <div className="text-xs text-slate-500 line-through">
              {formatQ(oferta.precio_regular)}
            </div>
          )}
          {oferta.descuento_pct > 0 && (
            <div className="text-xs font-semibold text-verde">
              -{Math.round(oferta.descuento_pct)}%
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <Semaforo value={oferta.semaforo} />
        {oferta.fecha_fin && (
          <span className="text-xs text-slate-500">
            hasta {new Date(oferta.fecha_fin).toLocaleDateString('es-GT')}
          </span>
        )}
      </div>
    </Link>
  );
}
