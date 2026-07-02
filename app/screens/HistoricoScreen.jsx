import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

const FILTROS = ['Todos', 'Mês', 'Veículo', 'Posto'];

const HISTORICO = [
  { id: 1, posto: 'Shell Centro', data: 'Hoje · 14h32', produto: 'Gasolina C', valor: 124.60, litros: 19.8, cashback: 6.23, placa: 'ABC-1D23' },
  { id: 2, posto: 'Posto Ipiranga', data: '23/06 · 08h15', produto: 'Etanol', valor: 87.30, litros: 32.1, cashback: 4.37, placa: 'ABC-1D23' },
  { id: 3, posto: 'BR Distribuidora', data: '20/06 · 11h50', produto: 'Gasolina A', valor: 200.00, litros: 31.8, cashback: 10.00, placa: 'XYZ-9K01' },
  { id: 4, posto: 'Auto Posto Leste', data: '15/06 · 17h22', produto: 'Gasolina C', valor: 150.00, litros: 23.8, cashback: 7.50, placa: 'ABC-1D23' },
  { id: 5, posto: 'Shell Centro', data: '10/06 · 09h04', produto: 'Gasolina C', valor: 180.00, litros: 28.6, cashback: 9.00, placa: 'ABC-1D23' },
];

const totalCashback = HISTORICO.reduce((a, b) => a + b.cashback, 0);
const totalGasto = HISTORICO.reduce((a, b) => a + b.valor, 0);

export default function HistoricoScreen({ navigation }) {
  const [filtro, setFiltro] = useState('Todos');

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Meus abastecimentos</Text>
      </View>

      <ScrollView>
        {/* Cards de resumo */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <Text style={s.summaryVal}>R$ {totalGasto.toFixed(2)}</Text>
            <Text style={s.summaryLabel}>Total gasto</Text>
          </View>
          <View style={[s.summaryCard, { borderColor: 'rgba(16,185,129,0.3)' }]}>
            <Text style={[s.summaryVal, { color: colors.green }]}>
              R$ {totalCashback.toFixed(2)}
            </Text>
            <Text style={s.summaryLabel}>Cashback acumulado</Text>
          </View>
        </View>

        {/* Banner carteira */}
        <View style={s.walletBanner}>
          <Ionicons name="wallet" size={22} color={colors.green} />
          <View style={{ flex: 1 }}>
            <Text style={s.walletVal}>R$ 38,90 disponível</Text>
            <Text style={s.walletSub}>Saldo na carteira · Use no próximo abastecimento</Text>
          </View>
          <TouchableOpacity style={s.walletBtn}>
            <Text style={s.walletBtnText}>Usar</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {FILTROS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterChip, filtro === f && s.filterChipActive]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[s.filterText, filtro === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista */}
        <View style={s.list}>
          {HISTORICO.map(item => (
            <TouchableOpacity key={item.id} style={s.itemCard}>
              <View style={s.itemIcon}>
                <Ionicons name="flame" size={18} color={colors.accent2} />
              </View>
              <View style={s.itemMain}>
                <Text style={s.itemPosto}>{item.posto}</Text>
                <Text style={s.itemMeta}>{item.data} · {item.produto} · {item.placa}</Text>
                <Text style={s.itemLitros}>{item.litros} litros</Text>
              </View>
              <View style={s.itemRight}>
                <Text style={s.itemValor}>R$ {item.valor.toFixed(2)}</Text>
                <Text style={s.itemCashback}>+R$ {item.cashback.toFixed(2)} back</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
  summaryRow: {
    flexDirection: 'row',
    rowGap: 10, columnGap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    rowGap: 4, columnGap: 4,
  },
  summaryVal: { fontSize: 18, fontWeight: '600', color: colors.text },
  summaryLabel: { fontSize: 11, color: colors.muted },
  walletBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 12, columnGap: 12,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
    borderRadius: radius.lg,
    padding: 14,
    margin: 16,
    marginTop: 10,
  },
  walletVal: { fontSize: 15, fontWeight: '600', color: colors.green },
  walletSub: { fontSize: 11, color: colors.muted },
  walletBtn: {
    backgroundColor: colors.green,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  walletBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  filterScroll: { paddingLeft: 16, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderColor: colors.accent,
  },
  filterText: { fontSize: 13, color: colors.muted },
  filterTextActive: { color: colors.accent, fontWeight: '500' },
  list: { padding: 16, gap: 10 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 12, columnGap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  itemIcon: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(14,165,233,0.12)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMain: { flex: 1, gap: 2 },
  itemPosto: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemMeta: { fontSize: 11, color: colors.muted },
  itemLitros: { fontSize: 11, color: colors.muted },
  itemRight: { alignItems: 'flex-end', gap: 2 },
  itemValor: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemCashback: { fontSize: 11, color: colors.green },
});
