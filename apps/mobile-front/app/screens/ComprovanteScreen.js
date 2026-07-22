import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
  Dimensions, Easing,
} from 'react-native';
import { colors, radius, spacing, shadows } from '../../components/theme';
import ScreenWrapper from '../../components/ScreenWrapper';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Confetti caindo do topo ──
function ConfettiPiece({ delay, x, color, size, rotate }) {
  const y  = useRef(new Animated.Value(-20)).current;
  const op = useRef(new Animated.Value(0)).current;
  const r  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(y,  { toValue: SCREEN_H * 1.1, duration: 2800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 800, delay: 1800, useNativeDriver: true }),
        ]),
        Animated.timing(r, { toValue: rotate, duration: 1800, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top: 0, left: x,
        width: size, height: size * 0.5,
        borderRadius: 2,
        backgroundColor: color,
        opacity: op,
        transform: [{ translateY: y }, { rotate: r.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) }],
        zIndex: 99,
      }}
    />
  );
}

const CONFETTI = Array.from({ length: 60 }, (_, i) => ({
  x: Math.random() * SCREEN_W,
  delay: Math.random() * 1000,
  color: [colors.verde, colors.laranja, '#fff', '#7B9FD4', '#FFD700', '#FF6B6B', '#B2FF59', '#FF80AB'][i % 8],
  size: 6 + Math.random() * 10,
  rotate: Math.random() * 720,
}));

// ── Partícula subindo do círculo ──
function Particle({ delay, x, color }) {
  const y  = useRef(new Animated.Value(0)).current;
  const op = useRef(new Animated.Value(0)).current;
  const sc = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(y,  { toValue: -130, duration: 900, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(op, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
        Animated.spring(sc, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: x, bottom: 0,
      width: 8, height: 8, borderRadius: 4,
      backgroundColor: color,
      transform: [{ translateY: y }, { scale: sc }],
      opacity: op,
    }} />
  );
}

const PARTICLES = [
  { x: 10,  color: colors.verde,   delay: 0   },
  { x: 30,  color: colors.laranja, delay: 80  },
  { x: 55,  color: colors.verde,   delay: 150 },
  { x: 75,  color: '#fff',         delay: 50  },
  { x: 90,  color: colors.laranja, delay: 200 },
  { x: 108, color: colors.verde,   delay: 100 },
  { x: 125, color: '#7B9FD4',      delay: 30  },
  { x: 140, color: colors.verde,   delay: 170 },
];

// ── Valor contando do 0 até o total ──
function CountUp({ target, duration = 1400, style }) {
  const [display, setDisplay] = useState('0,00');
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const num = parseFloat(target.replace(',', '.'));
    anim.addListener(({ value }) => {
      setDisplay(value.toFixed(2).replace('.', ','));
    });
    setTimeout(() => {
      Animated.timing(anim, { toValue: num, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    }, 600);
    return () => anim.removeAllListeners();
  }, []);

  return <Text style={style}>{display}</Text>;
}

// ── Pulso no cashback ──
function PulseBadge({ children, style }) {
  const sc = useRef(new Animated.Value(0.7)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(sc, { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(op, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        Animated.loop(Animated.sequence([
          Animated.timing(sc, { toValue: 1.06, duration: 700, useNativeDriver: true }),
          Animated.timing(sc, { toValue: 1,    duration: 700, useNativeDriver: true }),
        ])).start();
      });
    }, 1000);
  }, []);

  return (
    <Animated.View style={[style, { opacity: op, transform: [{ scale: sc }] }]}>
      {children}
    </Animated.View>
  );
}

