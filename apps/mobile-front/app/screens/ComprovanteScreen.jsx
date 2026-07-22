import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

export default function ComprovanteScreen({ navigation, route }) {
  const {
    posto, bomba, placa,
    litros = '19.8',
    valorCobrado = '124.60',
    valorAutorizado = '200.00',
  } = route?.params || {};

  const cashback = (parseFloat(valorCobrado) * 0.05).toFixed(2);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Abastecimento PostoPrático\n${posto?.nome || 'Shell Centro'} · Bomba ${bomba || '04'}\n${litros}L · R$ ${valorCobrado}\nCashback: R$ ${cashback}`,
      });
    } catch (_) {}
  };

  const linhas = [
    { label: 'Posto', valor: posto?.nome || 'Shell Centro' },
    { label: 'Bomba', valor: `Bico ${bomba || '04'}` },
    { label: 'Produto', valor: 'Gasolina C' },
    { label: 'Litros abastecidos', valor: `${litros} L` },
    { label: 'Preço por litro', valor: 'R$ 6,29' },
    { label: 'Valor autorizado', valor: `R$ ${valorAutorizado}` },
    { label: 'Valor cobrado', valor: `R$ ${valorCobrado}`, destaque: true },
    { label: 'Cashback (5%)', valor: `+ R$ ${cashback}`, verde: true },
    { label: 'Placa', valor: placa || 'ABC-1D23' },
    { label: 'Pagamento', valor: 'Visa •••• 4521' },
    { label: 'Data/Hora', valor: new Date().toLocaleString('pt-BR') },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.content}>

        {/* Ícone de sucesso */}
        <View style={s.successWrap}>
          <View style={s.successIcon}>
            <Ionicons name="checkmark" size={32} color={colors.green} />
          </View>
          <Text style={s.successTitle}>Abastecimento concluído</Text>
          <Text style={s.successAmount}>R$ {valorCobrado}</Text>
          <Text style={s.successSub}>Cobrado · Visa •••• 4521</Text>
        </View>

        {/* Cashback badge */}
        <View style={s.cashbackBanner}>
          <Ionicons name="wallet" size={20} color={colors.green} />
          <View>
            <Text style={s.cbVal}>+ R$ {cashback} de cashback</Text>
            <Text style={s.cbSub}>Creditado na sua carteira PostoPrático</Text>
          </View>
        </View>

        {/* Detalhes */}
        <View style={s.receiptCard}>
          {linhas.map((l, i) => (
            <View key={i} style={[s.receiptRow, i < linhas.length - 1 && s.receiptRowBorder]}>
              <Text style={s.receiptLabel}>{l.label}</Text>
              <Text style={[
                s.receiptVal,
                l.verde && { color: colors.green },
                l.destaque && { color: colors.text, fontWeight: '600' },
              ]}>
                {l.valor}
              </Text>
            </View>
          ))}
        </View>

        {/* Ações */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.actionBtn}>
            <Ionicons name="print" size={18} color={colors.muted} />
            <Text style={s.actionText}>Imprimir</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color={colors.muted} />
            <Text style={s.actionText}>Enviar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.actionBtnPrimary]}>
            <Ionicons name="document-text" size={18} color={colors.white} />
            <Text style={[s.actionText, { color: colors.white }]}>PDF</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.btnHome}
          onPress={() => navigation.navigate('Mapa')}
        >
          <Ionicons name="home" size={18} color={colors.white} />
          <Text style={s.btnHomeText}>Voltar ao início</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Historico')}
          style={s.linkBtn}
        >
          <Text style={s.linkText}>Ver histórico de abastecimentos</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, rowGap: 16, columnGap: 16, paddingBottom: 40 },
  successWrap: { alignItems: 'center', rowGap: 8, columnGap: 8, paddingVertical: 8 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16,185,129,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  successAmount: { fontSize: 40, fontWeight: '600', color: colors.text, lineHeight: 48 },
  successSub: { fontSize: 13, color: colors.muted },
  cashbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 12, columnGap: 12,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
    borderRadius: radius.lg,
    padding: 14,
  },
  cbVal: { fontSize: 16, fontWeight: '600', color: colors.green },
  cbSub: { fontSize: 11, color: colors.muted },
  receiptCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  receiptRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  receiptLabel: { fontSize: 13, color: colors.muted },
  receiptVal: { fontSize: 13, color: colors.text },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 6, columnGap: 6,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 12,
  },
  actionBtnPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  actionText: { fontSize: 13, color: colors.muted },
  btnHome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8, columnGap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  btnHomeText: { color: colors.white, fontSize: 15, fontWeight: '600' },
  linkBtn: { alignItems: 'center' },
  linkText: { color: colors.accent2, fontSize: 13 },
});
