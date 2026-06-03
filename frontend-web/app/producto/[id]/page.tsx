import { notFound } from 'next/navigation';
import { api, formatQ } from '@/lib/api';
import { Semaforo } from '@/components/Semaforo';
import { PriceHistoryChart } from '@/components/PriceHistoryChart';

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const data = await api.producto(params.id).catch(() => null);
  if (!data) notFound();

  const { producto, ofertas, historial } = data;
  const mejorOferta = ofertas[0];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Ofertas</a>
        <span className="mx-1">›</span>
        <span>{producto.nombre}</span>
      </nav>

      <header className="mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          {producto.categoria?.icono && <span>{producto.categoria.icono}</span>}
          <span>{producto.categoria?.nombre}</span>
          {producto.es_canasta_basica && (
            <span className="ml-1 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-[10px] font-semibold">
              CANASTA BÁSICA
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {producto.nombre}
          {producto.marca && <span className="text-slate-500 font-normal"> · {producto.marca}</span>}
        </h1>
        <p className="text-slate-500 text-sm">por {producto.unidad}</p>
      </header>

      {mejorOferta && (
        <div className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-primary-700 font-medium mb-1">Mejor precio hoy</p>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-900">
              {formatQ(mejorOferta.precio_oferta)}
            </span>
            {mejorOferta.precio_regular > mejorOferta.precio_oferta && (
              <span className="text-slate-500 line-through">{formatQ(mejorOferta.precio_regular)}</span>
            )}
            <Semaforo value={mejorOferta.semaforo} size="md" />
          </div>
          <p className="text-sm text-slate-700 mt-1">
            en <strong>{mejorOferta.supermercado_nombre}</strong>
            {mejorOferta.fecha_fin && (
              <> · termina {new Date(mejorOferta.fecha_fin).toLocaleDateString('es-GT')}</>
            )}
          </p>
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Ofertas en otros supermercados</h2>
        {ofertas.length === 0 ? (
          <p className="text-slate-600 text-sm">Sin ofertas activas en este momento.</p>
        ) : (
          <ul className="bg-white border border-slate-200 rounded-lg divide-y">
            {ofertas.map((o) => (
              <li key={o.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.supermercado_nombre}</div>
                  <Semaforo value={o.semaforo} />
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-700">{formatQ(o.precio_oferta)}</div>
                  {o.precio_regular > o.precio_oferta && (
                    <div className="text-xs text-slate-500 line-through">{formatQ(o.precio_regular)}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <PriceHistoryChart historial={historial} />
      </section>
    </div>
  );
}
