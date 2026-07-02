import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.muted} />
        </TouchableOpacity>

        <Text style={s.title}>Bem-vindo de volta</Text>
        <Text style={s.sub}>Entre com sua conta PostoPrático</Text>

        <View style={s.form}>
          <View style={s.inputWrap}>
            <Text style={s.label}>E-mail</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={colors.border}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.inputWrap}>
            <Text style={s.label}>Senha</Text>
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, { flex: 1, borderWidth: 0 }]}
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                placeholderTextColor={colors.border}
                secureTextEntry={!showSenha}
              />
              <TouchableOpacity onPress={() => setShowSenha(!showSenha)} style={s.eyeBtn}>
                <Ionicons
                  name={showSenha ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.forgot}>
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => navigation.navigate('Mapa')}
        >
          <Text style={s.btnText}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={s.linkText}>
            Não tem conta? <Text style={{ color: colors.accent }}>Criar agora</Text>
          </Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
    rowGap: 16, columnGap: 16,
  },
  back: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 26, fontWeight: '600', color: colors.text, marginTop: 12 },
  sub: { fontSize: 14, color: colors.muted },
  form: { rowGap: 14, columnGap: 14, marginTop: 8 },
  inputWrap: { gap: 6 },
  label: { fontSize: 13, color: colors.muted, fontWeight: '500' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  eyeBtn: { padding: 8 },
  forgot: { alignSelf: 'flex-end' },
  forgotText: { color: colors.accent2, fontSize: 13 },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  linkText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
});
