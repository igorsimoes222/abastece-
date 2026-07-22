import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

const MODOS = ['Pré-autorização', 'Valor fixo', 'Tanque cheio'];

export default function AutorizacaoScreen({ navigation, route }) {
  const posto = route?.params?.posto || { nome: 'Shell Centro' };
  const [bomba, setBomba] = useState('04');
  const [modo, setModo] = useState(0);
  const [valor, setValor] = useState('200');
  const [placa] = useState('ABC-1D23');

  const handleAutorizar = () => {
    navigation.navigate('Abastecendo', {
      posto,
      bomba,
      modo: MODOS[modo],
      valor,
      placa,
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Autorizar abastecimento</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* Posto selecionado */}
        <View style={s.postoRow}>
          <View style={s.postoIcon}>
            <Ionicons name="flame" size={20} color={colors.accent2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.postoNome}>{posto.nome}</Text>
            <Text style={s.postoSub}>Posto credenciado · Cielo</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.changeBtn}>Trocar</Text>
          </TouchableOpacity>
        </View>

        {/* Código da bomba */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Código da bomba</Text>
          <Text style={s.sectionHint}>Veja o adesivo na bomba ou bico</Text>
          <View style={s.bombaBox}>
            <TextInput
              style={s.bombaInput}
              value={bomba}
              onChangeText={setBomba}
              keyboardType="numeric"
              maxLength={2}
              textAlign="center"
            />
            <View style={s.bombaMeta}>
              <Text style={s.bombaMetaText}>Bomba nº lógico {bomba}</Text>
              <View style={s.bombaBadge}>
                <Ionicons name="checkmark-circle" size={12} color={colors.green} />
                <Text style={s.bombaBadgeText}>Disponível</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Modo de autorização */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Modo de autorização</Text>
          <View style={s.modeTabs}>
            {MODOS.map((m, i) => (
              <TouchableOpacity
                key={m}
                style={[s.modeTab, modo === i && s.modeTabActive]}
                onPress={() => setModo(i)}
              >
                <Text style={[s.modeTabText, modo === i && s.modeTabTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Valor */}
        {modo !== 2 && (
          <View style={s.section}>
            <Text style={s.sectionLabel}>
              {modo === 0 ? 'Valor máximo autorizado' : 'Valor a abastecer'}
            </Text>
            <View style={s.valorRow}>
              <Text style={s.valorCur}>R$</Text>
              <TextInput
                style={s.valorInput}
                value={valor}
                onChangeText={setValor}
                keyboardType="numeric"
              />
            </View>
            <Text style={s.valorHint}>
              {modo === 0
                ? 'Você será cobrado apenas pelo valor real abastecido'
                : 'A bomba será programada com este limite exato'}
            </Text>
          </View>
        )}

        {modo === 2 && (
          <View style={[s.section, s.infoBox]}>
            <Ionicons name="information-circle" size={18} color={colors.accent2} />
            <Text style={s.infoText}>
              A bomba será autorizada sem limite fixo. A cobrança será feita pelo valor total abastecido ao encerrar.
            </Text>
          </View>
        )}

        {/* Placa e pagamento */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Identificação</Text>
          <View style={s.placaRow}>
            <Ionicons name="car" size={18} color={colors.muted} />
            <Text style={s.placaVal}>{placa}</Text>
            <Text style={s.placaLabel}>Placa identificada</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Pagamento</Text>
          <View style={s.payRow}>
            <Ionicons name="card" size={18} color={colors.muted} />
            <Text style={s.payText}>Visa •••• 4521</Text>
            <TouchableOpacity style={{  }}>
              <Text style={s.changeBtn}>Trocar</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnAutorizar} onPress={handleAutorizar}>
          <Ionicons name="flash" size={20} color={colors.white} />
          <Text style={s.btnText}>Programar bomba agora</Text>
        </TouchableOpacity>
      </View>
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
  content: { padding: 16, gap: 4 },
  postoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 12, columnGap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 8,
  },
  postoIcon: {
    width: 38,
    height: 38,
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postoNome: { fontSize: 15, fontWeight: '600', color: colors.text },
  postoSub: { fontSize: 12, color: colors.muted },
  changeBtn: { fontSize: 13, color: colors.accent },
  section: { marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 4 },
  sectionHint: { fontSize: 11, color: colors.border, marginBottom: 8 },
  bombaBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    rowGap: 16, columnGap: 16,
  },
  bombaInput: {
    fontSize: 40,
    fontWeight: '600',
    color: colors.accent,
    width: 70,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 4,
  },
  bombaMeta: { gap: 4 },
  bombaMetaText: { fontSize: 12, color: colors.muted },
  bombaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 4, columnGap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  bombaBadgeText: { fontSize: 10, color: colors.green, fontWeight: '500' },
  modeTabs: { flexDirection: 'row', gap: 8 },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeTabActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  modeTabText: { fontSize: 11, color: colors.muted, textAlign: 'center' },
  modeTabTextActive: { color: colors.accent, fontWeight: '600' },
  valorRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  valorCur: { fontSize: 22, color: colors.muted },
  valorInput: {
    fontSize: 44,
    fontWeight: '600',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingBottom: 2,
    minWidth: 100,
  },
  valorHint: { fontSize: 11, color: colors.muted, marginTop: 6 },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    rowGap: 10, columnGap: 10,
    backgroundColor: 'rgba(14,165,233,0.08)',
    borderRadius: radius.md,
    padding: 12,
  },
  infoText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 18 },
  placaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 10, columnGap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
  },
  placaVal: { fontSize: 16, fontWeight: '600', color: colors.text, letterSpacing: 1.5 },
  placaLabel: { fontSize: 11, color: colors.muted,  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 10, columnGap: 10,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
  },
  payText: { fontSize: 14, color: colors.text },
  footer: { padding: 16, paddingBottom: 32 },
  btnAutorizar: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 10, columnGap: 10,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
