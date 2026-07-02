import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

const VEICULOS = [
  {
    placa: 'ABC-1D23', modelo: 'Fiat Strada', motorista: 'João Mendes',
    km: '128.430', limMes: 500, usadoMes: 300, status: 'ativo',
  },
  {
    placa: 'XYZ-9K01', modelo: 'VW Delivery', motorista: 'Ana Paula',
    km: '89.210', limMes: 800, usadoMes: 704, status: 'limite',
  },
  {
    placa: 'DEF-5G78', modelo: 'Iveco Daily', motorista: 'Carlos Ramos',
    km: '201.880', limMes: 1200, usadoMes: 384, status: 'ativo',
  },
  {
    placa: 'GHI-3L45', modelo: 'Mercedes Sprinter', motorista: 'Ricardo Lima',
    km: '55.990', limMes: 1500, usadoMes: 0, status: 'inativo',
  },
];

const STATUS_COLOR = {
  ativo:   { bg: 'rgba(16,185,129,0.12)', text: '#6ee7b7', label: 'Ativo' },
  limite:  { bg: 'rgba(245,158,11,0.12)', text: '#fcd34d', label: 'Próx. limite' },
  inativo: { bg: 'rgba(136,146,164,0.12)', text: '#8892a4', label: 'Inativo' },
};

export default function FrotaScreen({ navigation }) {
  const [tab, setTab] = useState('veiculos');

  const totalVeiculos = VEICULOS.length;
  const totalGasto = VEICULOS.reduce((a, b) => a + b.usadoMes, 0);
  const totalLimite = VEICULOS.reduce((a, b) => a + b.limMes, 0);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Gestão de frota</Text>
          <Text style={s.headerSub}>Transportadora Veloz LTDA</Text>
        </View>
        <TouchableOpacity style={s.addBtn}>
          <Ionicons name="add" size={20} color={colors.accent} />
          <Text style={s.addBtnText}>Veículo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Resumo */}
        <View style={s.summaryGrid}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>{totalVeiculos}</Text>
            <Text style={s.summaryLabel}>Veículos</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: colors.accent2 }]}>
              R$ {totalGasto.toLocaleString('pt-BR')}
            </Text>
            <Text style={s.summaryLabel}>Gasto no mês</Text>
          </View>
          <View style={s.summaryCard}>
            <Text style={[s.summaryVal, { color: colors.green }]}>
              R$ {(totalLimite - totalGasto).toLocaleString('pt-BR')}
            </Text>
            <Text style={s.summaryLabel}>Saldo restante</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={s.tabs}>
          <TouchableOpacity
            style={[s.tab, tab === 'veiculos' && s.tabActive]}
            onPress={() => setTab('veiculos')}
          >
            <Text style={[s.tabText, tab === 'veiculos' && s.tabTextActive]}>Veículos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, tab === 'motoristas' && s.tabActive]}
            onPress={() => setTab('motoristas')}
          >
            <Text style={[s.tabText, tab === 'motoristas' && s.tabTextActive]}>Motoristas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tab, tab === 'relatorios' && s.tabActive]}
            onPress={() => setTab('relatorios')}
          >
            <Text style={[s.tabText, tab === 'relatorios' && s.tabTextActive]}>Relatórios</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de veículos */}
        {tab === 'veiculos' && (
          <View style={s.list}>
            {VEICULOS.map((v, i) => {
              const st = STATUS_COLOR[v.status];
              const pct = Math.round((v.usadoMes / v.limMes) * 100);
              const barColor = pct >= 85 ? colors.amber : pct <= 40 ? colors.green : colors.accent;
              return (
                <View key={i} style={[s.veiculoCard, { borderLeftColor: barColor }]}>
                  <View style={s.vcHeader}>
                    <View>
                      <Text style={s.vcPlaca}>{v.placa}</Text>
                      <Text style={s.vcModelo}>{v.modelo} · {v.motorista}</Text>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                      <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                    </View>
                  </View>

                  <View style={s.vcMeta}>
                    <Text style={s.vcMetaText}>{v.km} km registrados</Text>
                    <Text style={s.vcMetaText}>
                      R${v.usadoMes} / R${v.limMes} mês ({pct}%)
                    </Text>
                  </View>

                  <View style={s.limitBar}>
                    <View style={[s.limitFill, { width: pct + '%', backgroundColor: barColor }]} />
                  </View>

                  <View style={s.vcActions}>
                    <TouchableOpacity style={s.vcBtn}>
                      <Ionicons name="flash" size={13} color={colors.accent} />
                      <Text style={s.vcBtnText}>Pré-autorizar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.vcBtn}>
                      <Ionicons name="time" size={13} color={colors.muted} />
                      <Text style={s.vcBtnText}>Histórico</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.vcBtn}>
                      <Ionicons name="settings" size={13} color={colors.muted} />
                      <Text style={s.vcBtnText}>Limites</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {tab === 'motoristas' && (
          <View style={s.emptyState}>
            <Ionicons name="person-outline" size={48} color={colors.border} />
            <Text style={s.emptyText}>Lista de motoristas</Text>
            <Text style={s.emptySub}>Cadastre os motoristas vinculados à frota</Text>
            <TouchableOpacity style={s.emptyBtn}>
              <Text style={s.emptyBtnText}>+ Adicionar motorista</Text>
            </TouchableOpacity>
          </View>
        )}

        {tab === 'relatorios' && (
          <View style={s.list}>
            {['Consumo por veículo', 'Abastecimentos por período', 'Quilometragem', 'Gastos por motorista'].map((rel, i) => (
              <TouchableOpacity key={i} style={s.relCard}>
                <Ionicons name="document-text" size={20} color={colors.accent} />
                <Text style={s.relText}>{rel}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    rowGap: 12, columnGap: 12,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  headerSub: { fontSize: 12, color: colors.muted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 4, columnGap: 4,
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(37,99,235,0.3)',
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 13, color: colors.accent },
  summaryGrid: {
    flexDirection: 'row',
    rowGap: 8, columnGap: 8,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 12,
    rowGap: 4, columnGap: 4,
  },
  summaryVal: { fontSize: 16, fontWeight: '600', color: colors.text },
  summaryLabel: { fontSize: 10, color: colors.muted },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    rowGap: 6, columnGap: 6,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabActive: { borderColor: colors.accent, backgroundColor: 'rgba(37,99,235,0.1)' },
  tabText: { fontSize: 12, color: colors.muted },
  tabTextActive: { color: colors.accent, fontWeight: '600' },
  list: { padding: 16, paddingTop: 0, gap: 10 },
  veiculoCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 3,
    padding: 14,
    rowGap: 10, columnGap: 10,
  },
  vcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vcPlaca: { fontSize: 16, fontWeight: '600', color: colors.text, letterSpacing: 1 },
  vcModelo: { fontSize: 12, color: colors.muted, marginTop: 2 },
  statusBadge: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '500' },
  vcMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  vcMetaText: { fontSize: 11, color: colors.muted },
  limitBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  limitFill: { height: 4, borderRadius: 2 },
  vcActions: { flexDirection: 'row', gap: 8 },
  vcBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 4, columnGap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 7,
  },
  vcBtnText: { fontSize: 11, color: colors.muted },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    rowGap: 8, columnGap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.muted },
  emptySub: { fontSize: 13, color: colors.border },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyBtnText: { color: colors.accent, fontSize: 14 },
  relCard: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 12, columnGap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
  },
  relText: { flex: 1, fontSize: 14, color: colors.text },
});
