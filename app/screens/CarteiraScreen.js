import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { carteiraService } from '../services/carteiraService';

const bandeiraBg = {
  VISA: ['#1a1f6b', '#1e3a8a'],
  MC: ['#eb001b', '#f79e1b'],
  ELO: ['#00a4e0', '#ffcb05'],
  PIX: ['#32bcad', '#1a8f83'],
};

export default function CarteiraScreen({ navigation }) {
  const [filtroExtrato, setFiltroExtrato] = useState('Todos');
  const [resumo, setResumo] = useState(null);
  const [extrato, setExtrato] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const filtros = ['Todos', 'Abastecimentos', 'Cashback'];

  useEffect(() => {
    Promise.all([
      carteiraService.resumo(),
      carteiraService.extrato(),
    ]).then(([r, e]) => {
      setResumo(r);
      setExtrato(Array.isArray(e) ? e : (e?.extrato ?? []));
    }).catch(() => {}).finally(() => setCarregando(false));
  }, []);

  const extratoFiltrado = extrato.filter(e => {
    if (filtroExtrato === 'Todos') return true;
    if (filtroExtrato === 'Abastecimentos') return e.tipo === 'abastecimento';
    if (filtroExtrato === 'Cashback') return e.tipo === 'cashback';
    return true;
  });

  const cashbackValor = resumo?.cashbackAcumulado
    ? `R$ ${parseFloat(resumo.cashbackAcumulado).toFixed(2).replace('.', ',')}`
    : 'R$ 0,00';

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carteira</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Text style={styles.iconBtnText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card principal — cashback */}
        <View style={styles.saldoCard}>
          <View style={styles.saldoGlow} />
          <Text style={styles.saldoLabel}>CASHBACK ACUMULADO</Text>
          {carregando ? (
            <ActivityIndicator color={colors.verde} size="large" style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.saldoValor}>{cashbackValor}</Text>
          )}
          <Text style={styles.saldoSub}>Desconto automático no próximo abastecimento</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoNum}>{resumo?.totalAbastecimentos ?? '0'}</Text>
              <Text style={styles.infoLabel2}>Abastecimentos</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNum}>
                R$ {parseFloat(resumo?.totalGasto || 0).toFixed(0)}
              </Text>
              <Text style={styles.infoLabel2}>Total gasto</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Text style={styles.infoNum}>{resumo?.percentualCashback ?? '1'}%</Text>
              <Text style={styles.infoLabel2}>Cashback</Text>
            </View>
          </View>
        </View>

        {/* Aviso */}
        <View style={styles.avisoCard}>
          <Text style={styles.avisoIcon}>💳</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.avisoTitulo}>Pagamento direto ao posto</Text>
            <Text style={styles.avisoDesc}>
              Você paga direto com seu cartão ou Pix. O app só intermedia — nenhum saldo fica aqui.
            </Text>
          </View>
        </View>

        {/* Pré-autorização */}
        <TouchableOpacity style={styles.preAuthAcesso}>
          <View style={styles.preAuthAcessoLeft}>
            <Text style={{ fontSize: 22 }}>🔒</Text>
            <View>
              <Text style={styles.preAuthAcessoTitulo}>Pré-autorização</Text>
              <Text style={styles.preAuthAcessoDesc}>Defina um limite antes de ir ao posto</Text>
            </View>
          </View>
          <Text style={styles.preAuthAcessoArrow}>›</Text>
        </TouchableOpacity>

        {/* Extrato */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Extrato</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Historico')}>
              <Text style={styles.verTudo}>Ver tudo</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosRow}
            style={{ marginBottom: 12 }}
          >
            {filtros.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filtroChip, filtroExtrato === f && styles.filtroChipActive]}
                onPress={() => setFiltroExtrato(f)}
              >
                <Text style={[styles.filtroChipText, filtroExtrato === f && styles.filtroChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.extratoList}>
            {carregando ? (
              <ActivityIndicator color={colors.verde} style={{ padding: 20 }} />
            ) : extratoFiltrado.length === 0 ? (
              <View style={styles.vazio}>
                <Text style={styles.vazioIcon}>📋</Text>
                <Text style={styles.vazioText}>Nenhuma movimentação ainda</Text>
                <Text style={styles.vazioSub}>Seus abastecimentos aparecerão aqui</Text>
              </View>
            ) : (
              extratoFiltrado.map(e => (
                <View key={e.id} style={styles.extratoItem}>
                  <View style={[
                    styles.extratoIconWrap,
                    e.tipo === 'abastecimento' && { backgroundColor: 'rgba(229,57,53,0.08)' },
                    e.tipo === 'cashback' && { backgroundColor: 'rgba(255,152,0,0.08)' },
                  ]}>
                    <Text style={{ fontSize: 18 }}>{e.tipo === 'cashback' ? '💰' : '⛽'}</Text>
                  </View>
                  <View style={styles.extratoInfo}>
                    <Text style={styles.extratoTitulo}>
                      {e.tipo === 'cashback' ? 'Cashback recebido' : (e.desc ?? 'Abastecimento')}
                    </Text>
                    <Text style={styles.extratoSub}>{e.data} • {e.status ?? ''}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.extratoValor, { color: e.tipo === 'cashback' ? colors.laranja : colors.text }]}>
                      {e.valor}
                    </Text>
                    {e.cashback && (
                      <Text style={{ fontSize: 11, color: colors.laranja, fontWeight: '700' }}>
                        {e.cashback} CB
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🗺️', label: 'Mapa', screen: 'Mapa' },
          { icon: '⛽', label: 'Abastecer', screen: 'Autorizacao' },
          { icon: '👛', label: 'Carteira', screen: 'Carteira', active: true },
          { icon: '🕐', label: 'Histórico', screen: 'Historico' },
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
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 20, color: colors.text },

  scroll: { padding: spacing.xl, paddingTop: 0, gap: 16 },

  saldoCard: {
    backgroundColor: colors.verdeBg,
    borderRadius: radius.xxl, padding: 24,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.2)',
    overflow: 'hidden', position: 'relative', gap: 4,
  },
  saldoGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(109,194,41,0.08)',
  },
  saldoLabel: {
    fontSize: 11, color: 'rgba(109,194,41,0.7)',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1,
  },
  saldoValor: { fontSize: 44, fontWeight: '900', color: colors.text, marginTop: 4, lineHeight: 50 },
  saldoSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  infoItem: { flex: 1, alignItems: 'center', gap: 2 },
  infoNum: { fontSize: 16, fontWeight: '900', color: colors.text },
  infoLabel2: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
  infoDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },

  avisoCard: {
    backgroundColor: 'rgba(43,95,170,0.10)',
    borderWidth: 1, borderColor: 'rgba(43,95,170,0.2)',
    borderRadius: radius.lg, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  avisoIcon: { fontSize: 26 },
  avisoTitulo: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 2 },
  avisoDesc: { fontSize: 12, color: colors.textSec, lineHeight: 16 },

  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  verTudo: { fontSize: 13, color: colors.verde, fontWeight: '600' },

  filtrosRow: { gap: 8 },
  filtroChip: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 7,
  },
  filtroChipActive: { backgroundColor: 'rgba(108,194,74,0.1)', borderColor: colors.verde },
  filtroChipText: { fontSize: 12, fontWeight: '700', color: colors.textSec },
  filtroChipTextActive: { color: colors.verde },

  extratoList: { gap: 1 },
  extratoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  extratoIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  extratoInfo: { flex: 1 },
  extratoTitulo: { fontSize: 14, fontWeight: '700', color: colors.text },
  extratoSub: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  extratoValor: { fontSize: 15, fontWeight: '900' },

  vazio: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  vazioIcon: { fontSize: 40 },
  vazioText: { fontSize: 15, fontWeight: '800', color: colors.text },
  vazioSub: { fontSize: 13, color: colors.textSec },

  preAuthAcesso: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.25)',
    borderRadius: radius.xl, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  preAuthAcessoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preAuthAcessoTitulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  preAuthAcessoDesc: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  preAuthAcessoArrow: { fontSize: 22, color: colors.textSec },

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
