'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { Categoria, Supermercado } from '@/lib/types';

type Props = {
  categorias: Categoria[];
  supermercados: Supermercado[];
};

export function Filtros({ categorias, supermercados }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const categoria = params.get('categoria') || '';
  const superSlug = params.get('super') || '';
  const semaforo  = params.get('semaforo') || '';
  const canasta   = params.get('canasta') === '1';

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 mb-4 space-y-2 text-sm">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setParam('canasta', canasta ? null : '1')}
          className={`px-3 py-1 rounded-full border ${canasta ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-700 border-slate-300'}`}
        >
          🛒 Solo canasta básica
        </button>
        {(['verde','amarillo','rojo'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setParam('semaforo', semaforo === s ? null : s)}
            className={`px-3 py-1 rounded-full border ${semaforo === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'}`}
          >
            {s === 'verde' && '🟢 Oferta real'}
            {s === 'amarillo' && '🟡 Normal'}
            {s === 'rojo' && '🔴 Falsa'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-slate-600">Categoría:</label>
        <select
          value={categoria}
          onChange={(e) => setParam('categoria', e.target.value || null)}
          className="border border-slate-300 rounded px-2 py-1 bg-white"
        >
          <option value="">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.icono} {c.nombre}
            </option>
          ))}
        </select>

        <label className="text-slate-600 ml-2">Supermercado:</label>
        <select
          value={superSlug}
          onChange={(e) => setParam('super', e.target.value || null)}
          className="border border-slate-300 rounded px-2 py-1 bg-white"
        >
          <option value="">Todos</option>
          {supermercados.map((s) => (
            <option key={s.id} value={s.slug}>{s.nombre}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
