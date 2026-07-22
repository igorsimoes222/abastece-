import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Image,
  ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import ErroConexao from '../../components/ErroConexao';

const { width } = Dimensions.get('window');

function Campo({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry, autoCapitalize, returnKeyType, onSubmitEditing, editable, direita }) {
  const [focado, setFocado] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocado(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocado(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', 'rgba(108,194,74,0.6)'],
  });

  return (
    <Animated.View style={[styles.campo, { borderColor }]}>
      <Text style={styles.campoIcon}>{icon}</Text>
      <TextInput
        style={styles.campoInput}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={editable !== false}
      />
      {direita}
    </Animated.View>
  );
}

export default function LoginScreen({ navigation, route }) {
  const { login, cadastro } = useAuth();

  const [tab, setTab]               = useState(route?.params?.tab ?? 'login');
  const [showPwd, setShowPwd]       = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro]             = useState('');

  const [email, setEmail]       = useState('');
  const [senha, setSenha]       = useState('');
  const [nome, setNome]         = useState('');
  const [emailCad, setEmailCad] = useState('');
  const [cpf, setCpf]           = useState('');
  const [telefone, setTelefone] = useState('');
  const [senhaCad, setSenhaCad] = useState('');

  const slideAnim   = useRef(new Animated.Value(0)).current;
  const fadeAnim    = useRef(new Animated.Value(0)).current;
  const glowAnim    = useRef(new Animated.Value(0.7)).current;
  const tabSlide    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const trocarTab = (t) => {
    setTab(t);
    setErro('');
    Animated.spring(tabSlide, {
      toValue: t === 'login' ? 0 : 1,
      tension: 80, friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const fazerLogin = async () => {
    if (!email.trim() || !senha.trim()) { setErro('Preencha e-mail e senha.'); return; }
    setErro('');
    setCarregando(true);
    try {
      await login(email.trim(), senha);
      navigation.replace('Mapa');
    } catch (e) {
      setErro(e?.message || 'E-mail ou senha inválidos.');
    } finally {
      setCarregando(false);
    }
  };

  const fazerCadastro = async () => {
    if (!nome.trim() || !emailCad.trim() || !senhaCad.trim()) { setErro('Preencha nome, e-mail e senha.'); return; }
    if (senhaCad.length < 6) { setErro('Senha deve ter no mínimo 6 caracteres.'); return; }
    setErro('');
    setCarregando(true);
    try {
      await cadastro({ nome: nome.trim(), email: emailCad.trim(), senha: senhaCad, cpf, telefone });
      navigation.replace('Mapa');
    } catch (e) {
      setErro(e?.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const tabIndicatorX = tabSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [4, (width - spacing.xl * 2) / 2],
  });

  const cardY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });

  return (
    <ScreenWrapper edges={['top', 'bottom']}>


      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Voltar ao onboarding */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          {/* ── TOPO: logo + tagline ── */}
          <Animated.View style={[styles.topo, { opacity: fadeAnim }]}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/logodeitada.png')}
                style={[styles.logo, { mixBlendMode: 'screen' }]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>
              Abasteça com inteligência.{'\n'}
              <Text style={styles.taglineDestaque}>Economize a cada litro.</Text>
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>⚡ Rápido</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>🔒 Seguro</Text>
              </View>
              <View style={[styles.badge, styles.badgeGreen]}>
                <Text style={[styles.badgeText, { color: colors.verde }]}>💰 Cashback</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── CARD ── */}
          <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: cardY }] }]}>

            {/* Tabs com slide */}
            <View style={styles.tabs}>
              <Animated.View style={[styles.tabIndicator, { transform: [{ translateX: tabIndicatorX }] }]} />
              <TouchableOpacity style={styles.tab} onPress={() => trocarTab('login')}>
                <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Entrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tab} onPress={() => trocarTab('cadastro')}>
                <Text style={[styles.tabText, tab === 'cadastro' && styles.tabTextActive]}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Erro */}
            {erro ? (
              <ErroConexao
                mensagem={erro}
                tipo={erro.includes('internet') || erro.includes('conexão') ? 'offline' : 'erro'}
              />
            ) : null}

            {/* ── LOGIN ── */}
            {tab === 'login' && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Bem-vindo de volta!</Text>

                <Campo
                  icon="✉️"
                  placeholder="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!carregando}
                />
                <Campo
                  icon="🔑"
                  placeholder="Senha"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={fazerLogin}
                  editable={!carregando}
                  direita={
                    <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                      <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity style={styles.forgotBtn}>
                  <Text style={styles.forgotText}>Esqueci minha senha</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btnPrimary, carregando && styles.btnDisabled]}
                  onPress={fazerLogin}
                  disabled={carregando}
                  activeOpacity={0.85}
                >
                  {carregando
                    ? <ActivityIndicator color={colors.white} />
                    : <>
                        <Text style={styles.btnPrimaryText}>Entrar</Text>
                        <Text style={styles.btnArrow}>→</Text>
                      </>
                  }
                </TouchableOpacity>
              </View>
            )}

            {/* ── CADASTRO ── */}
            {tab === 'cadastro' && (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Crie sua conta</Text>

                <Campo icon="👤" placeholder="Nome completo" value={nome} onChangeText={setNome} editable={!carregando} />
                <Campo icon="✉️" placeholder="E-mail" value={emailCad} onChangeText={setEmailCad} keyboardType="email-address" autoCapitalize="none" editable={!carregando} />

                <View style={styles.duplaRow}>
                  <View style={{ flex: 1 }}>
                    <Campo icon="🪪" placeholder="CPF" value={cpf} onChangeText={setCpf} keyboardType="numeric" editable={!carregando} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Campo icon="📱" placeholder="Celular" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" editable={!carregando} />
                  </View>
                </View>

                <Campo
                  icon="🔑"
                  placeholder="Senha (mín. 6 caracteres)"
                  value={senhaCad}
                  onChangeText={setSenhaCad}
                  secureTextEntry={!showPwd}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={fazerCadastro}
                  editable={!carregando}
                  direita={
                    <TouchableOpacity onPress={() => setShowPwd(v => !v)} style={styles.eyeBtn}>
                      <Text style={styles.eyeIcon}>{showPwd ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                  }
                />

                <TouchableOpacity
                  style={[styles.btnPrimary, carregando && styles.btnDisabled]}
                  onPress={fazerCadastro}
                  disabled={carregando}
                  activeOpacity={0.85}
                >
                  {carregando
                    ? <ActivityIndicator color={colors.white} />
                    : <>
                        <Text style={styles.btnPrimaryText}>Criar conta grátis</Text>
                        <Text style={styles.btnArrow}>→</Text>
                      </>
                  }
                </TouchableOpacity>

                <Text style={styles.terms}>
                  Ao continuar, você concorda com os{' '}
                  <Text style={{ color: colors.verde }}>Termos de Uso</Text> e a{' '}
                  <Text style={{ color: colors.verde }}>Política de Privacidade</Text>.
                </Text>
              </View>
            )}
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const CARD_PADDING = spacing.xl;

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: 'flex-start',
    marginLeft: 4, marginTop: 4,
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { fontSize: 20, color: '#FFFFFF' },

  // Fundo decorativo
  glowTop: {
    position: 'absolute', top: -80, left: -80,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(108,194,74,0.07)',
  },
  glowBottom: {
    position: 'absolute', bottom: -60, right: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: 'rgba(108,194,74,0.04)',
  },

  scroll: { padding: CARD_PADDING, paddingTop: 32, paddingBottom: 40 },

  // Topo
  topo: { alignItems: 'center', marginBottom: -10, gap: 0, paddingTop: 0, marginTop: -20 },
  logoWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  logoGlow: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(108,194,74,0.10)',
  },
  logo: { width: 420, height: 220 },
  tagline: {
    fontSize: 15, color: colors.textSec,
    textAlign: 'center', lineHeight: 22, marginTop: -50,
  },
  taglineDestaque: { color: colors.verde, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  badgeGreen: {
    backgroundColor: 'rgba(108,194,74,0.08)',
    borderColor: 'rgba(108,194,74,0.2)',
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.textSec },

  // Card
  card: {
    backgroundColor: 'rgba(19,31,19,0.95)',
    borderWidth: 1, borderColor: 'rgba(108,194,74,0.12)',
    borderRadius: radius.xxl,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.4, shadowRadius: 24, elevation: 16,
  },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl, padding: 4,
    marginBottom: 20, position: 'relative', height: 46,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    width: '50%',
    height: 38,
    backgroundColor: colors.verde,
    borderRadius: radius.lg,
    shadowColor: colors.verde,
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  tabText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: colors.white },

  // Erro
  erroBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1, borderColor: 'rgba(229,57,53,0.25)',
    borderRadius: radius.lg, padding: 12, marginBottom: 14,
  },
  erroIcon: { fontSize: 16 },
  erroText: { flex: 1, color: '#EF9A9A', fontSize: 13, fontWeight: '600' },

  // Form
  form: { gap: 10 },
  formTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 4 },

  // Campo
  campo: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderRadius: radius.xl, paddingHorizontal: 14, paddingVertical: 2,
    minHeight: 52,
  },
  campoIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  campoInput: { flex: 1, fontSize: 15, color: colors.text, paddingVertical: 10 },
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 16 },

  // Dupla (CPF + celular)
  duplaRow: { flexDirection: 'row', gap: 8 },

  forgotBtn: { alignSelf: 'flex-end', marginTop: 2 },
  forgotText: { color: colors.verde, fontSize: 13, fontWeight: '600' },

  // Botão
  btnPrimary: {
    backgroundColor: colors.verde,
    borderRadius: radius.xl, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 6,
    shadowColor: colors.verde,
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },
  btnDisabled: { opacity: 0.55, shadowOpacity: 0 },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '900' },
  btnArrow: { fontSize: 18, color: colors.white, fontWeight: '900' },

  terms: {
    fontSize: 11, color: colors.textMuted,
    textAlign: 'center', lineHeight: 16, marginTop: 6,
  },
});
