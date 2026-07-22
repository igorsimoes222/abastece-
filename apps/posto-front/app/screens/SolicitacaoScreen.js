import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PosStatusBar from '../components/StatusBar';
import { colors, radius, font } from '../config/theme';
import { getSolicitacoes, aprovarSolicitacao, recusarSolicitacao } from '../services/api';
import { POLLING_INTERVAL, TIMER_APROVACAO } from '../config/env';

function LinhaDetalhe({ label, valor, destaque }) {
  return (
    <View style={s.linha}>
      <Text style={s.linhaLabel}>{label}</Text>
      <Text style={[s.linhaVal, destaque && s.destaque]}>{valor}</Text>
    </View>
  );
}

export default function SolicitacaoScreen({ navigation, route }) {
  const { bico, bomba } = route.params;

  const [solicitacao, setSolicitacao] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [acao, setAcao]               = useState(null); // 'aprovando' | 'recusando'
  const [timer, setTimer]             = useState(TIMER_APROVACAO);
  const timerRef                      = useRef(null);

  // Carrega solicitação pendente do bico
  useEffect(() => {
    async function carregar() {
      try {
        const data = await getSolicitacoes(bico.id);
        setSolicitacao(data.solicitacao ?? null);
      } catch {
        setSolicitacao(null);
      } finally {
        setLoading(false);
      }
    }
    carregar();
    const id = setInterval(carregar, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [bico.id]);

  // Timer de aprovação
  useEffect(() => {
    if (!solicitacao) return;
    setTimer(TIMER_APROVACAO);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          // Tempo esgotado — volta para bicos
          navigation.goBack();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [solicitacao?.id]);

  async function handleAprovar() {
    setAcao('aprovando');
    try {
      await aprovarSolicitacao(solicitacao.id);
      navigation.replace('Abastecendo', { solicitacao, bico, bomba });
    } catch (e) {
      Alert.alert('Erro', e.message ?? 'Falha ao aprovar. Tente novamente.');
      setAcao(null);
    }
  }

  async function handleRecusar() {
    Alert.alert(
      'Recusar solicitação',
      `Recusar abastecimento de ${solicitacao.cliente_nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Recusar',
          style: 'destructive',
          onPress: async () => {
            setAcao('recusando');
            try {
              await recusarSolicitacao(solicitacao.id);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Erro', e.message ?? 'Falha ao recusar.');
              setAcao(null);
            }
          },
        },
      ]
    );
  }

  const pct = (timer / TIMER_APROVACAO) * 100;
  const corTimer = timer <= 8 ? colors.red : colors.amber;

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <PosStatusBar />

      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backSeta}>‹</Text>
        <Text style={s.backText}>{bomba.nome} · Bicos</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color={colors.amber} size="large" style={{ flex: 1 }} />
      ) : !solicitacao ? (
        <View style={s.vazio}>
          <Text style={s.vazioIcon}>✓</Text>
          <Text style={s.vazioText}>Bico {bico.numero} livre</Text>
          <Text style={s.vazioSub}>Nenhuma solicitação pendente</Text>
        </View>
      ) : (
        <>
          <View style={s.corpo}>
            {/* Identificação do bico */}
            <View style={s.bicoTag}>
              <Text style={s.bicoTagText}>
                {bomba.nome} · Bico {bico.numero} · {bico.combustivel}
              </Text>
            </View>

            {/* Dados do cliente */}
            <View style={s.card}>
              <Text style={s.cardTitulo}>Dados do cliente</Text>
              <LinhaDetalhe label="Cliente"    valor={solicitacao.cliente_nome} />
              <LinhaDetalhe label="Veículo"    valor={`${solicitacao.placa} · ${solicitacao.modelo ?? ''}`} />
              <LinhaDetalhe label="Pagamento"  valor={solicitacao.metodo_pagamento} />
              <LinhaDetalhe label="Valor"      valor={`R$ ${Number(solicitacao.valor).toFixed(2).replace('.', ',')}`} destaque />
            </View>

            {/* Timer */}
            <View style={s.timerCard}>
              <View style={s.timerHeader}>
                <Text style={s.timerLabel}>Tempo para aprovar</Text>
                <Text style={[s.timerNum, { color: corTimer }]}>{timer}s</Text>
              </View>
              <View style={s.barraFundo}>
                <View style={[s.barraFill, { width: `${pct}%`, backgroundColor: corTimer }]} />
              </View>
            </View>
          </View>

          {/* Botões de ação */}
          <View style={s.botoes}>
            <TouchableOpacity
              style={[s.btn, s.btnRecusar]}
              onPress={handleRecusar}
              disabled={!!acao}
            >
              <Text style={s.btnRecusarText}>Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.btn, s.btnAprovar, !!acao && s.btnDisabled]}
              onPress={handleAprovar}
              disabled={!!acao}
            >
              {acao === 'aprovando'
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.btnAprovarText}>Aprovar</Text>
              }
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela:         { flex: 1, backgroundColor: colors.bg },
  back:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backSeta:     { fontSize: 22, color: colors.muted, lineHeight: 24 },
  backText:     { fontSize: font.base, color: colors.muted },
  corpo:        { flex: 1, padding: 12, gap: 10 },
  bicoTag:      { backgroundColor: colors.amberDim, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.amberDim },
  bicoTagText:  { fontSize: font.sm, fontWeight: '800', color: colors.amber, textTransform: 'uppercase', letterSpacing: 0.4 },
  card:         { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  cardTitulo:   { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, color: colors.muted, marginBottom: 8 },
  linha:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  linhaLabel:   { fontSize: font.sm, color: colors.muted, width: 75 },
  linhaVal:     { fontSize: font.base, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  destaque:     { color: colors.green, fontSize: font.lg, fontWeight: '800' },
  timerCard:    { backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.border },
  timerHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  timerLabel:   { fontSize: font.sm, color: colors.muted },
  timerNum:     { fontSize: font.xl, fontWeight: '800', fontVariant: ['tabular-nums'] },
  barraFundo:   { height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  barraFill:    { height: '100%', borderRadius: 3 },
  botoes:       { flexDirection: 'row', gap: 10, padding: 12 },
  btn:          { flex: 1, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnRecusar:   { backgroundColor: colors.redDim, borderWidth: 1, borderColor: `${colors.red}50` },
  btnRecusarText:{ fontSize: font.md, fontWeight: '800', color: colors.red },
  btnAprovar:   { backgroundColor: colors.green },
  btnAprovarText:{ fontSize: font.md, fontWeight: '800', color: '#fff' },
  btnDisabled:  { opacity: 0.6 },
  vazio:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  vazioIcon:    { fontSize: 40, color: colors.green },
  vazioText:    { fontSize: font.lg, fontWeight: '700', color: colors.text },
  vazioSub:     { fontSize: font.base, color: colors.muted },
});
