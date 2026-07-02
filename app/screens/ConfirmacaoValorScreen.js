import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Modal,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ConfirmacaoValorScreen({ navigation, route }) {
  const { posto, bico, valorProgramado, valorAbastecido } = route?.params ?? {
    posto: { nome: 'Sete Estrelas', preco: '5,89', cashback: '1' },
    bico: '03',
    valorProgramado: '100,00',
    valorAbastecido: '87,50',
  };

  const [cancelModal, setCancelModal] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const valorNum = parseFloat((valorAbastecido ?? '0').replace(',', '.'));
  const precoLitro = parseFloat((posto.preco ?? '5,89').replace(',', '.'));
  const litros = (valorNum / precoLitro).toFixed(2).replace('.', ',');
  const cashback = ((valorNum * parseFloat(posto.cashback ?? '1')) / 100)
    .toFixed(2).replace('.', ',');

  const confirmar = () => {
    navigation.replace('Pagamento', {
      posto,
      bico,
      valor: valorProgramado,
      valorAbastecido,
      litros,
    });
  };

  return (
    <ScreenWrapper edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Ícone animado */}
        <Animated.View style={[
          styles.iconWrap,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}>
          <Text style={styles.icon}>⛽</Text>
        </Animated.View>

        <Text style={styles.titulo}>Abastecimento concluído</Text>
        <Text style={styles.subtitulo}>
          Confirme o valor real abastecido para prosseguir com o pagamento
        </Text>

        {/* Card do valor */}
        <Animated.View style={[styles.valorCard, { opacity: opacityAnim }]}>
          <Text style={styles.valorLabel}>VALOR ABASTECIDO</Text>
          <Text style={styles.valorNum}>R$ {valorAbastecido}</Text>
          <View style={styles.valorDetalhe}>
            <View style={styles.detalheItem}>
              <Text style={styles.detalheNum}>{litros} L</Text>
              <Text style={styles.detalheSub}>Litros</Text>
            </View>
            <View style={styles.detalheDivider} />
            <View style={styles.detalheItem}>
              <Text style={styles.detalheNum}>R$ {posto.preco}</Text>
              <Text style={styles.detalheSub}>Preço/litro</Text>
            </View>
            <View style={styles.detalheDivider} />
            <View style={styles.detalheItem}>
              <Text style={[styles.detalheNum, { color: colors.laranja }]}>
                + R$ {cashback}
              </Text>
              <Text style={styles.detalheSub}>Cashback</Text>
            </View>
          </View>
        </Animated.View>

        {/* Comparativo programado x real */}
        {valorProgramado !== valorAbastecido && (
          <View style={styles.comparativoCard}>
            <View style={styles.comparativoRow}>
              <Text style={styles.comparativoLabel}>Valor programado</Text>
              <Text style={styles.comparativoVal}>R$ {valorProgramado}</Text>
            </View>
            <View style={styles.comparativoRow}>
              <Text style={styles.comparativoLabel}>Valor real abastecido</Text>
              <Text style={[styles.comparativoVal, { color: colors.verde }]}>
                R$ {valorAbastecido}
              </Text>
            </View>
            <View style={styles.comparativoDivider} />
            <Text style={styles.comparativoInfo}>
              Apenas o valor real será cobrado no seu cartão
            </Text>
          </View>
        )}

        {/* Posto e bico */}
        <View style={styles.postoRow}>
          <Text style={styles.postoIcon}>⛽</Text>
          <Text style={styles.postoInfo}>
            {posto.nome} • Bico #{String(bico).padStart(2, '0')}
          </Text>
        </View>
      </View>

      {/* Botões */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          Ao confirmar, o valor será enviado para cobrança no seu cartão
        </Text>
        <TouchableOpacity style={styles.btnConfirmar} onPress={confirmar}>
          <Text style={styles.btnConfirmarText}>✓ Confirmar R$ {valorAbastecido}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnCancelar} onPress={() => setCancelModal(true)}>
          <Text style={styles.btnCancelarText}>Cancelar abastecimento</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmação do cancelamento */}
      <Modal visible={cancelModal} transparent animationType="fade" onRequestClose={() => setCancelModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitulo}>Cancelar abastecimento?</Text>
            <Text style={styles.modalDesc}>
              O abastecimento já foi realizado. Ao cancelar, o frentista será notificado e o ciclo será encerrado sem cobrança.
            </Text>
            <TouchableOpacity
              style={styles.modalBtnConfirmar}
              onPress={() => {
                setCancelModal(false);
                navigation.navigate('Mapa');
              }}
            >
              <Text style={styles.modalBtnConfirmarText}>Sim, cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalBtnVoltar} onPress={() => setCancelModal(false)}>
              <Text style={styles.modalBtnVoltarText}>Voltar e confirmar pagamento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: 20,
  },

  iconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.verdeBg,
    borderWidth: 2, borderColor: 'rgba(109,194,41,0.3)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.verde, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8,
  },
  icon: { fontSize: 44 },

  titulo: {
    fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center',
  },
  subtitulo: {
    fontSize: 14, color: colors.textSec, textAlign: 'center',
    lineHeight: 20, maxWidth: 280,
  },

  valorCard: {
    backgroundColor: colors.card,
    borderWidth: 2, borderColor: colors.verde,
    borderRadius: radius.xxl, padding: 24,
    alignItems: 'center', gap: 16, width: '100%',
  },
  valorLabel: {
    fontSize: 11, color: 'rgba(109,194,41,0.7)',
    fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1,
  },
  valorNum: { fontSize: 52, fontWeight: '900', color: colors.text },
  valorDetalhe: {
    flexDirection: 'row', width: '100%', alignItems: 'center',
  },
  detalheItem: { flex: 1, alignItems: 'center', gap: 2 },
  detalheNum: { fontSize: 15, fontWeight: '900', color: colors.text },
  detalheSub: { fontSize: 11, color: colors.textSec },
  detalheDivider: { width: 1, height: 32, backgroundColor: colors.border },

  comparativoCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16,
    width: '100%', gap: 8,
  },
  comparativoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  comparativoLabel: { fontSize: 13, color: colors.textSec },
  comparativoVal: { fontSize: 13, fontWeight: '800', color: colors.text },
  comparativoDivider: { height: 1, backgroundColor: colors.border, marginVertical: 4 },
  comparativoInfo: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  postoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  postoIcon: { fontSize: 16 },
  postoInfo: { fontSize: 13, color: colors.textSec, fontWeight: '600' },

  footer: {
    padding: spacing.xl, paddingBottom: spacing.xl, gap: 10,
  },
  footerNote: {
    fontSize: 12, color: colors.textMuted, textAlign: 'center',
  },
  btnConfirmar: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 18,
    alignItems: 'center',
  },
  btnConfirmarText: { color: colors.white, fontSize: 17, fontWeight: '900' },

  btnCancelar: {
    borderWidth: 1, borderColor: 'rgba(229,57,53,0.4)',
    borderRadius: radius.lg, padding: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(229,57,53,0.06)',
  },
  btnCancelarText: { color: '#E53935', fontSize: 14, fontWeight: '700' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center', padding: 32,
  },
  modalBox: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl, padding: 28,
    alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: colors.border,
    width: '100%',
  },
  modalIcon: { fontSize: 40 },
  modalTitulo: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  modalDesc: { fontSize: 13, color: colors.textSec, textAlign: 'center', lineHeight: 20 },
  modalBtnConfirmar: {
    backgroundColor: '#E53935', borderRadius: radius.lg,
    padding: 14, alignItems: 'center', width: '100%',
  },
  modalBtnConfirmarText: { color: colors.white, fontSize: 15, fontWeight: '800' },
  modalBtnVoltar: {
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14,
    alignItems: 'center', width: '100%',
  },
  modalBtnVoltarText: { color: colors.textSec, fontSize: 14, fontWeight: '600' },
});
