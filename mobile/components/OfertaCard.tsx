import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, formatQ } from '@/lib/api';
import { Semaforo } from './Semaforo';
import type { Oferta } from '@/lib/types';

export function OfertaCard({ oferta }: { oferta: Oferta }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push(`/producto/${oferta.producto_id}`)}
      style={({ pressed }) => ({
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 12,
        marginBottom: 8,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textMute, fontSize: 11, marginBottom: 2 }}>
            {oferta.categoria_icono ? `${oferta.categoria_icono} ` : ''}{oferta.categoria_nombre || 'Sin categoría'}
          </Text>
          <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 15 }} numberOfLines={2}>
            {oferta.producto_nombre}
            {oferta.producto_marca ? ` · ${oferta.producto_marca}` : ''}
          </Text>
          <Text style={{ color: COLORS.textMute, fontSize: 12, marginTop: 2 }}>
            por {oferta.producto_unidad} · {oferta.supermercado_nombre}
          </Text>
          <View style={{ marginTop: 6 }}>
            <Semaforo value={oferta.semaforo} />
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 20 }}>
            {formatQ(oferta.precio_oferta)}
          </Text>
          {oferta.precio_regular > oferta.precio_oferta && (
            <Text style={{ color: COLORS.textMute, fontSize: 11, textDecorationLine: 'line-through' }}>
              {formatQ(oferta.precio_regular)}
            </Text>
          )}
          {oferta.descuento_pct > 0 && (
            <Text style={{ color: COLORS.verde, fontWeight: '600', fontSize: 12 }}>
              -{Math.round(oferta.descuento_pct)}%
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
