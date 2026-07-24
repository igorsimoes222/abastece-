import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoMark from '../../components/LogoMark';
import { colors, radius } from '../../components/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + nome */}
          <View style={s.logoRow}>
            <LogoMark size={32} />
            <View style={s.logoName}>
              <Text style={s.logoText}>Abastece</Text>
              <Text style={[s.logoText, { color: colors.verde }]}>+</Text>
            </View>
          </View>

          {/* Stats de impacto */}
          <View style={s.statsRow}>
            <View style={[s.statCard, s.statVerde]}>
              <Text style={[s.statNum, { color: colors.verde }]}>12k+</Text>
              <Text style={[s.statLabel, { color: 'rgba(74,222,128,0.5)' }]}>POSTOS</Text>
            </View>
            <View style={[s.statCard, s.statLaranja]}>
              <Text style={[s.statNum, { color: colors.laranja }]}>5%</Text>
              <Text style={[s.statLabel, { color: 'rgba(251,146,60,0.5)' }]}>CASHBACK</Text>
            </View>
            <View style={[s.statCard, s.statNeutro]}>
              <Text style={[s.statNum, { color: colors.text }]}>500k</Text>
              <Text style={[s.statLabel, { color: colors.textMuted }]}>USUÁRIOS</Text>
            </View>
          </View>

          {/* Título */}
          <Text style={s.title}>Entrar na conta</Text>

          {/* Campos */}
          <View style={s.form}>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="E-mail ou CPF"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={s.inputRow}>
              <TextInput
                style={[s.input, { flex: 1, borderWidth: 0 }]}
                value={senha}
                onChangeText={setSenha}
                placeholder="Senha"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={s.eyeBtn}>
                <Ionicons
                  name={showSenha ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.textSec}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.forgot}>
              <Text style={s.forgotText}>Esqueci a senha</Text>
            </TouchableOpacity>
          </View>

          {/* Botão entrar */}
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Mapa')}
          >
            <Text style={s.btnPrimaryText}>Entrar</Text>
          </TouchableOpacity>

          {/* Social login */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-google" size={17} color={colors.textSec} />
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Ionicons name="logo-apple" size={17} color={colors.textSec} />
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Criar conta */}
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={s.createText}>
              Novo? <Text style={{ color: colors.verde, fontWeight: '700' }}>Criar conta grátis</Text>
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 0,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoName: { flexDirection: 'row', alignItems: 'baseline' },
  logoText: { fontSize: 17, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
  },
  statVerde: {
    backgroundColor: '#0D2818',
    borderColor: 'rgba(74,222,128,0.12)',
  },
  statLaranja: {
    backgroundColor: 'rgba(251,146,60,0.08)',
    borderColor: 'rgba(251,146,60,0.12)',
  },
  statNeutro: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  statNum: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 20,
  },

  form: { gap: 10, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
  },
  eyeBtn: { padding: 10 },
  forgot: { alignSelf: 'flex-end', marginTop: 2, marginBottom: 10 },
  forgotText: { fontSize: 12, color: colors.verde },

  btnPrimary: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: { color: '#060F1A', fontSize: 15, fontWeight: '800' },

  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 13,
  },
  socialText: { fontSize: 13, fontWeight: '600', color: colors.text },

  createText: {
    fontSize: 13,
    color: colors.textSec,
    textAlign: 'center',
  },
});