export default function ComprovanteScreen({ navigation, route }) {
  const params          = route?.params ?? {};
  const posto           = params.posto ?? { nome: 'Sete Estrelas', preco: '5,89', cashback: '1' };
  const bico            = params.bico  ?? params.bomba ?? '03';
  const valorCobrado    = params.valorCobrado ?? params.valorAbastecido ?? params.valor ?? '89,35';
  const litros          = params.litros ?? (
    (parseFloat(valorCobrado.replace(',', '.')) /
     parseFloat((posto.preco ?? '5,89').replace(',', '.'))).toFixed(2).replace('.', ',')
  );
  const metodoPagamento = params.metodoPagamento ?? 'Cartão cadastrado';
  const pagoDiretoPosto = params.pagoDiretoPosto ?? false;

  const [rating, setRating] = useState(0);
  const [rated,  setRated]  = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const ring1Anim = useRef(new Animated.Value(0)).current;
  const ring2Anim = useRef(new Animated.Value(0)).current;
  const ring3Anim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const starAnims = useRef([1,2,3,4,5].map(() => new Animated.Value(0))).current;

  const cashback = ((parseFloat(valorCobrado.replace(',', '.')) *
    parseFloat(posto?.cashback ?? 1)) / 100).toFixed(2).replace('.', ',');

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 5, useNativeDriver: true }),
      Animated.timing(checkAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(ring1Anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(ring2Anim, { toValue: 1, duration: 950, useNativeDriver: true }),
        Animated.timing(ring3Anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Estrelas entram uma a uma
      starAnims.forEach((a, i) => {
        setTimeout(() => {
          Animated.spring(a, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }).start();
        }, i * 100);
      });
    });
  }, []);

  const handleRating = (n) => {
    if (rated) return;
    setRating(n);
    setRated(true);
  };

  const rows = [
    { label: 'Data e hora',        value: new Date().toLocaleString('pt-BR') },
    { label: 'Posto',              value: posto?.nome },
    { label: 'Bico',               value: `#${String(bico).padStart(2, '0')} — Gasolina Comum` },
    { label: 'Litros abastecidos', value: `${litros} L` },
    { label: 'Preço por litro',    value: `R$ ${posto?.preco ?? '5,39'}` },
    { label: 'Pagamento',          value: pagoDiretoPosto ? 'Pago direto no posto' : metodoPagamento },
  ];

  return (
    <ScreenWrapper edges={['top']}>
      {/* Confetti sobreposto à tela toda */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {CONFETTI.map((c, i) => <ConfettiPiece key={i} {...c} />)}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Sucesso ── */}
        <View style={styles.successHeader}>
          <View style={styles.ringsWrap}>
            {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

            <Animated.View style={[styles.ring, {
              opacity: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
              transform: [{ scale: ring1Anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.0] }) }],
            }]} />
            <Animated.View style={[styles.ring, styles.ring2, {
              opacity: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
              transform: [{ scale: ring2Anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 2.6] }) }],
            }]} />
            <Animated.View style={[styles.ring, styles.ring3, {
              opacity: ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }),
              transform: [{ scale: ring3Anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 3.2] }) }],
            }]} />

            <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }, shadows.verde]}>
              <Animated.Text style={[styles.successIcon, { opacity: checkAnim, transform: [{ scale: checkAnim }] }]}>✓</Animated.Text>
            </Animated.View>
          </View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center', gap: 6 }}>
            <Text style={styles.successTitle}>Abastecimento concluído!</Text>
            <Text style={styles.successSub}>Pagamento processado com sucesso</Text>
          </Animated.View>
        </View>

        {/* ── Valor com contador ── */}
        <Animated.View style={[styles.valorCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.valorLabel}>VALOR COBRADO</Text>
          <View style={styles.valorRow}>
            <Text style={styles.valorRS}>R$</Text>
            <CountUp target={valorCobrado} style={styles.valorDestaque} />
          </View>
          <View style={styles.valorDivider} />
          <Text style={styles.valorLitros}>
            <Text style={{ color: colors.verde, fontWeight: '800' }}>{litros} L</Text>
            {' '}de Gasolina Comum · R$ {posto?.preco}/L
          </Text>
        </Animated.View>

        {/* ── Cashback ── */}
        <View style={[styles.cashbackBanner, shadows.laranja]}>
          <View style={styles.cashbackLeft}>
            <Text style={styles.cashbackIcon}>💰</Text>
          </View>
          <View style={styles.cashbackInfo}>
            <Text style={styles.cashbackLabel}>CASHBACK CREDITADO</Text>
            <Text style={styles.cashbackValor}>+ R$ {cashback}</Text>
            <Text style={styles.cashbackSub}>Já disponível na sua carteira</Text>
          </View>
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackBadgeText}>{posto?.cashback ?? '1'}%</Text>
          </View>
        </View>

        {/* ── Comprovante ── */}
        <Animated.View style={[{ opacity: fadeAnim }]}>
          <View style={[styles.receipt, shadows.card]}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptTitleRow}>
                <Text style={styles.receiptIcon}>🧾</Text>
                <Text style={styles.receiptTitle}>Comprovante</Text>
              </View>
              <Text style={styles.receiptId}>#AB2026-00847</Text>
            </View>
            {rows.map((row, i) => (
              <View key={row.label} style={[styles.receiptRow, i === rows.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
            <View style={styles.receiptTotal}>
              <Text style={styles.totalLabel}>Total cobrado</Text>
              <Text style={styles.totalValue}>R$ {valorCobrado}</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Ações ── */}
        <View style={styles.actions}>
          {[
            { icon: '📤', label: 'Compartilhar' },
            { icon: '⬇️', label: 'Baixar PDF' },
            { icon: '📧', label: 'E-mail' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Avaliação com estrelas animadas ── */}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingTitle}>Como foi o atendimento?</Text>
          <Text style={styles.ratingSubtitle}>Sua avaliação ajuda outros motoristas</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n, i) => (
              <TouchableOpacity key={n} onPress={() => handleRating(n)} activeOpacity={0.7}>
                <Animated.Text style={[
                  styles.star,
                  n <= rating && styles.starActive,
                  { transform: [{ scale: starAnims[i] }] },
                ]}>★</Animated.Text>
              </TouchableOpacity>
            ))}
          </View>
          {rated && (
            <Text style={styles.ratedText}>Obrigado pela avaliação! ✓</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btnHome, shadows.verde]}
          onPress={() => navigation.navigate('Mapa')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnHomeText}>Voltar ao início</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, gap: 16 },

  successHeader: { alignItems: 'center', paddingTop: 16, paddingBottom: 4, gap: 16 },
  ringsWrap: {
    width: 160, height: 160,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  ring:  { position: 'absolute', width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.verde },
  ring2: { borderColor: 'rgba(108,194,74,0.45)' },
  ring3: { borderColor: 'rgba(108,194,74,0.22)' },
  successCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
  },
  successIcon:  { fontSize: 42, color: colors.white },
  successTitle: { fontSize: 24, fontWeight: '900', color: colors.text, textAlign: 'center' },
  successSub:   { fontSize: 14, color: colors.textSec, textAlign: 'center' },

  valorCard: {
    backgroundColor: colors.verdeBg,
    borderWidth: 1, borderColor: 'rgba(109,194,41,0.25)',
    borderRadius: radius.xl, padding: 20, alignItems: 'center', gap: 8,
  },
  valorLabel:    { fontSize: 11, color: 'rgba(109,194,41,0.7)', fontWeight: '700', letterSpacing: 2 },
  valorRow:      { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  valorRS:       { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: 6 },
  valorDestaque: { fontSize: 52, fontWeight: '900', color: colors.text, lineHeight: 58 },
  valorDivider:  { width: 40, height: 2, backgroundColor: 'rgba(109,194,41,0.3)', borderRadius: 2 },
  valorLitros:   { fontSize: 13, color: colors.textSec },

  cashbackBanner: {
    backgroundColor: colors.laranjaBg,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
    borderRadius: radius.xl, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  cashbackLeft: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(245,166,35,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  cashbackIcon:      { fontSize: 26 },
  cashbackInfo:      { flex: 1, gap: 2 },
  cashbackLabel:     { fontSize: 10, color: colors.laranja, fontWeight: '700', letterSpacing: 1 },
  cashbackValor:     { fontSize: 20, fontWeight: '900', color: colors.laranja },
  cashbackSub:       { fontSize: 11, color: colors.textSec },
  cashbackBadge:     { backgroundColor: colors.laranja, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 5 },
  cashbackBadgeText: { color: colors.white, fontSize: 13, fontWeight: '900' },

  receipt: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, overflow: 'hidden',
  },
  receiptHeader: {
    backgroundColor: 'rgba(109,194,41,0.06)',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    padding: 14, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  receiptTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptIcon:     { fontSize: 16 },
  receiptTitle:    { fontSize: 15, fontWeight: '800', color: colors.text },
  receiptId:       { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  rowLabel: { fontSize: 13, color: colors.textSec },
  rowValue: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'right', flex: 1, marginLeft: 12 },
  receiptTotal: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(109,194,41,0.06)',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
  totalValue: { fontSize: 18, fontWeight: '900', color: colors.verde },

  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: 8,
    alignItems: 'center', gap: 6,
  },
  actionIcon:  { fontSize: 22 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.textSec },

  ratingCard: {
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 20, alignItems: 'center', gap: 8,
  },
  ratingTitle:    { fontSize: 15, fontWeight: '800', color: colors.text },
  ratingSubtitle: { fontSize: 12, color: colors.textSec },
  stars:          { flexDirection: 'row', gap: 8, marginTop: 4 },
  star:           { fontSize: 34, color: colors.border },
  starActive:     { color: colors.laranja },
  ratedText:      { fontSize: 12, color: colors.verde, fontWeight: '700', marginTop: 4 },

  btnHome: {
    backgroundColor: colors.verde,
    borderRadius: radius.lg, padding: 17, alignItems: 'center', marginTop: 4,
  },
  btnHomeText: { color: colors.white, fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
});
