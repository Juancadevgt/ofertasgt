import { api } from '@/lib/api';
import { OfertaCard } from '@/components/OfertaCard';
import { Filtros } from '@/components/Filtros';

type Search = {
  super?: string;
  categoria?: string;
  semaforo?: 'verde' | 'amarillo' | 'rojo';
  canasta?: string;
};

export default async function Home({ searchParams }: { searchParams: Search }) {
  const [ofertas, categorias, supermercados] = await Promise.all([
    api.ofertas({
      super: searchParams.super,
      categoria: searchParams.categoria,
      semaforo: searchParams.semaforo,
      canasta: searchParams.canasta === '1',
      limit: 60,
    }).catch(() => []),
    api.categorias().catch(() => []),
    api.supermercados().catch(() => []),
  ]);

  return (
    <div>
      <section className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Las mejores ofertas de hoy
        </h1>
        <p className="text-slate-600 text-sm">
          Compara precios entre supermercados y descubre cuáles son ofertas reales 🟢
        </p>
      </section>

      <Filtros categorias={categorias} supermercados={supermercados} />

      {ofertas.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600">
          <p className="text-lg mb-2">No encontramos ofertas con esos filtros.</p>
          <p className="text-sm">Prueba quitar algunos filtros o vuelve más tarde.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {ofertas.map((o) => (
            <OfertaCard key={o.id} oferta={o} />
          ))}
        </div>
      )}
    </div>
  );
}
