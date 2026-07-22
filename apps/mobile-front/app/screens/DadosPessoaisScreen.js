import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_KEY } from '../config/env';

function Campo({ label, value, onChangeText, placeholder, keyboardType, editable = true }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.campoLabel}>{label}</Text>
      <TextInput
        style={[styles.campoInput, !editable && styles.campoInputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize="words"
      />
    </View>
  );
}

export default function DadosPessoaisScreen({ navigation }) {
  const { usuario, atualizarUsuario } = useAuth();

  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const salvar = async () => {
    if (!nome.trim()) { setErro('Nome é obrigatório'); return; }
    setErro('');
    setSalvando(true);
    try {
      const res = await api.patch('/auth/perfil', { nome: nome.trim(), telefone: telefone.trim() });
      const usuarioAtualizado = { ...usuario, ...res.usuario };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(usuarioAtualizado));
      atualizarUsuario(res.usuario); // atualiza contexto em tempo real
      setSucesso(true);
      setTimeout(() => { setSucesso(false); navigation.goBack(); }, 1200);
    } catch (e) {
      setErro(e.message ?? 'Erro ao salvar');
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
        <Text style={styles.headerTitle}>Dados pessoais</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Campo label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
          <Campo label="E-mail" value={usuario?.email ?? ''} editable={false} />
          <Campo
            label="CPF"
            value={usuario?.cpf ? usuario.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : ''}
            editable={false}
          />
          <Campo
            label="Telefone"
            value={telefone}
            onChangeText={setTelefone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
          />
        </View>

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        {sucesso ? (
          <View style={styles.sucessoBadge}>
            <Text style={styles.sucessoText}>✓ Dados salvos com sucesso!</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.btnSalvar, salvando && styles.btnDisabled]}
          onPress={salvar}
          disabled={salvando}
        >
          {salvando
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.btnSalvarText}>Salvar alterações</Text>
          }
        </TouchableOpacity>
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

  avatarWrap: { alignItems: 'center', marginBottom: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(108,194,74,0.3)',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: colors.white },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, gap: 16,
  },
  campo: { gap: 6 },
  campoLabel: { fontSize: 11, fontWeight: '700', color: colors.textSec, textTransform: 'uppercase', letterSpacing: 0.5 },
  campoInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: 12,
    fontSize: 15, color: colors.text, fontWeight: '600',
  },
  campoInputDisabled: { opacity: 0.5 },

  erro: { color: colors.red, fontSize: 13, fontWeight: '600', textAlign: 'center' },

  sucessoBadge: {
    backgroundColor: 'rgba(108,194,74,0.1)',
    borderWidth: 1, borderColor: 'rgba(108,194,74,0.3)',
    borderRadius: radius.lg, padding: 12, alignItems: 'center',
  },
  sucessoText: { color: colors.verde, fontSize: 14, fontWeight: '700' },

  btnSalvar: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 16,
    alignItems: 'center',
  },
  btnDisabled: { backgroundColor: colors.border, opacity: 0.5 },
  btnSalvarText: { color: colors.white, fontSize: 16, fontWeight: '800' },
});
