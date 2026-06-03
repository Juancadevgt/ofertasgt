'use client';

import { useMemo } from 'react';
import type { HistorialPunto } from '@/lib/types';

type Props = { historial: HistorialPunto[] };

export function PriceHistoryChart({ historial }: Props) {
  const { points, min, max, ticks } = useMemo(() => {
    if (!historial.length) return { points: '', min: 0, max: 0, ticks: [] as { x: number; y: number; label: string }[] };
    const sorted = [...historial].sort((a, b) => a.fecha.localeCompare(b.fecha));
    const xs = sorted.map((p) => new Date(p.fecha).getTime());
    const ys = sorted.map((p) => p.precio);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys) * 0.9;
    const maxY = Math.max(...ys) * 1.1;
    const w = 600;
    const h = 200;
    const sx = (x: number) => ((x - minX) / Math.max(maxX - minX, 1)) * w;
    const sy = (y: number) => h - ((y - minY) / Math.max(maxY - minY, 1)) * h;

    const points = sorted.map((p) => `${sx(new Date(p.fecha).getTime())},${sy(p.precio)}`).join(' ');
    const ticks = sorted.filter((_, i) => i % Math.ceil(sorted.length / 5) === 0).map((p) => ({
      x: sx(new Date(p.fecha).getTime()),
      y: sy(p.precio),
      label: new Date(p.fecha).toLocaleDateString('es-GT', { month: 'short', year: '2-digit' }),
    }));

    return { points, min: minY, max: maxY, ticks };
  }, [historial]);

  if (!historial.length) {
    return (
      <div className="text-slate-500 text-sm bg-slate-50 border border-slate-200 rounded p-4 text-center">
        Aún no hay historial de precios para este producto.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="font-semibold text-slate-800">Historial de precios</h3>
        <span className="text-xs text-slate-500">últimos 24 meses</span>
      </div>
      <svg viewBox="0 0 600 220" className="w-full h-48" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#1976d2" strokeWidth="2" />
        {ticks.map((t, i) => (
          <g key={i}>
            <circle cx={t.x} cy={t.y} r="3" fill="#1976d2" />
            <text x={t.x} y="215" fontSize="10" textAnchor="middle" fill="#64748b">{t.label}</text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-slate-500 mt-2">
        Rango: Q{min.toFixed(2)} – Q{max.toFixed(2)}
      </p>
    </div>
  );
}
