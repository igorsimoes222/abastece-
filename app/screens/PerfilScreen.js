import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import { avatarService } from '../services/avatarService';

const veiculos = [
  { id: '1', icone: '🚗', nome: 'Honda Civic 2022', tipo: 'Gasolina • Cinza', placa: 'ABC-1D23' },
  { id: '2', icone: '🏍️', nome: 'Yamaha MT-07', tipo: 'Gasolina • Preta', placa: 'XYZ-5E67' },
];

const menuSecoes = [
  {
    titulo: 'Conta',
    itens: [
      { icon: '👤', bg: 'rgba(108,194,74,0.1)', titulo: 'Dados pessoais', sub: 'Nome, CPF, telefone', screen: 'DadosPessoais' },
      { icon: '🔒', bg: 'rgba(255,152,0,0.1)', titulo: 'Segurança', sub: 'Senha, PIN, biometria', screen: 'Seguranca' },
      { icon: '🔔', bg: 'rgba(33,150,243,0.1)', titulo: 'Notificações', sub: 'Promoções, alertas, cashback', screen: null, toggle: true },
    ],
  },
  {
    titulo: 'Plataforma',
    itens: [
      { icon: '🎁', bg: 'rgba(108,194,74,0.1)', titulo: 'Indicar amigos', sub: 'Ganhe R$ 5 por indicação', badge: 'NOVO', screen: null },
      { icon: '🚛', bg: 'rgba(255,152,0,0.1)', titulo: 'Gestão de frota', sub: 'Módulo empresarial (PJ)', screen: 'Frota' },
      { icon: '❓', bg: 'rgba(33,150,243,0.1)', titulo: 'Ajuda e suporte', sub: 'FAQ, chat, contato', screen: null },
      { icon: '📄', bg: 'rgba(108,194,74,0.1)', titulo: 'Termos e privacidade', sub: 'Políticas de uso', screen: null },
    ],
  },
];

