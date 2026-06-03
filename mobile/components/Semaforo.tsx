import { Text, View } from 'react-native';
import { COLORS } from '@/lib/api';
import type { Semaforo as SemaforoType } from '@/lib/types';

const LABELS: Record<SemaforoType, string> = {
  verde:    'Oferta real',
  amarillo: 'Oferta normal',
  rojo:     'No es oferta real',
};

const BG: Record<SemaforoType, string> = {
  verde:    COLORS.verde,
  amarillo: COLORS.amarillo,
  rojo:     COLORS.rojo,
};

export function Semaforo({ value }: { value: SemaforoType }) {
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: BG[value],
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
      }}
    >
      <Text style={{ color: value === 'amarillo' ? '#000' : '#fff', fontSize: 11, fontWeight: '600' }}>
        {LABELS[value]}
      </Text>
    </View>
  );
}
