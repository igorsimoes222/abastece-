import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

export default function AbastecendoScreen({ navigation, route }) {
  const { posto, bomba, modo, valor, placa } = route?.params || {};
  const [litros, setLitros] = useState(0);
  const [valorAtual, setValorAtual] = useState(0);
  const [concluido, setConcluido] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  const precoPorLitro = 6.29;
  const valorMax = parseFloat(valor) || 200;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    const interval = setInterval(() => {
      setLitros(prev => {
        const novoLitros = parseFloat((prev + 0.3).toFixed(1));
        const novoValor = parseFloat((novoLitros * precoPorLitro).toFixed(2));
        setValorAtual(novoValor);
        setProgresso(Math.min((novoValor / valorMax) * 100, 100));
        if (novoValor >= valorMax * 0.65) {
          clearInterval(interval);
          setTimeout(() => setConcluido(true), 1000);
        }
        return novoLitros;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleConcluir = () => {
    navigation.navigate('Comprovante', {
      posto,
      bomba,
      placa,
      litros: litros.toFixed(1),
      valorCobrado: valorAtual.toFixed(2),
      valorAutorizado: valorMax.toFixed(2),
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        <View style={s.topRow}>
          <Text style={s.postoName}>{posto?.nome || 'Shell Centro'}</Text>
          <View style={s.bombaBadge}>
            <Text style={s.bombaBadgeText}>Bomba {bomba || '04'}</Text>
          </View>
        </View>

        <Animated.View style={[s.iconWrap, { transform: [{ scale: pulse }] }]}>
          <View style={s.iconRing}>
            <Ionicons name="flame" size={44} color={colors.accent} />
          </View>
        </Animated.View>

        <Text style={s.status}>{concluido ? 'Abastecimento concluído!' : 'Abastecendo...'}</Text>
        <Text style={s.subStatus}>
          {concluido
            ? 'Processando pagamento...'
            : `Aguarde — o frentista está abastecendo\nBomba programada · ${modo || 'Pré-autorização'}`}
        </Text>

        <View style={s.progressContainer}>
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: `${progresso}%` }]} />
          </View>
          <Text style={s.progressText}>
            R$ {valorAtual.toFixed(2)} de R$ {valorMax.toFixed(2)} (limite)
          </Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: colors.green }]}>{litros.toFixed(1)}</Text>
            <Text style={s.statLabel}>Litros</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statVal}>R${precoPorLitro.toFixed(2)}</Text>
            <Text style={s.statLabel}>Preço/L</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statVal, { color: colors.green }]}>R${valorAtual.toFixed(2)}</Text>
            <Text style={s.statLabel}>Valor atual</Text>
          </View>
        </View>

        <View style={s.infoBox}>
          <Ionicons name="shield-checkmark" size={14} color={colors.green} />
          <Text style={s.infoText}>
            Cobrança feita apenas pelo valor real abastecido. Placa: {placa || 'ABC-1D23'}
          </Text>
        </View>

        {concluido && (
          <TouchableOpacity style={s.btnConcluir} onPress={handleConcluir}>
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
            <Text style={s.btnText}>Ver comprovante</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  postoName: { fontSize: 16, fontWeight: '600', color: colors.text },
  bombaBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bombaBadgeText: { fontSize: 12, color: colors.muted },
  iconWrap: { marginTop: 20, marginBottom: 20 },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  status: { fontSize: 22, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subStatus: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  progressContainer: { alignSelf: 'stretch', marginBottom: 20 },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  statsRow: { flexDirection: 'row', alignSelf: 'stretch', marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statVal: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  statLabel: { fontSize: 10, color: colors.muted },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: radius.md,
    padding: 12,
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 11, color: colors.muted, lineHeight: 16, marginLeft: 8 },
  btnConcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignSelf: 'stretch',
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
