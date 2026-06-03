import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { api, COLORS, formatQ } from '@/lib/api';
import { Semaforo } from '@/components/Semaforo';
import type { HistorialPunto, Oferta, Producto } from '@/lib/types';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<{ producto: Producto; ofertas: Oferta[]; historial: HistorialPunto[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.producto(id!)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />;
  if (error || !data) return <Text style={{ padding: 20, color: COLORS.rojo }}>{error || 'Producto no encontrado'}</Text>;

  const { producto, ofertas, historial } = data;
  const mejor = ofertas[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 12 }}>
      <Text style={{ color: COLORS.textMute, fontSize: 12 }}>
        {producto.categoria?.icono} {producto.categoria?.nombre}
      </Text>
      <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 22 }}>
        {producto.nombre}{producto.marca ? ` · ${producto.marca}` : ''}
      </Text>
      <Text style={{ color: COLORS.textMute, fontSize: 13, marginBottom: 12 }}>
        por {producto.unidad}
      </Text>

      {mejor && (
        <View style={{ backgroundColor: COLORS.primaryLight, borderRadius: 10, padding: 12, marginBottom: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: '600', marginBottom: 4 }}>Mejor precio hoy</Text>
          <Text style={{ color: COLORS.primaryDark, fontWeight: '700', fontSize: 28 }}>{formatQ(mejor.precio_oferta)}</Text>
          <Text style={{ color: COLORS.text, marginTop: 2 }}>en {mejor.supermercado_nombre}</Text>
          <View style={{ marginTop: 6 }}><Semaforo value={mejor.semaforo} /></View>
        </View>
      )}

      <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 16, marginBottom: 6 }}>
        Comparación entre supermercados
      </Text>
      {ofertas.length === 0 ? (
        <Text style={{ color: COLORS.textMute }}>Sin ofertas activas en este momento.</Text>
      ) : (
        ofertas.map((o) => (
          <View
            key={o.id}
            style={{
              backgroundColor: COLORS.card,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 10,
              padding: 12,
              marginBottom: 6,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>{o.supermercado_nombre}</Text>
              <View style={{ marginTop: 4 }}><Semaforo value={o.semaforo} /></View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 18 }}>{formatQ(o.precio_oferta)}</Text>
              {o.precio_regular > o.precio_oferta && (
                <Text style={{ color: COLORS.textMute, fontSize: 11, textDecorationLine: 'line-through' }}>
                  {formatQ(o.precio_regular)}
                </Text>
              )}
            </View>
          </View>
        ))
      )}

      <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 16, marginTop: 16, marginBottom: 6 }}>
        Historial de precios
      </Text>
      <HistorialChart historial={historial} />
    </ScrollView>
  );
}

function HistorialChart({ historial }: { historial: HistorialPunto[] }) {
  if (!historial.length) {
    return <Text style={{ color: COLORS.textMute }}>Aún no hay historial para este producto.</Text>;
  }
  const sorted = [...historial].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const xs = sorted.map((p) => new Date(p.fecha).getTime());
  const ys = sorted.map((p) => p.precio);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys) * 0.9;
  const maxY = Math.max(...ys) * 1.1;
  const w = 320;
  const h = 160;
  const sx = (x: number) => ((x - minX) / Math.max(maxX - minX, 1)) * w;
  const sy = (y: number) => h - ((y - minY) / Math.max(maxY - minY, 1)) * h;
  const points = sorted.map((p) => `${sx(new Date(p.fecha).getTime())},${sy(p.precio)}`).join(' ');

  return (
    <View style={{ backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12 }}>
      <Svg width="100%" height={180} viewBox={`0 0 ${w} ${h + 20}`}>
        <Polyline points={points} fill="none" stroke={COLORS.primary} strokeWidth={2} />
        {sorted.filter((_, i) => i % Math.ceil(sorted.length / 5) === 0).map((p, i) => (
          <Circle key={i} cx={sx(new Date(p.fecha).getTime())} cy={sy(p.precio)} r={3} fill={COLORS.primary} />
        ))}
      </Svg>
      <Text style={{ color: COLORS.textMute, fontSize: 11, marginTop: 4 }}>
        Rango: Q{minY.toFixed(2)} – Q{maxY.toFixed(2)} · últimos 24 meses
      </Text>
    </View>
  );
}
