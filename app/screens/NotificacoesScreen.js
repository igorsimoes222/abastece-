import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList,
} from 'react-native';
import { colors, radius, spacing } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

const NOTIFICACOES_MOCK = [
  {
    id: '1',
    tipo: 'abastecimento',
    icone: '⛽',
    titulo: 'Abastecimento concluído',
    mensagem: 'Seu abastecimento de R$ 50,00 foi concluído com sucesso no Posto Sete Estrelas.',
    tempo: 'Agora mesmo',
    lida: false,
  },
  {
    id: '2',
    tipo: 'cashback',
    icone: '💰',
    titulo: 'Cashback creditado!',
    mensagem: 'R$ 0,50 de cashback foi creditado na sua carteira.',
    tempo: 'Há 2 minutos',
    lida: false,
  },
  {
    id: '3',
    tipo: 'promocao',
    icone: '🎁',
    titulo: 'Promoção especial',
    mensagem: 'Abasteça hoje e ganhe 2x de cashback no Posto Rua Ceci, 215.',
    tempo: 'Há 1 hora',
    lida: true,
  },
  {
    id: '4',
    tipo: 'abastecimento',
    icone: '⛽',
    titulo: 'Abastecimento concluído',
    mensagem: 'Seu abastecimento de R$ 100,00 foi concluído com sucesso.',
    tempo: 'Ontem, 14:32',
    lida: true,
  },
  {
    id: '5',
    tipo: 'sistema',
    icone: '🔔',
    titulo: 'Bem-vindo ao Abastece+',
    mensagem: 'Sua conta foi criada com sucesso. Comece a abastecer e ganhe cashback!',
    tempo: '07/07/2026',
    lida: true,
  },
];

const COR_TIPO = {
  abastecimento: colors.verde,
  cashback:      '#FF9800',
  promocao:      '#2196F3',
  sistema:       '#9C27B0',
};

export default function NotificacoesScreen({ navigation }) {
  const [notifs, setNotifs] = useState(NOTIFICACOES_MOCK);

  const naoLidas = notifs.filter(n => !n.lida).length;

  const marcarTodasLidas = () => {
    setNotifs(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const marcarLida = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.lida && styles.cardNaoLida]}
      onPress={() => marcarLida(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrap, { backgroundColor: (COR_TIPO[item.tipo] ?? '#666') + '22' }]}>
        <Text style={styles.icon}>{item.icone}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitulo, !item.lida && styles.cardTituloDestaque]}>
            {item.titulo}
          </Text>
          {!item.lida && <View style={styles.dot} />}
        </View>
        <Text style={styles.cardMsg} numberOfLines={2}>{item.mensagem}</Text>
        <Text style={styles.cardTempo}>{item.tempo}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        {naoLidas > 0 && (
          <TouchableOpacity onPress={marcarTodasLidas}>
            <Text style={styles.marcarBtn}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contador */}
      {naoLidas > 0 && (
        <View style={styles.contadorWrap}>
          <Text style={styles.contadorText}>{naoLidas} não lida{naoLidas > 1 ? 's' : ''}</Text>
        </View>
      )}

      {/* Lista */}
      <FlatList
        data={notifs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.vazio}>
            <Text style={styles.vaziIcon}>🔔</Text>
            <Text style={styles.vaziText}>Nenhuma notificação</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginRight: 12 },
  backText: { color: colors.verde, fontSize: 22 },
  headerTitle: { flex: 1, color: colors.text, fontSize: 18, fontWeight: '800' },
  marcarBtn: { color: colors.verde, fontSize: 12, fontWeight: '700' },

  contadorWrap: {
    marginHorizontal: spacing.lg,
    marginTop: 12,
    backgroundColor: 'rgba(108,194,74,0.1)',
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  contadorText: { color: colors.verde, fontSize: 12, fontWeight: '700' },

  lista: { padding: spacing.lg, gap: 10 },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
    alignItems: 'flex-start',
  },
  cardNaoLida: {
    borderColor: 'rgba(108,194,74,0.4)',
    backgroundColor: 'rgba(108,194,74,0.05)',
  },

  iconWrap: {
    width: 44, height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 20 },

  cardBody: { flex: 1 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cardTitulo: { color: colors.textMuted, fontSize: 13, fontWeight: '600', flex: 1 },
  cardTituloDestaque: { color: colors.text, fontWeight: '800' },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: colors.verde,
  },
  cardMsg: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 6 },
  cardTempo: { color: '#555', fontSize: 11 },

  vazio: { alignItems: 'center', marginTop: 80 },
  vaziIcon: { fontSize: 48, marginBottom: 12 },
  vaziText: { color: colors.textMuted, fontSize: 15 },
});
