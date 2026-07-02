import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

const presets = [100, 200, 300, 500];

const preAuthsAtivas = [
  {
    id: '1',
    posto: 'Sete Estrelas',
    endereco: 'Av. Dr. Nelson D\'Ávila, 2100 — SJC',
    valor: '200,00',
    criada: '28/06/2026',
    status: 'ativa',
  },
];

export default function PreAutorizacaoScreen({ navigation }) {
  const [tab, setTab] = useState('ativas'); // 'ativas' | 'nova'
  const [valor, setValor] = useState('200,00');
  const [postoSelecionado, setPostoSelecionado] = useState(null);
  const [modalCancelamento, setModalCancelamento] = useState(null);
  const [cancelamentoEnviado, setCancelamentoEnviado] = useState([]);

  const postos = [
    { id: '1', nome: 'Sete Estrelas', endereco: 'Av. Dr. Nelson D\'Ávila, 2100', cidade: 'SJC — SP' },
    { id: '2', nome: 'Sete Estrelas', endereco: 'R. Anchieta, 350', cidade: 'Jacareí — SP' },
    { id: '3', nome: 'Shell', endereco: 'Av. Andrômeda, 2000', cidade: 'SJC — SP' },
  ];

  const solicitarCancelamento = (preAuth) => {
    setCancelamentoEnviado(prev => [...prev, preAuth.id]);
    setModalCancelamento(null);
  };

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Pré-autorização</Text>
          <Text style={styles.headerSub}>Defina um valor máximo para abastecer</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Aviso informativo */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 A pré-autorização é uma <Text style={{ fontWeight: '800', color: colors.text }}>garantia de limite</Text> — não é uma cobrança. Apenas o valor real abastecido será debitado no seu cartão de crédito.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'ativas' && styles.tabActive]}
          onPress={() => setTab('ativas')}
        >
          <Text style={[styles.tabText, tab === 'ativas' && styles.tabTextActive]}>
            Ativas ({preAuthsAtivas.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'nova' && styles.tabActive]}
          onPress={() => setTab('nova')}
        >
          <Text style={[styles.tabText, tab === 'nova' && styles.tabTextActive]}>
            + Nova pré-autorização
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ABA: Pré-auths ativas */}
        {tab === 'ativas' && (
          <>
            {preAuthsAtivas.length === 0 ? (
              <View style={styles.vazio}>
                <Text style={styles.vazioIcon}>🔓</Text>
                <Text style={styles.vazioTitulo}>Nenhuma pré-autorização ativa</Text>
                <Text style={styles.vazioDesc}>Crie uma para garantir seu limite em um posto</Text>
                <TouchableOpacity
                  style={styles.btnNova}
                  onPress={() => setTab('nova')}
                >
                  <Text style={styles.btnNovaText}>+ Criar pré-autorização</Text>
                </TouchableOpacity>
              </View>
            ) : (
              preAuthsAtivas.map(pa => {
                const cancelada = cancelamentoEnviado.includes(pa.id);
                return (
                  <View key={pa.id} style={[styles.preAuthCard, cancelada && styles.preAuthCardCancelada]}>
                    <View style={styles.preAuthHeader}>
                      <View style={styles.preAuthIconWrap}>
                        <Text style={{ fontSize: 22 }}>⛽</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.preAuthNome}>{pa.posto}</Text>
                        <Text style={styles.preAuthEnd}>{pa.endereco}</Text>
                      </View>
                      <View style={[
                        styles.preAuthBadge,
                        cancelada && styles.preAuthBadgeCancelada,
                      ]}>
                        <Text style={[
                          styles.preAuthBadgeText,
                          cancelada && { color: colors.laranja },
                        ]}>
                          {cancelada ? 'Cancelamento solicitado' : '🔒 Ativa'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.preAuthValorRow}>
                      <View>
                        <Text style={styles.preAuthValorLabel}>Valor garantido</Text>
                        <Text style={styles.preAuthValor}>R$ {pa.valor}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.preAuthValorLabel}>Criada em</Text>
                        <Text style={styles.preAuthData}>{pa.criada}</Text>
                      </View>
                    </View>

                    <View style={styles.preAuthInfoRow}>
                      <Text style={styles.preAuthInfoText}>
                        ℹ️ Somente este posto pode confirmar ou cancelar esta pré-autorização. Uma vez usada em um abastecimento, ela é encerrada automaticamente.
                      </Text>
                    </View>

                    {!cancelada && (
                      <TouchableOpacity
                        style={styles.btnSolicitarCancel}
                        onPress={() => setModalCancelamento(pa)}
                      >
                        <Text style={styles.btnSolicitarCancelText}>
                          Solicitar cancelamento
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ABA: Nova pré-autorização */}
        {tab === 'nova' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>1. Selecione o posto</Text>
              <Text style={styles.cardDesc}>
                A pré-autorização é vinculada a um estabelecimento específico.
              </Text>
              <View style={styles.postoList}>
                {postos.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.postoOpcao,
                      postoSelecionado?.id === p.id && styles.postoOpcaoSelected,
                    ]}
                    onPress={() => setPostoSelecionado(p)}
                  >
                    <Text style={{ fontSize: 20 }}>⛽</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postoNome}>{p.nome}</Text>
                      <Text style={styles.postoEnd}>{p.endereco} — {p.cidade}</Text>
                    </View>
                    <View style={[
                      styles.radio,
                      postoSelecionado?.id === p.id && styles.radioActive,
                    ]}>
                      {postoSelecionado?.id === p.id && (
                        <Text style={styles.radioCheck}>✓</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>2. Defina o valor máximo</Text>
              <Text style={styles.cardDesc}>
                Você não gastará mais do que este valor — pode ser menos.
              </Text>
              <Text style={styles.valorGrande}>
                <Text style={{ color: colors.verde }}>R$ </Text>{valor}
              </Text>
              <View style={styles.presets}>
                {presets.map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.presetBtn,
                      valor === `${p},00` && styles.presetBtnActive,
                    ]}
                    onPress={() => setValor(`${p},00`)}
                  >
                    <Text style={[
                      styles.presetText,
                      valor === `${p},00` && { color: colors.white },
                    ]}>
                      R$ {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.avisoCard}>
              <Text style={styles.avisoText}>
                ⚠️ Apenas cartão de crédito suporta pré-autorização. Débito e Pix não estão disponíveis para esta operação.
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Botão rodapé */}
      {tab === 'nova' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.btnConfirm,
              !postoSelecionado && styles.btnDisabled,
            ]}
            disabled={!postoSelecionado}
            onPress={() => {
              setTab('ativas');
              setPostoSelecionado(null);
            }}
          >
            <Text style={styles.btnConfirmText}>🔒 Criar pré-autorização</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de solicitação de cancelamento */}
      <Modal visible={!!modalCancelamento} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Solicitar cancelamento</Text>
            <Text style={styles.modalDesc}>
              A solicitação será enviada ao posto{' '}
              <Text style={{ fontWeight: '800', color: colors.text }}>
                {modalCancelamento?.posto}
              </Text>
              , que deverá confirmar o cancelamento.{'\n\n'}
              Enquanto não for confirmado pelo posto, a pré-autorização permanece ativa.
            </Text>
            <TouchableOpacity
              style={styles.modalBtnConfirm}
              onPress={() => solicitarCancelamento(modalCancelamento)}
            >
              <Text style={styles.modalBtnConfirmText}>Enviar solicitação</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnVoltar}
              onPress={() => setModalCancelamento(null)}
            >
              <Text style={styles.modalBtnVoltarText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
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
  headerSub: { fontSize: 12, color: colors.textSec },

  infoBox: {
    marginHorizontal: spacing.xl, marginBottom: 12,
    backgroundColor: 'rgba(43,95,170,0.10)',
    borderWidth: 1, borderColor: 'rgba(43,95,170,0.2)',
    borderRadius: radius.lg, padding: 12,
  },
  infoText: { fontSize: 13, color: '#7B9FD4', lineHeight: 18 },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl, marginBottom: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: radius.lg, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: colors.verde },
  tabText: { fontSize: 13, fontWeight: '700', color: colors.textSec },
  tabTextActive: { color: colors.white },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 16 },

  vazio: { alignItems: 'center', gap: 12, paddingVertical: 40 },
  vazioIcon: { fontSize: 48 },
  vazioTitulo: { fontSize: 18, fontWeight: '800', color: colors.text },
  vazioDesc: { fontSize: 14, color: colors.textSec, textAlign: 'center' },
  btnNova: {
    backgroundColor: colors.verde, borderRadius: radius.lg,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  btnNovaText: { color: colors.white, fontSize: 14, fontWeight: '800' },

  preAuthCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.3)',
    borderRadius: radius.xl, padding: 16, gap: 12,
  },
  preAuthCardCancelada: { borderColor: 'rgba(245,166,35,0.3)', opacity: 0.8 },
  preAuthHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  preAuthIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(109,194,41,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  preAuthNome: { fontSize: 15, fontWeight: '800', color: colors.text },
  preAuthEnd: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  preAuthBadge: {
    backgroundColor: 'rgba(109,194,41,0.1)',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  preAuthBadgeCancelada: { backgroundColor: 'rgba(245,166,35,0.1)' },
  preAuthBadgeText: { fontSize: 11, fontWeight: '700', color: colors.verde },
  preAuthValorRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  preAuthValorLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  preAuthValor: { fontSize: 28, fontWeight: '900', color: colors.verde, marginTop: 2 },
  preAuthData: { fontSize: 14, fontWeight: '700', color: colors.textSec },
  preAuthInfoRow: {
    backgroundColor: 'rgba(43,95,170,0.08)',
    borderRadius: radius.md, padding: 10,
  },
  preAuthInfoText: { fontSize: 12, color: '#7B9FD4', lineHeight: 16 },
  btnSolicitarCancel: {
    borderWidth: 2, borderColor: colors.red,
    borderRadius: radius.lg, padding: 12, alignItems: 'center',
  },
  btnSolicitarCancelText: { color: colors.red, fontSize: 14, fontWeight: '700' },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 20, gap: 12, alignItems: 'center',
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text, alignSelf: 'flex-start' },
  cardDesc: { fontSize: 13, color: colors.textSec, alignSelf: 'flex-start', lineHeight: 18 },

  postoList: { width: '100%', gap: 8 },
  postoOpcao: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.bg,
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14,
  },
  postoOpcaoSelected: { borderColor: colors.verde, backgroundColor: 'rgba(109,194,41,0.06)' },
  postoNome: { fontSize: 14, fontWeight: '800', color: colors.text },
  postoEnd: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { backgroundColor: colors.verde, borderColor: colors.verde },
  radioCheck: { fontSize: 12, color: colors.white, fontWeight: '800' },

  valorGrande: { fontSize: 40, fontWeight: '900', color: colors.text },
  presets: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    backgroundColor: 'rgba(109,194,41,0.08)',
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.2)',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
  },
  presetBtnActive: { backgroundColor: colors.verde, borderColor: colors.verde },
  presetText: { fontSize: 13, fontWeight: '700', color: colors.verde },

  avisoCard: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: radius.lg, padding: 14,
  },
  avisoText: { fontSize: 13, color: colors.laranja, lineHeight: 18 },

  footer: { padding: spacing.xl, paddingBottom: spacing.xl },
  btnConfirm: {
    backgroundColor: colors.verde, borderRadius: radius.lg, padding: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.5 },
  btnConfirmText: { color: colors.white, fontSize: 16, fontWeight: '800' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, gap: 14,
  },
  modalTitulo: { fontSize: 20, fontWeight: '900', color: colors.text },
  modalDesc: { fontSize: 14, color: colors.textSec, lineHeight: 20 },
  modalBtnConfirm: {
    backgroundColor: colors.red, borderRadius: radius.lg, padding: 14, alignItems: 'center',
  },
  modalBtnConfirmText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  modalBtnVoltar: {
    borderWidth: 2, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14, alignItems: 'center',
  },
  modalBtnVoltarText: { color: colors.textSec, fontSize: 14, fontWeight: '700' },
});
