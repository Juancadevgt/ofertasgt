import { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api, COLORS } from '@/lib/api';
import { OfertaCard } from '@/components/OfertaCard';
import type { Oferta } from '@/lib/types';

type Semaforo = 'verde' | 'amarillo' | 'rojo';

export default function HomeScreen() {
  const router = useRouter();
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semaforo, setSemaforo] = useState<Semaforo | null>(null);
  const [canasta, setCanasta] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.ofertas({
        semaforo: semaforo || undefined,
        canasta: canasta || undefined,
        limit: 60,
      });
      setOfertas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [semaforo, canasta]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Barra de acciones */}
      <View style={{ flexDirection: 'row', gap: 8, padding: 12, flexWrap: 'wrap' }}>
        <Chip label="🔍 Buscar" onPress={() => router.push('/buscar')} />
        <Chip label="🔔 Alertas" onPress={() => router.push('/alertas')} />
        <Chip
          label="🛒 Canasta básica"
          active={canasta}
          onPress={() => setCanasta((v) => !v)}
        />
      </View>

      {/* Filtros semáforo */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingBottom: 8 }}>
        <Chip label="🟢 Real" active={semaforo === 'verde'} onPress={() => setSemaforo(semaforo === 'verde' ? null : 'verde')} />
        <Chip label="🟡 Normal" active={semaforo === 'amarillo'} onPress={() => setSemaforo(semaforo === 'amarillo' ? null : 'amarillo')} />
        <Chip label="🔴 Falsa" active={semaforo === 'rojo'} onPress={() => setSemaforo(semaforo === 'rojo' ? null : 'rojo')} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.primary} />
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: COLORS.rojo, fontWeight: '600' }}>Error al cargar ofertas</Text>
          <Text style={{ color: COLORS.textMute, fontSize: 12, marginTop: 4 }}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={ofertas}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OfertaCard oferta={item} />}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: COLORS.textMute, fontSize: 15 }}>No hay ofertas con esos filtros.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function Chip({ label, onPress, active }: { label: string; onPress: () => void; active?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? COLORS.primaryDark : COLORS.card,
        borderColor: active ? COLORS.primaryDark : COLORS.border,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: active ? '#fff' : COLORS.text, fontSize: 13, fontWeight: '500' }}>
        {label}
      </Text>
    </Pressable>
  );
}
