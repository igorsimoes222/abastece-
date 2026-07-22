import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PosStatusBar from '../components/StatusBar';
import { colors, radius, font } from '../config/theme';

// Em produção: usar a API da Cielo para impressão via Smart terminal
// A Smart Cielo tem impressora térmica integrada acessível via SDK
async function imprimirVia(tipo) {
  // TODO: integrar com SDK da Cielo para impressão
  // tipo: 'estabelecimento' | 'cliente'
  console.log(`Imprimindo via do ${tipo}...`);
  await new Promise(r => setTimeout(r, 800)); // simulação
}

function LinhaResumo({ label, valor, destaque }) {
  return (
    <View style={s.linha}>
      <Text style={s.linhaLabel}>{label}</Text>
      <Text style={[s.linhaVal, destaque && s.destaque]}>{valor}</Text>
    </View>
  );
}

export default function ConclusaoScreen({ navigation, route }) {
  const { solicitacao, bico, bomba, resumo } = route.params;

  const [imprimindo, setImprimindo] = useState(false);
  const [viaClienteImpresa, setViaClienteImpresa] = useState(false);

  const volume = resumo?.litros
    ? `${Number(resumo.litros).toFixed(3).replace('.', ',')} L`
    : '—';

  const valorFinal = resumo?.valor_real
    ? `R$ ${Number(resumo.valor_real).toFixed(2).replace('.', ',')}`
    : `R$ ${Number(solicitacao.valor).toFixed(2).replace('.', ',')}`;

  async function handleImprimirCliente(resposta) {
    if (!resposta) {
      // Não imprimir — vai para tela de bombas
      navigation.navigate('Bombas');
      return;
    }
    setImprimindo(true);
    try {
      await imprimirVia('cliente');
      setViaClienteImpresa(true);
    } catch {
      Alert.alert('Erro de impressão', 'Não foi possível imprimir. Tente novamente.');
    } finally {
      setImprimindo(false);
    }
  }

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <PosStatusBar />

      <View style={s.corpo}>
        {/* Ícone de sucesso */}
        <View style={s.checkCircle}>
          <Text style={s.checkIcon}>✓</Text>
        </View>

        <Text style={s.clienteNome}>{solicitacao.cliente_nome}</Text>
        <Text style={s.bicoInfo}>{solicitacao.placa} · {bomba.nome} · Bico {bico.numero}</Text>

        {/* Resumo do abastecimento */}
        <View style={s.card}>
          <LinhaResumo label="Volume"    valor={volume} />
          <LinhaResumo label="Valor"     valor={valorFinal} destaque />
          <LinhaResumo label="Produto"   valor={bico.combustivel} />
          <LinhaResumo label="Pagamento" valor={solicitacao.metodo_pagamento} />
        </View>

        {/* Status do comprovante digital */}
        <View style={s.digitalBadge}>
          <Text style={s.digitalText}>📱 Comprovante enviado para o app do cliente</Text>
        </View>

        {/* Impressão da 2ª via */}
        {!viaClienteImpresa ? (
          <View style={s.impressaoCard}>
            <Text style={s.impressaoTitulo}>Imprimir 2ª via para o cliente?</Text>
            <Text style={s.impressaoSub}>1ª via do estabelecimento já foi impressa</Text>
            <View style={s.impressaoBotoes}>
              {imprimindo ? (
                <ActivityIndicator color={colors.amber} />
              ) : (
                <>
                  <TouchableOpacity
                    style={[s.btnImp, s.btnNao]}
                    onPress={() => handleImprimirCliente(false)}
                  >
                    <Text style={s.btnNaoText}>Não</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.btnImp, s.btnSim]}
                    onPress={() => handleImprimirCliente(true)}
                  >
                    <Text style={s.btnSimText}>Sim, imprimir</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={s.impressaoOk}>
            <Text style={s.impressaoOkText}>✓ 2ª via impressa</Text>
          </View>
        )}
      </View>

      {/* Botão voltar */}
      {viaClienteImpresa && (
        <View style={s.rodape}>
          <TouchableOpacity
            style={s.btnVoltar}
            onPress={() => navigation.navigate('Bombas')}
          >
            <Text style={s.btnVoltarText}>Voltar às bombas</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela:            { flex: 1, backgroundColor: colors.bg },
  corpo:           { flex: 1, padding: 14, gap: 10, alignItems: 'stretch' },
  checkCircle:     { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.greenDim, borderWidth: 2, borderColor: colors.green, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 4 },
  checkIcon:       { fontSize: 24, color: colors.green },
  clienteNome:     { fontSize: font.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
  bicoInfo:        { fontSize: font.sm, color: colors.muted, textAlign: 'center' },
  card:            { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  linha:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  linhaLabel:      { fontSize: font.sm, color: colors.muted, width: 75 },
  linhaVal:        { fontSize: font.base, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  destaque:        { color: colors.green, fontSize: font.md, fontWeight: '800' },
  digitalBadge:    { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.greenDim, borderWidth: 1, borderColor: `${colors.green}30`, borderRadius: radius.sm, padding: 10 },
  digitalText:     { fontSize: font.sm, color: colors.green, flex: 1 },
  impressaoCard:   { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 4 },
  impressaoTitulo: { fontSize: font.md, fontWeight: '700', color: colors.text },
  impressaoSub:    { fontSize: font.sm, color: colors.muted, marginBottom: 8 },
  impressaoBotoes: { flexDirection: 'row', gap: 8, height: 44, alignItems: 'center' },
  btnImp:          { flex: 1, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  btnNao:          { backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  btnNaoText:      { fontSize: font.base, color: colors.muted, fontWeight: '700' },
  btnSim:          { backgroundColor: colors.amber },
  btnSimText:      { fontSize: font.base, color: '#111', fontWeight: '800' },
  impressaoOk:     { backgroundColor: colors.greenDim, borderRadius: radius.sm, borderWidth: 1, borderColor: `${colors.green}30`, padding: 10, alignItems: 'center' },
  impressaoOkText: { fontSize: font.base, color: colors.green, fontWeight: '700' },
  rodape:          { padding: 12 },
  btnVoltar:       { backgroundColor: colors.surface, borderRadius: radius.md, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  btnVoltarText:   { fontSize: font.md, fontWeight: '700', color: colors.text },
});
