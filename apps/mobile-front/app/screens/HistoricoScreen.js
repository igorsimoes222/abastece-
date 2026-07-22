import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { api } from '../services/api';

function metodoPagamentoIcon(metodo) {
  if (!metodo) return '';
  const m = metodo.toLowerCase();
  if (m.includes('pix')) return '🔑';
  if (m.includes('débito') || m.includes('debito')) return '🏦';
  if (m.includes('dinheiro') || m.includes('posto')) return '💵';
  return '💳';
}

function formatarData(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

function formatarHora(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const barMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function HistoricoScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/historico')
      .then(res => setItens(res?.itens ?? []))
      .catch(() => setItens([]))
      .finally(() => setCarregando(false));
  }, []);

  const filtered = itens.filter(h => {
    const q = busca.toLowerCase();
    return (
      `bico ${h.bico_numero}`.toLowerCase().includes(q) ||
      (h.status ?? '').toLowerCase().includes(q) ||
      (h.placa ?? '').toLowerCase().includes(q) ||
      (h.metodo_pagamento ?? '').toLowerCase().includes(q)
    );
  });

  const totalGasto = itens.reduce((s, h) => s + parseFloat(h.valor_cobrado || 0), 0);
  const totalCashback = itens.reduce((s, h) => s + parseFloat(h.cashback_gerado || 0), 0);

  // Agrupamento por data
  const grupos = [];
  const gruposMap = {};
  filtered.forEach(h => {
    const data = formatarData(h.created_at || h.iniciado_em);
    if (!gruposMap[data]) {
      gruposMap[data] = [];
      grupos.push(data);
    }
    gruposMap[data].push(h);
  });

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Resumo */}
        <View style={styles.resumoRow}>
          {[
            { icon: '⛽', value: String(itens.length), label: 'Abastecimentos' },
            { icon: '💸', value: `R$${totalGasto.toFixed(0)}`, label: 'Total gasto' },
            { icon: '💰', value: `R$${totalCashback.toFixed(2).replace('.', ',')}`, label: 'Cashback', green: true },
          ].map(item => (
            <View key={item.label} style={styles.resumoCard}>
              <Text style={styles.resumoIcon}>{item.icon}</Text>
              <Text style={[styles.resumoValue, item.green && { color: colors.laranja }]}>
                {item.value}
              </Text>
              <Text style={styles.resumoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Busca */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por bico ou status..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Lista */}
        {carregando ? (
          <ActivityIndicator color={colors.verde} size="large" style={{ paddingVertical: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.vazio}>
            <Text style={styles.vazioIcon}>⛽</Text>
            <Text style={styles.vazioText}>Nenhum abastecimento ainda</Text>
            <Text style={styles.vazioSub}>Faça seu primeiro abastecimento pelo app!</Text>
          </View>
        ) : (
          grupos.map(grupo => (
            <View key={grupo}>
              <Text style={styles.dateSep}>{grupo}</Text>
              {gruposMap[grupo].map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.histItem}
                  onPress={() => navigation.navigate('Comprovante', {
                    posto: { nome: 'Posto', preco: item.preco_litro ?? '0', cashback: '1' },
                    bomba: `#${item.bico_numero}`,
                    valorCobrado: parseFloat(item.valor_cobrado || 0).toFixed(2).replace('.', ','),
                    litros: parseFloat(item.volume_litros || 0).toFixed(3),
                  })}
                >
                  <View style={styles.histIcon}>
                    <Text style={{ fontSize: 22 }}>⛽</Text>
                  </View>
                  <View style={styles.histInfo}>
                    <Text style={styles.histPosto}>Bico #{item.bico_numero ?? '--'}</Text>
                    <Text style={styles.histDet}>
                      {formatarHora(item.created_at)} •{' '}
                      <Text style={{ color: item.status === 'concluido' ? colors.verde : colors.laranja }}>
                        {item.status === 'concluido' ? 'Concluído' : item.status}
                      </Text>
                    </Text>
                    <View style={styles.histMetaRow}>
                      {item.metodo_pagamento && (
                        <Text style={styles.histMetodo}>
                          {metodoPagamentoIcon(item.metodo_pagamento)} {item.metodo_pagamento}
                        </Text>
                      )}
                      {item.placa && (
                        <Text style={styles.histPlaca}>🚗 {item.placa}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histValor}>
                      R$ {parseFloat(item.valor_cobrado || item.valor_autorizado || 0).toFixed(2).replace('.', ',')}
                    </Text>
                    {item.volume_litros > 0 && (
                      <Text style={styles.histLitros}>
                        {parseFloat(item.volume_litros).toFixed(3)} L
                      </Text>
                    )}
                    {item.cashback_gerado > 0 && (
                      <Text style={styles.histCashback}>
                        +R$ {parseFloat(item.cashback_gerado).toFixed(2).replace('.', ',')} CB
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🗺️', label: 'Mapa', screen: 'Mapa' },
          { icon: '⛽', label: 'Abastecer', screen: 'NFC' },
          { icon: '👛', label: 'Carteira', screen: 'Carteira' },
          { icon: '🕐', label: 'Histórico', screen: 'Historico', active: true },
          { icon: '👤', label: 'Perfil', screen: 'Perfil' },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: colors.text },

  scroll: { padding: spacing.xl, paddingTop: 0, gap: 14 },

  resumoRow: { flexDirection: 'row', gap: 10 },
  resumoCard: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 3,
  },
  resumoIcon: { fontSize: 18 },
  resumoValue: { fontSize: 16, fontWeight: '900', color: colors.text },
  resumoLabel: { fontSize: 9, color: colors.textSec, fontWeight: '600', textAlign: 'center' },

  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },

  dateSep: {
    fontSize: 11, fontWeight: '800', color: colors.textSec,
    textTransform: 'uppercase', letterSpacing: 1,
    paddingVertical: 8,
  },
  histItem: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
  },
  histIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(108,194,74,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  histInfo: { flex: 1 },
  histPosto: { fontSize: 14, fontWeight: '800', color: colors.text },
  histDet: { fontSize: 12, color: colors.textSec, marginTop: 2 },
  histRight: { alignItems: 'flex-end' },
  histValor: { fontSize: 15, fontWeight: '900', color: colors.text },
  histLitros: { fontSize: 11, color: colors.textSec },
  histCashback: { fontSize: 11, color: colors.laranja, fontWeight: '700' },
  histMetaRow: { flexDirection: 'row', gap: 8, marginTop: 3, flexWrap: 'wrap' },
  histMetodo: { fontSize: 10, color: colors.textMuted },
  histPlaca: { fontSize: 10, color: colors.textMuted },

  vazio: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  vazioIcon: { fontSize: 48 },
  vazioText: { fontSize: 16, fontWeight: '800', color: colors.text },
  vazioSub: { fontSize: 13, color: colors.textSec, textAlign: 'center' },

  bottomNav: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 10, paddingBottom: 28,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: colors.textSec, fontWeight: '500' },
  navLabelActive: { color: colors.verde, fontWeight: '700' },
});
