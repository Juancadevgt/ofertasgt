import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '@/lib/api';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="index" options={{ title: '🛒 Ofertas GT' }} />
        <Stack.Screen name="buscar" options={{ title: 'Buscar producto' }} />
        <Stack.Screen name="alertas" options={{ title: 'Alertas' }} />
        <Stack.Screen name="producto/[id]" options={{ title: 'Producto' }} />
      </Stack>
    </>
  );
}
