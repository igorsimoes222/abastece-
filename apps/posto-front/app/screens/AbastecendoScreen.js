import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PosStatusBar from '../components/StatusBar';
import { colors, radius, font } from '../config/theme';
import { getStatusBomba, confirmarConclusao } from '../services/api';
import { POLLING_INTERVAL } from '../config/env';

export default function AbastecendoScreen({ navigation, route }) {
  const { solicitacao, bico, bomba } = route.params;

  const [status, setStatus]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [concluindo, setConcluindo] = useState(false);

  const poll = useCallback(async () => {
    try {
      const data = await getStatusBomba(bico.id);
      setStatus(data);

      // CBC detectou conclusão automaticamente (bico devolvido)
      if (data.status === 'concluido') {
        navigation.replace('Conclusao', {
          solicitacao,
          bico,
          bomba,
          resumo: data.resumo,
        });
      }
    } catch {
      // mantém último estado
    } finally {
      setLoading(false);
    }
  }, [bico.id]);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [poll]);

  // Fallback manual caso o CBC não detecte automaticamente
  async function handleConcluirManual() {
    Alert.alert(
      'Confirmar conclusão',
      'O bico já foi devolvido? O abastecimento está encerrado?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, concluir',
          onPress: async () => {
            setConcluindo(true);
            try {
              const data = await confirmarConclusao(solicitacao.id);
              navigation.replace('Conclusao', {
                solicitacao,
                bico,
                bomba,
                resumo: data.resumo,
              });
            } catch (e) {
              Alert.alert('Erro', e.message ?? 'Falha ao concluir.');
              setConcluindo(false);
            }
          },
        },
      ]
    );
  }

  const litros = status?.litros ?? '—';
  const valorAtual = status?.valor_atual
    ? `R$ ${Number(status.valor_atual).toFixed(2).replace('.', ',')}`
    : '—';

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <PosStatusBar />

      {/* Header ao vivo */}
      <View style={s.liveBar}>
        <View style={s.livePill}>
          <View style={s.pulseDot} />
          <Text style={s.liveText}>Abastecendo</Text>
        </View>
        <Text style={s.liveBico}>{bomba.nome} · Bico {bico.numero}</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.green} size="large" style={{ flex: 1 }} />
      ) : (
        <View style={s.corpo}>
          {/* Stats principais */}
          <View style={s.statsCard}>
            <Text style={s.litrosNum}>
              {typeof litros === 'number' ? litros.toFixed(3) : litros}
              <Text style={s.litrosUnit}> L</Text>
            </Text>
            <Text style={s.litrosLabel}>Volume abastecido</Text>
            <Text style={s.valorAtual}>{valorAtual}</Text>
            <Text style={s.valorLabel}>Valor atual</Text>
          </View>

          {/* Info do cliente */}
          <View style={s.infoCard}>
            <View style={s.infoRow}><Text style={s.infoKey}>Cliente</Text><Text style={s.infoVal}>{solicitacao.cliente_nome}</Text></View>
            <View style={s.infoRow}><Text style={s.infoKey}>Placa</Text><Text style={s.infoVal}>{solicitacao.placa}</Text></View>
            <View style={s.infoRow}><Text style={s.infoKey}>Limite</Text><Text style={s.infoVal}>R$ {Number(solicitacao.valor).toFixed(2).replace('.', ',')}</Text></View>
            <View style={s.infoRow}><Text style={s.infoKey}>Produto</Text><Text style={s.infoVal}>{bico.combustivel}</Text></View>
          </View>

          <Text style={s.aguardando}>
            Aguardando bico ser devolvido para encerrar automaticamente...
          </Text>
        </View>
      )}

      {/* Botão de conclusão manual */}
      <View style={s.rodape}>
        <TouchableOpacity
          style={[s.btnConcluir, concluindo && s.btnDisabled]}
          onPress={handleConcluirManual}
          disabled={concluindo}
        >
          {concluindo
            ? <ActivityIndicator color="#111" size="small" />
            : <Text style={s.btnConcluirText}>Marcar como concluído</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela:         { flex: 1, backgroundColor: colors.bg },
  liveBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  livePill:     { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.greenDim, borderWidth: 1, borderColor: `${colors.green}40`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pulseDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  liveText:     { fontSize: font.sm, fontWeight: '700', color: colors.green },
  liveBico:     { fontSize: font.sm, color: colors.muted },
  corpo:        { flex: 1, padding: 12, gap: 10 },
  statsCard:    { backgroundColor: colors.surface, borderRadius: radius.md, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', borderBottomWidth: 1 },
  litrosNum:    { fontSize: font.hero, fontWeight: '700', color: colors.text, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  litrosUnit:   { fontSize: font.lg, fontWeight: '400', color: colors.muted },
  litrosLabel:  { fontSize: 9, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  valorAtual:   { fontSize: font.xxl, fontWeight: '700', color: colors.green, marginTop: 10, fontVariant: ['tabular-nums'] },
  valorLabel:   { fontSize: 9, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
  infoCard:     { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoKey:      { fontSize: font.base, color: colors.muted },
  infoVal:      { fontSize: font.base, color: colors.text, fontWeight: '600' },
  aguardando:   { fontSize: font.sm, color: colors.muted, textAlign: 'center', lineHeight: 18 },
  rodape:       { padding: 12 },
  btnConcluir:  { backgroundColor: colors.amber, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center' },
  btnConcluirText:{ fontSize: font.md, fontWeight: '800', color: '#111' },
  btnDisabled:  { opacity: 0.6 },
});
