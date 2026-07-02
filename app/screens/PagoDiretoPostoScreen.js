import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function PagoDiretoPostoScreen({ navigation, route }) {
  const { posto, bico, valor } = route?.params ?? {
    posto: { nome: 'Sete Estrelas' },
    bico: '03',
    valor: '87,50',
  };

  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1, tension: 60, friction: 7, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.icon}>✓</Text>
        </Animated.View>

        <Text style={styles.titulo}>Abastecimento registrado</Text>
        <Text style={styles.subtitulo}>
          O ciclo foi concluído pelo app. O pagamento foi realizado diretamente no posto.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Posto</Text>
            <Text style={styles.rowValue}>{posto.nome}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Bico</Text>
            <Text style={styles.rowValue}>#{String(bico).padStart(2, '0')}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Valor abastecido</Text>
            <Text style={[styles.rowValue, { color: colors.verde, fontSize: 18 }]}>
              R$ {valor}
            </Text>
          </View>
        </View>

        <View style={styles.avisoCard}>
          <Text style={styles.avisoTitulo}>💵 Pago direto no posto</Text>
          <Text style={styles.avisoDesc}>
            O comprovante de pagamento foi emitido pelo posto. Este registro confirma apenas que o abastecimento foi controlado pelo Abastece+.
          </Text>
        </View>

        <View style={styles.semComprovante}>
          <Text style={styles.semComprovanteText}>
            ℹ️ Nenhum comprovante é emitido pelo app para pagamentos realizados no posto.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.btnHome}
          onPress={() => navigation.navigate('Mapa')}
        >
          <Text style={styles.btnHomeText}>Voltar ao início</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: spacing.xl, gap: 20,
  },

  iconWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(109,194,41,0.15)',
    borderWidth: 2, borderColor: 'rgba(109,194,41,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 40, color: colors.verde, fontWeight: '900' },

  titulo: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center' },
  subtitulo: {
    fontSize: 14, color: colors.textSec, textAlign: 'center',
    lineHeight: 20, maxWidth: 290,
  },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, width: '100%', gap: 8,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { fontSize: 13, color: colors.textSec },
  rowValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },

  avisoCard: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: radius.xl, padding: 16, width: '100%', gap: 6,
  },
  avisoTitulo: { fontSize: 14, fontWeight: '800', color: colors.laranja },
  avisoDesc: { fontSize: 13, color: colors.textSec, lineHeight: 18 },

  semComprovante: {
    backgroundColor: 'rgba(43,95,170,0.08)',
    borderRadius: radius.lg, padding: 12, width: '100%',
  },
  semComprovanteText: { fontSize: 12, color: '#7B9FD4', lineHeight: 16 },

  footer: { padding: spacing.xl, paddingBottom: spacing.xl },
  btnHome: {
    backgroundColor: colors.verde, borderRadius: radius.lg,
    padding: 16, alignItems: 'center',
  },
  btnHomeText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
