import type { Semaforo as SemaforoType } from '@/lib/types';

const LABELS: Record<SemaforoType, string> = {
  verde:    'Oferta real',
  amarillo: 'Oferta normal',
  rojo:     'No es oferta real',
};

const STYLES: Record<SemaforoType, string> = {
  verde:    'bg-verde text-white',
  amarillo: 'bg-amarillo text-black',
  rojo:     'bg-rojo text-white',
};

export function Semaforo({ value, size = 'sm' }: { value: SemaforoType; size?: 'sm' | 'md' }) {
  const sizeCls = size === 'md' ? 'text-sm px-2.5 py-1' : 'text-xs px-2 py-0.5';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${STYLES[value]} ${sizeCls}`}
      title={LABELS[value]}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-80" />
      {LABELS[value]}
    </span>
  );
}
