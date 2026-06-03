import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { api, COLORS } from '@/lib/api';
import type { Producto } from '@/lib/types';

export default function BuscarScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    const term = q.trim();
    if (!term) return;
    setLoading(true);
    try {
      setResults(await api.productos({ search: term }));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={onSearch}
          placeholder="Ej: frijol, arroz, aceite..."
          placeholderTextColor={COLORS.textMute}
          autoFocus
          style={{
            flex: 1,
            backgroundColor: COLORS.card,
            borderColor: COLORS.border,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            color: COLORS.text,
          }}
        />
        <Pressable
          onPress={onSearch}
          style={({ pressed }) => ({
            backgroundColor: COLORS.primary,
            paddingHorizontal: 16,
            justifyContent: 'center',
            borderRadius: 10,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Buscar</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/producto/${item.id}`)}
              style={({ pressed }) => ({
                backgroundColor: COLORS.card,
                borderColor: COLORS.border,
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 8,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>
                {item.nombre}{item.marca ? ` · ${item.marca}` : ''}
              </Text>
              <Text style={{ color: COLORS.textMute, fontSize: 12, marginTop: 2 }}>
                {item.categoria?.icono} {item.categoria?.nombre} · por {item.unidad}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            q ? <Text style={{ color: COLORS.textMute, textAlign: 'center', marginTop: 40 }}>Sin resultados</Text> : null
          }
        />
      )}
    </View>
  );
}
