import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

const STEPS = ['Dados pessoais', 'Pagamento', 'Veículo'];
const PAY_OPTS = ['Crédito', 'Débito', 'PIX', 'Carteira Digital'];

export default function CadastroScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [senha, setSenha] = useState('');
  const [payOpt, setPayOpt] = useState('Crédito');
  const [cartao, setCartao] = useState('');
  const [placa, setPlaca] = useState('');

  const next = () => {
    if (step < 2) setStep(step + 1);
    else navigation.navigate('Mapa');
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => step > 0 ? setStep(step - 1) : navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Criar conta</Text>
        <Text style={s.stepLabel}>{step + 1} de {STEPS.length}</Text>
      </View>

      {/* Barra de progresso */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: ((step + 1) / STEPS.length * 100) + '%' }]} />
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <Text style={s.stepTitle}>{STEPS[step]}</Text>

        {step === 0 && (
          <View style={s.form}>
            <Field label="Nome completo" value={nome} onChange={setNome} placeholder="João Silva" />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field label="CPF / CNPJ" value={cpf} onChange={setCpf} placeholder="000.000.000-00" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Telefone" value={tel} onChange={setTel} placeholder="(11) 9 0000-0000" keyboardType="phone-pad" />
              </View>
            </View>
            <Field label="E-mail" value={email} onChange={setEmail} placeholder="seu@email.com" keyboardType="email-address" />
            <Field label="Senha" value={senha} onChange={setSenha} placeholder="Mínimo 8 caracteres" secure />
          </View>
        )}

        {step === 1 && (
          <View style={s.form}>
            <Text style={s.label}>Forma de pagamento preferida</Text>
            <View style={s.chips}>
              {PAY_OPTS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[s.chip, payOpt === opt && s.chipActive]}
                  onPress={() => setPayOpt(opt)}
                >
                  <Text style={[s.chipText, payOpt === opt && s.chipTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Field
              label="Número do cartão"
              value={cartao}
              onChange={setCartao}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
            />
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Field label="Validade" value="" onChange={() => {}} placeholder="MM/AA" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="CVV" value="" onChange={() => {}} placeholder="•••" secure />
              </View>
            </View>
            <View style={s.infoBox}>
              <Ionicons name="shield-checkmark" size={16} color={colors.green} />
              <Text style={s.infoText}>Dados criptografados · Processado pela Cielo</Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={s.form}>
            <Text style={s.sublabel}>Opcional — adicione seu veículo para identificação por placa</Text>
            <Field
              label="Placa do veículo"
              value={placa}
              onChange={setPlaca}
              placeholder="ABC-1D23"
              autoCapitalize="characters"
            />
            <Field label="Modelo" value="" onChange={() => {}} placeholder="Ex: Fiat Strada" />
            <Field label="Ano" value="" onChange={() => {}} placeholder="Ex: 2022" keyboardType="numeric" />
            <TouchableOpacity style={s.skipBtn}>
              <Text style={s.skipText}>Pular por agora</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.btnPrimary} onPress={next}>
          <Text style={s.btnText}>{step < 2 ? 'Continuar' : 'Criar minha conta'}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, keyboardType, secure, autoCapitalize }) {
  return (
    <View style={{ rowGap: 6, columnGap: 6, marginBottom: 4 }}>
      <Text style={sf.label}>{label}</Text>
      <TextInput
        style={sf.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.border}
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secure === true}
        autoCapitalize={autoCapitalize || 'none'}
      />
    </View>
  );
}

const sf = StyleSheet.create({
  label: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.text,
  },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    rowGap: 12, columnGap: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  stepLabel: { fontSize: 13, color: colors.muted },
  progressBg: { height: 3, backgroundColor: colors.border, marginHorizontal: 20 },
  progressFill: { height: 3, backgroundColor: colors.accent, borderRadius: 2 },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 8 },
  stepTitle: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 8 },
  form: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  sublabel: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(37,99,235,0.12)',
  },
  chipText: { fontSize: 13, color: colors.muted },
  chipTextActive: { color: colors.accent },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 8, columnGap: 8,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: radius.md,
    padding: 12,
  },
  infoText: { fontSize: 12, color: colors.muted },
  skipBtn: { alignSelf: 'center', marginTop: 4 },
  skipText: { color: colors.muted, fontSize: 13 },
  footer: { padding: 20, paddingBottom: 32 },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8, columnGap: 8,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
});
