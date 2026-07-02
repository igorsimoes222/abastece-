import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

const veiculos = [
  { id: '1', nome: 'Honda Civic 2022', placa: 'ABC-1D23', tipo: 'Gasolina', cor: 'Cinza', icone: '🚗', limite: 'R$ 500', gasto: 'R$ 234,50', km: '12.450 km' },
  { id: '2', nome: 'Fiat Strada 2021', placa: 'DEF-2E45', tipo: 'Flex', cor: 'Branco', icone: '🚐', limite: 'R$ 800', gasto: 'R$ 412,00', km: '38.200 km' },
  { id: '3', nome: 'VW Gol 2020', placa: 'GHI-3F67', tipo: 'Gasolina', cor: 'Prata', icone: '🚗', limite: 'R$ 300', gasto: 'R$ 89,00', km: '45.100 km' },
];

const motoristas = [
  { id: '1', nome: 'Carlos Santos', veiculo: 'ABC-1D23', gasto: 'R$ 234,50', abast: 4 },
  { id: '2', nome: 'Marina Lima', veiculo: 'DEF-2E45', gasto: 'R$ 412,00', abast: 6 },
  { id: '3', nome: 'Roberto Alves', veiculo: 'GHI-3F67', gasto: 'R$ 89,00', abast: 2 },
];

export default function FrotaScreen({ navigation }) {
  const [tabAtiva, setTabAtiva] = useState('veiculos');

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestão de Frota</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Text style={styles.addText}>+ Adicionar</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo frota */}
      <View style={styles.resumoCard}>
        <View style={styles.resumoItem}>
          <Text style={styles.resumoValue}>3</Text>
          <Text style={styles.resumoLabel}>Veículos</Text>
        </View>
        <View style={styles.resumoDivider} />
        <View style={styles.resumoItem}>
          <Text style={styles.resumoValue}>3</Text>
          <Text style={styles.resumoLabel}>Motoristas</Text>
        </View>
        <View style={styles.resumoDivider} />
        <View style={styles.resumoItem}>
          <Text style={[styles.resumoValue, { color: colors.laranja }]}>R$ 735,50</Text>
          <Text style={styles.resumoLabel}>Gasto junho</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tabAtiva === 'veiculos' && styles.tabActive]}
          onPress={() => setTabAtiva('veiculos')}
        >
          <Text style={[styles.tabText, tabAtiva === 'veiculos' && styles.tabTextActive]}>
            🚗 Veículos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tabAtiva === 'motoristas' && styles.tabActive]}
          onPress={() => setTabAtiva('motoristas')}
        >
          <Text style={[styles.tabText, tabAtiva === 'motoristas' && styles.tabTextActive]}>
            👤 Motoristas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {tabAtiva === 'veiculos' ? (
          veiculos.map(v => (
            <View key={v.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconWrap}>
                  <Text style={{ fontSize: 26 }}>{v.icone}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNome}>{v.nome}</Text>
                  <Text style={styles.cardSub}>{v.tipo} • {v.cor}</Text>
                </View>
                <View style={styles.placaBadge}>
                  <Text style={styles.placaText}>{v.placa}</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Gasto mês</Text>
                  <Text style={styles.statValue}>{v.gasto}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Limite</Text>
                  <Text style={[styles.statValue, { color: colors.verde }]}>{v.limite}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>KM total</Text>
                  <Text style={styles.statValue}>{v.km}</Text>
                </View>
              </View>

              {/* Barra de uso */}
              <View style={styles.usageBar}>
                <View style={[styles.usageFill, {
                  width: `${(parseFloat(v.gasto.replace('R$ ', '').replace(',', '.')) / parseFloat(v.limite.replace('R$ ', ''))) * 100}%`
                }]} />
              </View>
              <Text style={styles.usageLabel}>
                {v.gasto} de {v.limite} no mês
              </Text>
            </View>
          ))
        ) : (
          motoristas.map(m => (
            <View key={m.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(33,150,243,0.1)' }]}>
                  <Text style={{ fontSize: 26 }}>👤</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardNome}>{m.nome}</Text>
                  <Text style={styles.cardSub}>Veículo: {m.veiculo}</Text>
                </View>
                <View style={styles.abastBadge}>
                  <Text style={styles.abastText}>{m.abast}x</Text>
                </View>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Gasto mês</Text>
                  <Text style={styles.statValue}>{m.gasto}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Abastecimentos</Text>
                  <Text style={[styles.statValue, { color: colors.verde }]}>{m.abast} no mês</Text>
                </View>
              </View>
            </View>
          ))
        )}

        {/* Relatório */}
        <TouchableOpacity style={styles.relatorioBtn}>
          <Text style={styles.relatorioIcon}>📊</Text>
          <Text style={styles.relatorioText}>Exportar relatório gerencial</Text>
          <Text style={styles.relatorioArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 20, color: colors.text },
  headerTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  addBtn: {
    backgroundColor: colors.verde, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  addText: { color: colors.white, fontSize: 12, fontWeight: '800' },

  resumoCard: {
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: spacing.md,
    flexDirection: 'row', alignItems: 'center',
  },
  resumoItem: { flex: 1, alignItems: 'center', gap: 4 },
  resumoValue: { fontSize: 18, fontWeight: '900', color: colors.text },
  resumoLabel: { fontSize: 10, color: colors.textSec, fontWeight: '600' },
  resumoDivider: { width: 1, height: 36, backgroundColor: colors.border },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg, padding: 4,
  },
  tab: { flex: 1, padding: 12, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.verde },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSec },
  tabTextActive: { color: colors.white },

  scroll: { padding: spacing.xl, paddingTop: 0, gap: 12 },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(108,194,74,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardNome: { fontSize: 15, fontWeight: '800', color: colors.text },
  cardSub: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  placaBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  placaText: { fontSize: 12, fontWeight: '800', color: colors.text, letterSpacing: 1 },
  abastBadge: {
    backgroundColor: 'rgba(108,194,74,0.1)', borderWidth: 1, borderColor: 'rgba(108,194,74,0.2)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  abastText: { fontSize: 14, fontWeight: '900', color: colors.verde },

  cardStats: { flexDirection: 'row', gap: 10 },
  statItem: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 10 },
  statLabel: { fontSize: 10, color: colors.textSec, fontWeight: '600', marginBottom: 3 },
  statValue: { fontSize: 14, fontWeight: '800', color: colors.text },

  usageBar: { height: 6, backgroundColor: colors.border, borderRadius: 10, overflow: 'hidden' },
  usageFill: { height: '100%', backgroundColor: colors.verde, borderRadius: 10 },
  usageLabel: { fontSize: 11, color: colors.textSec },

  relatorioBtn: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  relatorioIcon: { fontSize: 22 },
  relatorioText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  relatorioArrow: { color: colors.verde, fontSize: 18, fontWeight: '700' },
});
