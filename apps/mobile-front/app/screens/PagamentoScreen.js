import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

const CARTAO_PADRAO = {
  key: 'credito',
  icon: '💳',
  titulo: 'Nubank •••• 4521',
  desc: 'Crédito • Visa',
};

const OUTRAS_FORMAS = [
  {
    key: 'credito',
    icon: '💳',
    titulo: 'Crédito',
    desc: 'Nubank •••• 4521 • Visa',
  },
  {
    key: 'debito',
    icon: '🏦',
    titulo: 'Débito',
    desc: 'Itaú •••• 9834 • Mastercard',
  },
  {
    key: 'pix',
    icon: '🔑',
    titulo: 'Pix',
    desc: 'Chave: CPF cadastrado',
  },
  {
    key: 'direto',
    icon: '💵',
    titulo: 'Dinheiro no posto',
    desc: 'Paguei diretamente no caixa',
    aviso: true,
  },
];

export default function PagamentoScreen({ navigation, route }) {
  const { posto, bico, valor, valorAbastecido } = route?.params ?? {
    posto: { nome: 'Sete Estrelas', cashback: '1' },
    bico: '03',
    valor: '100,00',
    valorAbastecido: '87,50',
  };

  const [metodo, setMetodo] = useState('credito');
  const [expandido, setExpandido] = useState(false);

  const valorNum = parseFloat((valorAbastecido ?? valor).replace(',', '.')) || 0;
  const cashbackEst = ((valorNum * parseFloat(posto.cashback ?? '1')) / 100)
    .toFixed(2).replace('.', ',');

  const selecionado = OUTRAS_FORMAS.find(m => m.key === metodo);
  const usandoPadrao = metodo === 'credito' && !expandido;

  const selecionarOutra = (key) => {
    setMetodo(key);
    setExpandido(false);
  };

  const confirmarPagamento = () => {
    if (metodo === 'direto') {
      navigation.navigate('PagoDiretoPosto', { posto, bico, valor: valorAbastecido ?? valor });
    } else {
      navigation.navigate('Comprovante', {
        posto, bico,
        valor: valorAbastecido ?? valor,
        metodoPagamento: selecionado?.titulo,
        cashback: cashbackEst,
      });
    }
  };

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Forma de Pagamento</Text>
          <Text style={styles.headerSub}>{posto.nome} • Bico #{String(bico).padStart(2, '0')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Valor */}
        <View style={styles.valorCard}>
          <Text style={styles.valorLabel}>VALOR A PAGAR</Text>
          <Text style={styles.valorNum}>R$ {valorAbastecido ?? valor}</Text>
          <Text style={styles.cashbackEst}>+ R$ {cashbackEst} de cashback</Text>
        </View>

        {/* Forma selecionada atual */}
        <Text style={styles.sectionLabel}>Pagando com</Text>

        <View style={styles.selecionadoCard}>
          <View style={styles.selecionadoIconWrap}>
            <Text style={{ fontSize: 24 }}>{selecionado?.icon ?? CARTAO_PADRAO.icon}</Text>
          </View>
          <View style={styles.selecionadoTexto}>
            <Text style={styles.selecionadoTitulo}>{selecionado?.titulo ?? CARTAO_PADRAO.titulo}</Text>
            <Text style={styles.selecionadoDesc}>{selecionado?.desc ?? CARTAO_PADRAO.desc}</Text>
            {metodo === 'credito' && !expandido && (
              <Text style={styles.padraoTag}>Cartão padrão</Text>
            )}
          </View>
          <View style={styles.checkCircle}>
            <Text style={styles.checkText}>✓</Text>
          </View>
        </View>

        {/* Aviso dinheiro */}
        {metodo === 'direto' && (
          <View style={styles.avisoBox}>
            <Text style={styles.avisoTitulo}>ℹ️ Pagamento no posto</Text>
            <Text style={styles.avisoTexto}>
              Nenhum comprovante será emitido pelo app. O abastecimento fica registrado normalmente.
            </Text>
          </View>
        )}

        {/* Botão "Outra forma" */}
        {!expandido ? (
          <TouchableOpacity style={styles.outraFormaBtn} onPress={() => setExpandido(true)}>
            <Text style={styles.outraFormaBtnText}>Outra forma de pagamento</Text>
            <Text style={styles.outraFormaArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.outraFormaLista}>
            <View style={styles.outraFormaCabecalho}>
              <Text style={styles.outraFormaLabel}>Escolha a forma de pagamento</Text>
              <TouchableOpacity onPress={() => setExpandido(false)}>
                <Text style={styles.fecharText}>✕</Text>
              </TouchableOpacity>
            </View>

            {OUTRAS_FORMAS.map(m => (
              <TouchableOpacity
                key={m.key}
                style={[styles.metodoCard, metodo === m.key && styles.metodoCardAtivo]}
                onPress={() => selecionarOutra(m.key)}
              >
                <View style={[styles.metodoIconWrap, m.aviso && styles.metodoIconAviso]}>
                  <Text style={{ fontSize: 20 }}>{m.icon}</Text>
                </View>
                <View style={styles.metodoTexto}>
                  <Text style={styles.metodoTitulo}>{m.titulo}</Text>
                  <Text style={styles.metodoDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, metodo === m.key && styles.radioAtivo]}>
                  {metodo === m.key && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnConfirm} onPress={confirmarPagamento}>
          <Text style={styles.btnConfirmText}>
            {metodo === 'direto'
              ? '✅ Registrar abastecimento'
              : `⚡ Pagar R$ ${valorAbastecido ?? valor}`}
          </Text>
        </TouchableOpacity>
      </View>
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

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, gap: 16 },

  valorCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 20,
    alignItems: 'center', gap: 4,
  },
  valorLabel: { fontSize: 11, color: colors.textSec, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  valorNum: { fontSize: 44, fontWeight: '900', color: colors.verde },
  cashbackEst: { fontSize: 13, color: colors.laranja, fontWeight: '600' },

  sectionLabel: {
    fontSize: 12, color: colors.textSec, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  selecionadoCard: {
    backgroundColor: colors.card,
    borderWidth: 2, borderColor: colors.verde,
    borderRadius: radius.xl, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  selecionadoIconWrap: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: 'rgba(109,194,41,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  selecionadoTexto: { flex: 1, gap: 2 },
  selecionadoTitulo: { fontSize: 15, fontWeight: '800', color: colors.text },
  selecionadoDesc: { fontSize: 12, color: colors.textSec },
  padraoTag: {
    fontSize: 10, color: colors.verde, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
  },
  checkCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
  },
  checkText: { color: colors.white, fontSize: 14, fontWeight: '900' },

  avisoBox: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: radius.xl, padding: 14, gap: 4,
  },
  avisoTitulo: { fontSize: 13, fontWeight: '800', color: colors.laranja },
  avisoTexto: { fontSize: 12, color: colors.textSec, lineHeight: 17 },

  outraFormaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16,
  },
  outraFormaBtnText: { fontSize: 14, color: colors.text, fontWeight: '700' },
  outraFormaArrow: { fontSize: 20, color: colors.textSec },

  outraFormaLista: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 10,
  },
  outraFormaCabecalho: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  outraFormaLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  fecharText: { fontSize: 16, color: colors.textSec, padding: 4 },

  metodoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 12,
  },
  metodoCardAtivo: { borderColor: colors.verde, backgroundColor: 'rgba(109,194,41,0.05)' },
  metodoIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(109,194,41,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  metodoIconAviso: { backgroundColor: 'rgba(245,166,35,0.12)' },
  metodoTexto: { flex: 1 },
  metodoTitulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  metodoDesc: { fontSize: 11, color: colors.textSec, marginTop: 1 },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioAtivo: { backgroundColor: colors.verde, borderColor: colors.verde },
  radioCheck: { fontSize: 11, color: colors.white, fontWeight: '900' },

  footer: { padding: spacing.xl, paddingBottom: spacing.xl },
  btnConfirm: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 16, alignItems: 'center',
  },
  btnConfirmText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
