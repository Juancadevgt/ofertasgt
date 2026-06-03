import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '@/lib/api';

export default function AlertasScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 20, marginBottom: 8 }}>
        Alertas por Telegram
      </Text>
      <Text style={{ color: COLORS.textMute, marginBottom: 16 }}>
        Recibe un aviso en Telegram cuando un producto que te interesa baje de precio.
      </Text>

      <View style={{ backgroundColor: COLORS.card, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12 }}>
        {[
          'Abre Telegram y busca @OfertasGTBot (próximamente).',
          'Envíale /start para activar tu cuenta.',
          'Desde la pantalla de un producto, toca "Avisarme" para suscribirte.',
        ].map((paso, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={{ color: COLORS.primary, fontWeight: '700', width: 22 }}>{i + 1}.</Text>
            <Text style={{ color: COLORS.text, flex: 1 }}>{paso}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
