import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PosStatusBar from '../components/StatusBar';
import { colors, radius, font } from '../config/theme';
import { getSolicitacoes } from '../services/api';
import { POLLING_INTERVAL } from '../config/env';

const STATUS_CONFIG = {
  livre:       { cor: colors.muted,  label: 'Livre',       bg: 'transparent' },
  pendente:    { cor: colors.amber,  label: 'Pendente',    bg: colors.amberDim },
  abastecendo: { cor: colors.green,  label: 'Abastecendo', bg: colors.greenDim },
  erro:        { cor: colors.red,    label: 'Erro',        bg: colors.redDim },
};

function BicoCard({ bico, onPress }) {
  const cfg = STATUS_CONFIG[bico.status] ?? STATUS_CONFIG.livre;
  const interativo = bico.status === 'pendente' || bico.status === 'abastecendo';

  return (
    <TouchableOpacity
      style={[
        s.card,
        { borderColor: cfg.cor, backgroundColor: cfg.bg },
        !interativo && s.cardFade,
      ]}
      onPress={interativo ? onPress : undefined}
      activeOpacity={interativo ? 0.75 : 1}
    >
      <Text style={s.bicoNum}>{bico.numero}</Text>
      <Text style={s.bicoTipo}>{bico.combustivel ?? '—'}</Text>
      <View style={[s.statusTag, { backgroundColor: `${cfg.cor}22` }]}>
        <Text style={[s.statusText, { color: cfg.cor }]}>{cfg.label}</Text>
      </View>
      {(bico.cliente || bico.placa) && (
        <Text style={s.bicoCliente} numberOfLines={1}>
          {bico.cliente} · {bico.placa}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function BicosScreen({ navigation, route }) {
  const { bomba } = route.params;
  const [bicos, setBicos]         = useState(bomba.bicos ?? []);
  const [refreshing, setRefresh]  = useState(false);

  const carregar = useCallback(async () => {
    try {
      // Recarrega bicos com status atualizado
      // O endpoint /frentista/bombas retorna bicos completos
      const { bicos: atualizados } = await getSolicitacoes(bomba.id);
      if (atualizados) setBicos(atualizados);
    } catch {
      // mantém dados anteriores em caso de falha
    } finally {
      setRefresh(false);
    }
  }, [bomba.id]);

  useEffect(() => {
    const id = setInterval(carregar, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [carregar]);

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <PosStatusBar />

      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backSeta}>‹</Text>
        <Text style={s.backText}>Bombas</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <Text style={s.titulo}>{bomba.nome}</Text>
        <Text style={s.subtitulo}>{bicos.map(b => b.combustivel).filter(Boolean).join(' · ')}</Text>
      </View>

      <FlatList
        data={bicos}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={s.coluna}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => (
          <BicoCard
            bico={item}
            onPress={() => navigation.navigate('Solicitacao', { bico: item, bomba })}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefresh(true); carregar(); }}
            tintColor={colors.amber}
          />
        }
        ListEmptyComponent={
          <Text style={s.vazio}>Nenhum bico cadastrado</Text>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela:       { flex: 1, backgroundColor: colors.bg },
  back:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  backSeta:   { fontSize: 22, color: colors.muted, lineHeight: 24 },
  backText:   { fontSize: font.base, color: colors.muted },
  header:     { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  titulo:     { fontSize: font.lg, fontWeight: '800', color: colors.text },
  subtitulo:  { fontSize: font.sm, color: colors.muted, marginTop: 2 },
  lista:      { padding: 12 },
  coluna:     { gap: 9, marginBottom: 9 },
  card:       { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, borderWidth: 1.5 },
  cardFade:   { opacity: 0.65 },
  bicoNum:    { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 2 },
  bicoTipo:   { fontSize: 9, color: colors.muted, marginBottom: 8 },
  statusTag:  { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  bicoCliente:{ fontSize: 9, color: colors.muted, marginTop: 5 },
  vazio:      { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