export default function PerfilScreen({ navigation }) {
  const { usuario, logout } = useAuth();
  const [notifAtiva, setNotifAtiva] = useState(true);
  const [avatarUri, setAvatarUri] = useState(null);

  const nomeCompleto  = usuario?.nome  ?? 'Usuário';
  const emailUsuario  = usuario?.email ?? '';
  const iniciais      = nomeCompleto.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const cashback      = parseFloat(usuario?.cashback_saldo || 0).toFixed(2).replace('.', ',');

  useEffect(() => {
    avatarService.carregar().then(uri => uri && setAvatarUri(uri));
  }, []);

  const trocarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para trocar a foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await avatarService.salvar(uri);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => { await logout(); navigation.replace('Login'); } },
      ]
    );
  };

  return (
    <ScreenWrapper edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header perfil */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarWrap} onPress={trocarFoto} activeOpacity={0.85}>
            <View style={styles.avatar}>
              {avatarUri
                ? <Image source={{ uri: avatarUri }} style={styles.avatarImg} />
                : <Text style={styles.avatarText}>{iniciais}</Text>
              }
            </View>
            <View style={styles.avatarEdit}>
              <Text style={{ fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{nomeCompleto}</Text>
          <Text style={styles.profileEmail}>{emailUsuario}</Text>
          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>⭐ Cliente Gold</Text>
            </View>
            <View style={[styles.badge, styles.badgeOrange]}>
              <Text style={[styles.badgeText, { color: colors.laranja }]}>🔥 8 abast./mês</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { value: usuario?.total_abastecimentos ?? '0', label: 'Abast. total', color: colors.text },
            { value: `R$${cashback}`, label: 'Cashback', color: colors.laranja },
            { value: `R$${parseFloat(usuario?.total_gasto || 0).toFixed(0)}`, label: 'Total gasto', color: colors.verde },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Veículos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meus veículos</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>+ Adicionar</Text>
            </TouchableOpacity>
          </View>

          {veiculos.map(v => (
            <View key={v.id} style={styles.veiculoCard}>
              <View style={styles.veiculoIcon}>
                <Text style={{ fontSize: 26 }}>{v.icone}</Text>
              </View>
              <View style={styles.veiculoInfo}>
                <Text style={styles.veiculoNome}>{v.nome}</Text>
                <Text style={styles.veiculoTipo}>{v.tipo}</Text>
              </View>
              <View style={styles.placaBadge}>
                <Text style={styles.placaText}>{v.placa}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Seções do menu */}
        {menuSecoes.map(secao => (
          <View key={secao.titulo} style={styles.section}>
            <Text style={styles.sectionLabel}>{secao.titulo}</Text>
            <View style={styles.menuCard}>
              {secao.itens.map((item, idx) => (
                <TouchableOpacity
                  key={item.titulo}
                  style={[styles.menuItem, idx < secao.itens.length - 1 && styles.menuItemBorder]}
                  onPress={() => item.screen && navigation.navigate(item.screen)}
                >
                  <View style={[styles.menuIcon, { backgroundColor: item.bg }]}>
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <View style={styles.menuText}>
                    <Text style={styles.menuTitulo}>{item.titulo}</Text>
                    <Text style={styles.menuSub}>{item.sub}</Text>
                  </View>
                  {item.toggle ? (
                    <Switch
                      value={notifAtiva}
                      onValueChange={setNotifAtiva}
                      trackColor={{ false: colors.border, true: colors.verde }}
                      thumbColor={colors.white}
                    />
                  ) : item.badge ? (
                    <View style={styles.novoBadge}>
                      <Text style={styles.novoBadgeText}>{item.badge}</Text>
                    </View>
                  ) : (
                    <Text style={styles.menuArrow}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Abastece+ v1.0.0 — 2026</Text>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: '🗺️', label: 'Mapa', screen: 'Mapa' },
          { icon: '⛽', label: 'Abastecer', screen: 'Autorizacao' },
          { icon: '👛', label: 'Carteira', screen: 'Carteira' },
          { icon: '🕐', label: 'Histórico', screen: 'Historico' },
          { icon: '👤', label: 'Perfil', screen: 'Perfil', active: true },
        ].map(item => (
          <TouchableOpacity
            key={item.label}
            style={styles.navItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.navIcon}>{item.icon}</Text>
            <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 20 },

  profileHeader: {
    backgroundColor: colors.verdeBg,
    borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    borderBottomWidth: 1, borderBottomColor: 'rgba(108,194,74,0.15)',
    paddingTop: 48, paddingBottom: 28, paddingHorizontal: 24,
    alignItems: 'center', gap: 8,
  },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(108,194,74,0.3)',
    shadowColor: colors.verde, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: colors.white },
  avatarImg: { width: '100%', height: '100%', borderRadius: 40 },
  avatarEdit: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.verdeBg,
  },
  profileName: { fontSize: 22, fontWeight: '900', color: colors.text },
  profileEmail: { fontSize: 13, color: colors.textSec },
  badgesRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge: {
    backgroundColor: 'rgba(108,194,74,0.1)', borderWidth: 1, borderColor: 'rgba(108,194,74,0.2)',
    borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5,
  },
  badgeOrange: { backgroundColor: 'rgba(255,152,0,0.1)', borderColor: 'rgba(255,152,0,0.2)' },
  badgeText: { fontSize: 12, fontWeight: '700', color: colors.verde },

  statsRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: spacing.xl, marginTop: spacing.lg,
  },
  statCard: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 3,
  },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: colors.textSec, fontWeight: '600' },

  section: { marginHorizontal: spacing.xl, marginTop: spacing.lg, gap: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  sectionAction: { fontSize: 13, color: colors.verde, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSec, textTransform: 'uppercase', letterSpacing: 1 },

  veiculoCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  veiculoIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(108,194,74,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  veiculoInfo: { flex: 1 },
  veiculoNome: { fontSize: 14, fontWeight: '800', color: colors.text },
  veiculoTipo: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  placaBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  placaText: { fontSize: 12, fontWeight: '800', color: colors.text, letterSpacing: 1 },

  menuCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, paddingHorizontal: 18,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  menuIcon: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuTitulo: { fontSize: 14, fontWeight: '700', color: colors.text },
  menuSub: { fontSize: 12, color: colors.textSec, marginTop: 1 },
  menuArrow: { fontSize: 20, color: colors.textSec },
  novoBadge: {
    backgroundColor: colors.red, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  novoBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },

  logoutBtn: {
    marginHorizontal: spacing.xl, marginTop: spacing.lg,
    backgroundColor: 'rgba(229,57,53,0.08)',
    borderWidth: 1, borderColor: 'rgba(229,57,53,0.2)',
    borderRadius: radius.lg, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  logoutText: { color: colors.red, fontSize: 14, fontWeight: '700' },

  version: {
    textAlign: 'center', fontSize: 11, color: colors.textMuted,
    marginTop: spacing.md, marginBottom: 8,
  },

  bottomNav: {
    flexDirection: 'row', backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 10, paddingBottom: 28,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 4 },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: colors.textSec, fontWeight: '500' },
  navLabelActive: { color: colors.verde, fontWeight: '700' },
});
