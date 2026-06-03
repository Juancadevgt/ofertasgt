import Link from 'next/link';
import { api } from '@/lib/api';

export default async function BuscarPage({
  searchParams,
}: { searchParams: { q?: string } }) {
  const q = (searchParams.q || '').trim();
  const productos = q
    ? await api.productos({ search: q }).catch(() => [])
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Buscar producto</h1>

      <form action="/buscar" method="get" className="mb-6">
        <div className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Ej: frijol, arroz, aceite..."
            className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-base"
            autoFocus
          />
          <button
            type="submit"
            className="bg-primary-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-900"
          >
            Buscar
          </button>
        </div>
      </form>

      {q && (
        <div className="space-y-2">
          {productos.length === 0 ? (
            <p className="text-slate-600">No encontramos productos para “{q}”.</p>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                {productos.length} resultado(s) para “{q}”
              </p>
              <ul className="divide-y bg-white rounded-lg border border-slate-200">
                {productos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/producto/${p.id}`}
                      className="flex items-center justify-between p-3 hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium">
                          {p.nombre}
                          {p.marca && <span className="text-slate-500 font-normal"> · {p.marca}</span>}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.categoria?.icono} {p.categoria?.nombre} · por {p.unidad}
                        </div>
                      </div>
                      <span className="text-primary-700">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
