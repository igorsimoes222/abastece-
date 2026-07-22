import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

export default function SplashScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>

        <View style={s.logoWrap}>
          <View style={s.logoMark}>
            <Ionicons name="flame" size={36} color={colors.white} />
          </View>
          <Text style={s.appName}>PostoPrático</Text>
          <Text style={s.appSub}>ABASTECIMENTO DIGITAL</Text>
        </View>

        <View style={s.btnGroup}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={s.btnPrimaryText}>Entrar</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>ou</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.btnGoogle}>
            <Ionicons name="logo-google" size={18} color={colors.text} />
            <Text style={s.btnGoogleText}>Continuar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={s.linkText}>Criar conta gratuita</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 28,
  },
  logoWrap: { alignItems: 'center', marginTop: 40 },
  logoMark: {
    width: 72,
    height: 72,
    backgroundColor: colors.accent,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 8,
  },
  appSub: {
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 2,
    marginTop: 4,
  },
  btnGroup: { width: '100%' },
  btnPrimary: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 13, marginHorizontal: 12 },
  btnGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginBottom: 12,
  },
  btnGoogleText: { color: colors.text, fontSize: 15, fontWeight: '500', marginLeft: 10 },
  linkText: {
    color: colors.accent2,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
});
