import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PosStatusBar from '../components/StatusBar';
import { colors, radius, font } from '../config/theme';
import { getBombas } from '../services/api';
import { POLLING_INTERVAL } from '../config/env';

// Ícone SVG simplificado de bomba de combustível renderizado em View
function IconeBomba({ cor }) {
  return (
    <View style={[s.icone, { borderColor: cor }]}>
      <Text style={[s.iconeTexto, { color: cor }]}>⛽</Text>
    </View>
  );
}

function statusBomba(bomba) {
  const temPendente = bomba.bicos?.some(b => b.status === 'pendente');
  const temAtivo    = bomba.bicos?.some(b => b.status === 'abastecendo');
  if (temPendente) return { cor: colors.amber, badge: 'Pendente', dim: colors.amberDim };
  if (temAtivo)    return { cor: colors.green, badge: 'Ativo',    dim: colors.greenDim };
  return             { cor: colors.border,  badge: 'Livre',    dim: 'transparent' };
}

function BombaDot({ status }) {
  const cor =
    status === 'pendente'    ? colors.amber :
    status === 'abastecendo' ? colors.green :
    status === 'erro'        ? colors.red   : colors.borderLight;
  return <View style={[s.dot, { backgroundColor: cor }]} />;
}

function BombaCard({ bomba, onPress }) {
  const { cor, badge, dim } = statusBomba(bomba);
  const livres = bomba.bicos?.filter(b => b.status === 'livre').length ?? 0;
  const total  = bomba.bicos?.length ?? 0;

  return (
    <TouchableOpacity
      style={[s.card, { borderColor: cor, backgroundColor: dim === 'transparent' ? colors.surface : dim }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={s.badgeRow}>
        <Text style={[s.badge, { color: cor }]}>{badge}</Text>
      </View>
      <IconeBomba cor={cor} />
      <Text style={[s.bombaNum, { color: colors.text }]}>{bomba.nome}</Text>
      <View style={s.dots}>
        {bomba.bicos?.map(b => <BombaDot key={b.id} status={b.status} />)}
      </View>
      <Text style={s.bombaInfo}>
        {livres === total ? `${total} bicos · todos livres` :
         `${total - livres} de ${total} ocupados`}
      </Text>
    </TouchableOpacity>
  );
}

export default function BombasScreen({ navigation }) {
  const [bombas, setBombas]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);
  const [erro, setErro]           = useState(null);

  // KPIs resumidos
  const pendentes   = bombas.flatMap(b => b.bicos).filter(b => b.status === 'pendente').length;
  const ativos      = bombas.flatMap(b => b.bicos).filter(b => b.status === 'abastecendo').length;
  const concluidos  = bombas.flatMap(b => b.bicos).filter(b => b.status === 'concluido').length;

  const carregar = useCallback(async () => {
    try {
      const data = await getBombas();
      setBombas(data.bombas ?? []);
      setErro(null);
    } catch (e) {
      setErro('Sem conexão com o backend');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [carregar]);

  if (loading) {
    return (
      <SafeAreaView style={s.tela}>
        <ActivityIndicator color={colors.amber} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.tela} edges={['top']}>
      <PosStatusBar />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.titulo}>PostoPrático</Text>
          <Text style={s.subtitulo}>Sete Estrelas · Rua Ceci, 215</Text>
        </View>
        <View style={s.kpis}>
          <View style={s.kpi}><Text style={[s.kpiVal, { color: colors.amber }]}>{pendentes}</Text><Text style={s.kpiLabel}>Pend.</Text></View>
          <View style={s.kpi}><Text style={[s.kpiVal, { color: colors.green }]}>{ativos}</Text><Text style={s.kpiLabel}>Ativo</Text></View>
          <View style={s.kpi}><Text style={[s.kpiVal, { color: colors.text }]}>{concluidos}</Text><Text style={s.kpiLabel}>Conc.</Text></View>
        </View>
      </View>

      {erro && (
        <View style={s.erroBar}>
          <Text style={s.erroText}>{erro}</Text>
        </View>
      )}

      <Text style={s.secLabel}>Selecione a bomba</Text>

      <FlatList
        data={bombas}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={s.coluna}
        contentContainerStyle={s.lista}
        renderItem={({ item }) => (
          <BombaCard
            bomba={item}
            onPress={() => navigation.navigate('Bicos', { bomba: item })}
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
          <Text style={s.vazio}>Nenhuma bomba cadastrada</Text>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela:       { flex: 1, backgroundColor: colors.bg },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  titulo:     { fontSize: font.md, fontWeight: '800', color: colors.text },
  subtitulo:  { fontSize: font.sm, color: colors.muted, marginTop: 1 },
  kpis:       { flexDirection: 'row', gap: 10 },
  kpi:        { alignItems: 'center' },
  kpiVal:     { fontSize: font.md, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kpiLabel:   { fontSize: 8, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 1 },
  secLabel:   { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9, color: colors.muted, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },
  lista:      { paddingHorizontal: 12, paddingBottom: 20 },
  coluna:     { gap: 10, marginBottom: 10 },
  card:       { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 12, borderWidth: 1.5, alignItems: 'center' },
  badgeRow:   { position: 'absolute', top: 8, right: 8 },
  badge:      { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  icone:      { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  iconeTexto: { fontSize: 24 },
  bombaNum:   { fontSize: font.base, fontWeight: '800', marginBottom: 6 },
  dots:       { flexDirection: 'row', gap: 4, marginBottom: 5 },
  dot:        { width: 7, height: 7, borderRadius: 3.5 },
  bombaInfo:  { fontSize: 9, color: colors.muted, textAlign: 'center' },
  erroBar:    { backgroundColor: colors.redDim, borderWidth: 1, borderColor: colors.red, margin: 12, borderRadius: radius.sm, padding: 8 },
  erroText:   { color: colors.red, fontSize: font.sm, textAlign: 'center' },
  vazio:      { color: colors.muted, textAlign: 'center', marginTop: 40 },
});
