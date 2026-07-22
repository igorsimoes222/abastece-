import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../../components/theme';

const POSTOS = [
  {
    id: 1, nome: 'Shell Centro', dist: '1,2 km', preco: 'R$6,29/L',
    cashback: '5%', produto: 'Gasolina C', lat: -23.18, lng: -45.88,
  },
  {
    id: 2, nome: 'Posto Ipiranga', dist: '2,4 km', preco: 'R$6,19/L',
    cashback: '3%', produto: 'Gasolina A', lat: -23.19, lng: -45.89,
  },
  {
    id: 3, nome: 'BR Distribuidora', dist: '3,1 km', preco: 'R$6,35/L',
    cashback: '4%', produto: 'Etanol', lat: -23.17, lng: -45.87,
  },
  {
    id: 4, nome: 'Auto Posto Leste', dist: '3,8 km', preco: 'R$6,24/L',
    cashback: '2%', produto: 'Gasolina C', lat: -23.20, lng: -45.86,
  },
];

export default function MapaScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [selecionado, setSelecionado] = useState(POSTOS[0]);

  const filtrados = POSTOS.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={s.safe}>
      {/* Barra de busca */}
      <View style={s.topBar}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            style={s.searchInput}
            value={busca}
            onChangeText={setBusca}
            placeholder="Cidade, bairro ou região..."
            placeholderTextColor={colors.muted}
          />
          {busca.length > 0 && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={s.filterBtn}>
          <Ionicons name="options" size={20} color={colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Área do mapa (placeholder visual) */}
      <View style={s.mapArea}>
        <View style={s.mapPlaceholder}>
          <Ionicons name="map" size={48} color={colors.border} />
          <Text style={s.mapText}>Mapa interativo</Text>
          <Text style={s.mapSub}>react-native-maps renderiza aqui</Text>
        </View>

        {/* Pins simulados */}
        <View style={s.pinsOverlay}>
          {filtrados.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={[s.pin, { top: 20 + i * 48, left: 30 + i * 40 }]}
              onPress={() => setSelecionado(p)}
            >
              <View style={[s.pinDot, selecionado?.id === p.id && s.pinDotActive]}>
                <Ionicons name="flame" size={10} color={colors.white} />
              </View>
              {selecionado?.id === p.id && (
                <View style={s.pinLabel}>
                  <Text style={s.pinLabelText}>{p.cashback} back</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
          {/* Pin de localização atual */}
          <View style={[s.pin, { top: 120, left: 140 }]}>
            <View style={s.myPin}>
              <Ionicons name="navigate" size={12} color={colors.white} />
            </View>
          </View>
        </View>
      </View>

      {/* Lista de postos */}
      <View style={s.listContainer}>
        <Text style={s.listTitle}>Postos credenciados próximos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.cardScroll}>
          {filtrados.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[s.postoCard, selecionado?.id === p.id && s.postoCardActive]}
              onPress={() => setSelecionado(p)}
            >
              <View style={s.postoIconWrap}>
                <Ionicons name="flame" size={18} color={colors.accent2} />
              </View>
              <Text style={s.postoNome}>{p.nome}</Text>
              <Text style={s.postoDist}>{p.dist} · {p.preco}</Text>
              <View style={s.cashbackBadge}>
                <Ionicons name="wallet" size={10} color={colors.green} />
                <Text style={s.cashbackText}>{p.cashback} cashback</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selecionado && (
          <TouchableOpacity
            style={s.btnAbastecer}
            onPress={() => navigation.navigate('Autorizacao', { posto: selecionado })}
          >
            <Ionicons name="flash" size={20} color={colors.white} />
            <Text style={s.btnAbastecerText}>Abastecer em {selecionado.nome}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    rowGap: 10, columnGap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    rowGap: 8, columnGap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  filterBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapArea: { flex: 1, backgroundColor: '#111927', position: 'relative' },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8, columnGap: 8,
  },
  mapText: { fontSize: 14, color: colors.muted },
  mapSub: { fontSize: 11, color: colors.border },
  pinsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pin: { position: 'absolute', alignItems: 'center' },
  pinDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDotActive: { backgroundColor: colors.green, width: 30, height: 30, borderRadius: 15 },
  pinLabel: {
    backgroundColor: 'rgba(30,37,53,0.9)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  pinLabelText: { fontSize: 9, color: colors.green, fontWeight: '600' },
  myPin: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.amber,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    paddingBottom: 24,
    rowGap: 12, columnGap: 12,
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    paddingHorizontal: 16,
    letterSpacing: 0.3,
  },
  cardScroll: { paddingLeft: 16 },
  postoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    marginRight: 10,
    width: 150,
    rowGap: 4, columnGap: 4,
  },
  postoCardActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(37,99,235,0.08)',
  },
  postoIconWrap: {
    width: 34,
    height: 34,
    backgroundColor: 'rgba(14,165,233,0.15)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  postoNome: { fontSize: 13, fontWeight: '600', color: colors.text },
  postoDist: { fontSize: 11, color: colors.muted },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    rowGap: 4, columnGap: 4,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  cashbackText: { fontSize: 10, color: colors.green, fontWeight: '500' },
  btnAbastecer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    rowGap: 8, columnGap: 8,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 14,
    marginHorizontal: 16,
  },
  btnAbastecerText: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
