import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { api } from '../services/api';

function CampoSenha({ label, value, onChangeText, placeholder }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <View style={styles.senhaRow}>
        <TextInput
          style={styles.campoInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visivel}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.olhoBtn} onPress={() => setVisivel(v => !v)}>
          <Text style={styles.olhoIcon}>{visivel ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Requisito({ ok, texto }) {
  return (
    <View style={styles.requisitoRow}>
      <View style={[styles.requisitoDot, ok && styles.requisitoDotOk]} />
      <Text style={[styles.requisitoText, ok && styles.requisitoTextOk]}>{texto}</Text>
    </View>
  );
}

export default function SegurancaScreen({ navigation }) {
  const [senhaAtual, setSenhaAtual]       = useState('');
  const [senhaNova, setSenhaNova]         = useState('');
  const [senhaConfirm, setSenhaConfirm]   = useState('');
  const [salvando, setSalvando]           = useState(false);
  const [erro, setErro]                   = useState('');
  const [sucesso, setSucesso]             = useState(false);

  const temMin8    = senhaNova.length >= 8;
  const temNumero  = /\d/.test(senhaNova);
  const temLetra   = /[a-zA-Z]/.test(senhaNova);
  const confirmaBate = senhaNova === senhaConfirm && senhaConfirm.length > 0;
  const podeSalvar = senhaAtual.trim() && temMin8 && temNumero && temLetra && confirmaBate;

  const salvar = async () => {
    if (!podeSalvar) return;
    setErro('');
    setSalvando(true);
    try {
      await api.post('/auth/trocar-senha', {
        senhaAtual: senhaAtual.trim(),
        senhaNova:  senhaNova.trim(),
      });
      setSucesso(true);
      setSenhaAtual('');
      setSenhaNova('');
      setSenhaConfirm('');
      setTimeout(() => { setSucesso(false); navigation.goBack(); }, 1500);
    } catch (e) {
      setErro(e.message ?? 'Erro ao trocar senha');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Ícone */}
        <View style={styles.iconWrap}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🔒</Text>
          </View>
          <Text style={styles.iconTitle}>Trocar senha</Text>
          <Text style={styles.iconDesc}>
            Escolha uma senha forte para manter sua conta protegida.
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.card}>
          <CampoSenha
            label="Senha atual"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha atual"
          />
          <View style={styles.divider} />
          <CampoSenha
            label="Nova senha"
            value={senhaNova}
            onChangeText={setSenhaNova}
            placeholder="Digite a nova senha"
          />
          <CampoSenha
            label="Confirmar nova senha"
            value={senhaConfirm}
            onChangeText={setSenhaConfirm}
            placeholder="Repita a nova senha"
          />
        </View>

        {/* Requisitos */}
        {senhaNova.length > 0 && (
          <View style={styles.requisitosCard}>
            <Text style={styles.requisitosTitle}>Requisitos da senha</Text>
            <Requisito ok={temMin8}   texto="Mínimo 8 caracteres" />
            <Requisito ok={temLetra}  texto="Pelo menos uma letra" />
            <Requisito ok={temNumero} texto="Pelo menos um número" />
            <Requisito ok={confirmaBate} texto="Confirmação idêntica" />
          </View>
        )}

        {/* Erro */}
        {erro ? (
          <View style={styles.erroBadge}>
            <Text style={styles.erroText}>{erro}</Text>
          </View>
        ) : null}

        {/* Sucesso */}
        {sucesso ? (
          <View style={styles.sucessoBadge}>
            <Text style={styles.sucessoText}>✓ Senha alterada com sucesso!</Text>
          </View>
        ) : null}

        {/* Botão */}
        <TouchableOpacity
          style={[styles.btnSalvar, (!podeSalvar || salvando) && styles.btnDisabled]}
          onPress={salvar}
          disabled={!podeSalvar || salvando}
        >
          {salvando
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.btnSalvarText}>Confirmar troca de senha</Text>
          }
        </TouchableOpacity>

        {/* Dica */}
        <View style={styles.dicaCard}>
          <Text style={styles.dicaIcon}>💡</Text>
          <Text style={styles.dicaText}>
            Nunca compartilhe sua senha. O Abastece+ jamais pedirá sua senha por ligação ou mensagem.
          </Text>
        </View>

      </ScrollView>
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

  scroll: { padding: spacing.xl, gap: 16 },

  iconWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(108,194,74,0.1)',
    borderWidth: 2, borderColor: 'rgba(108,194,74,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 36 },
  iconTitle: { fontSize: 20, fontWeight: '900', color: colors.text },
  iconDesc: { fontSize: 13, color: colors.textSec, textAlign: 'center', lineHeight: 18 },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 14,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },

  campo: { gap: 6 },
  campoLabel: {
    fontSize: 11, fontWeight: '700', color: colors.textSec,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  senhaRow: { flexDirection: 'row', alignItems: 'center' },
  campoInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 12,
    fontSize: 15, color: colors.text, fontWeight: '600',
  },
  olhoBtn: {
    position: 'absolute', right: 12,
    height: '100%', justifyContent: 'center',
  },
  olhoIcon: { fontSize: 16 },

  requisitosCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 8,
  },
  requisitosTitle: { fontSize: 12, fontWeight: '800', color: colors.textSec, marginBottom: 2 },
  requisitoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  requisitoDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.border,
  },
  requisitoDotOk: { backgroundColor: colors.verde },
  requisitoText: { fontSize: 13, color: colors.textMuted },
  requisitoTextOk: { color: colors.verde, fontWeight: '600' },

  erroBadge: {
    backgroundColor: 'rgba(229,57,53,0.1)',
    borderWidth: 1, borderColor: 'rgba(229,57,53,0.25)',
    borderRadius: radius.lg, padding: 12,
  },
  erroText: { color: colors.red, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  sucessoBadge: {
    backgroundColor: 'rgba(108,194,74,0.1)',
    borderWidth: 1, borderColor: 'rgba(108,194,74,0.3)',
    borderRadius: radius.lg, padding: 12,
  },
  sucessoText: { color: colors.verde, fontSize: 14, fontWeight: '700', textAlign: 'center' },

  btnSalvar: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 16, alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.5 },
  btnSalvarText: { color: colors.white, fontSize: 16, fontWeight: '800' },

  dicaCard: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: 'rgba(43,95,170,0.08)',
    borderWidth: 1, borderColor: 'rgba(43,95,170,0.15)',
    borderRadius: radius.lg, padding: 12,
  },
  dicaIcon: { fontSize: 18 },
  dicaText: { flex: 1, fontSize: 12, color: '#7B9FD4', lineHeight: 17 },
});
