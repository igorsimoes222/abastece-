import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated, Image, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function OrbFlutuante({ size, cor, initialX, initialY, duration, delay }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 20,  duration: duration,       useNativeDriver: true, delay }),
        Animated.timing(x, { toValue: -15, duration: duration * 1.2, useNativeDriver: true }),
        Animated.timing(x, { toValue: 0,   duration: duration * 0.9, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: -24, duration: duration * 1.1, useNativeDriver: true, delay }),
        Animated.timing(y, { toValue: 14,  duration: duration,       useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,   duration: duration * 0.8, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: cor,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    />
  );
}

const SLIDES = [
  {
    key: '1',
    emoji: '⛽',
    titulo: 'Abasteça e ganhe\ncashback',
    sub: 'Cada litro abastecido vira dinheiro de volta no seu bolso, na hora.',
    cor: '#42A5F5',
  },
  {
    key: '2',
    emoji: '🏆',
    titulo: 'Benefícios\nexclusivos',
    sub: 'Descontos, promoções e vantagens que só clientes Abastece+ têm acesso.',
    cor: '#64B5F6',
  },
  {
    key: '3',
    emoji: '📱',
    titulo: 'Tudo na palma\nda sua mão',
    sub: 'Autorize, pague e acompanhe cada abastecimento direto pelo app.',
    cor: '#90CAF9',
  },
];

function Slide({ item }) {
  const scaleAnim = useRef(new Animated.Value(0.75)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 450, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.slide, { width }]}>
      <Animated.View
        style={[
          styles.emojiWrap,
          { borderColor: item.cor + '40', transform: [{ scale: scaleAnim }], opacity: fadeAnim },
        ]}
      >
        <View style={[styles.emojiGlow, { backgroundColor: item.cor + '15' }]} />
        <Text style={styles.emoji}>{item.emoji}</Text>
      </Animated.View>

      <Animated.View style={{ opacity: fadeAnim, alignItems: 'center', gap: 14 }}>
        <Text style={styles.slideTitulo}>{item.titulo}</Text>
        <Text style={styles.slideSub}>{item.sub}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const insets   = useSafeAreaInsets();
  const [idx, setIdx] = useState(0);
  const listRef  = useRef(null);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % SLIDES.length;
        listRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3200);
  };

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== idx) { setIdx(i); resetTimer(); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom || 16 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2E" />

      {/* Orbs flutuantes de fundo */}
      <OrbFlutuante size={240} cor="rgba(108,194,74,0.06)" initialX={-80}         initialY={-60}          duration={5200} delay={0}   />
      <OrbFlutuante size={180} cor="rgba(108,194,74,0.05)" initialX={width - 110}  initialY={height * 0.3}  duration={6000} delay={500} />
      <OrbFlutuante size={120} cor="rgba(108,194,74,0.05)" initialX={width * 0.25} initialY={height * 0.55} duration={4200} delay={800} />
      <OrbFlutuante size={90}  cor="rgba(108,194,74,0.04)" initialX={width * 0.55} initialY={80}            duration={5500} delay={300} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={i => i.key}
        renderItem={({ item }) => <Slide item={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        style={styles.list}
      />

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => {
              setIdx(i);
              listRef.current?.scrollToIndex({ index: i, animated: true });
              resetTimer();
            }}
          >
            <View style={[styles.dot, i === idx && styles.dotAtivo]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.botoesArea}>
        <TouchableOpacity
          style={styles.btnCadastrar}
          onPress={() => navigation.navigate('Login', { tab: 'cadastro' })}
          activeOpacity={0.88}
        >
          <Text style={styles.btnCadastrarText}>Quero me cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnEntrar}
          onPress={() => navigation.navigate('Login', { tab: 'login' })}
          activeOpacity={0.88}
        >
          <Text style={styles.btnEntrarText}>Já tenho conta</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Ao continuar você aceita nossos{' '}
          <Text style={{ color: '#6CC24A' }}>Termos de Uso</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2E',
    alignItems: 'center',
  },
  logoArea: { marginTop: 8, alignItems: 'center' },
  logo: { width: 260, height: 130 },
  list: { flexGrow: 0, marginTop: 'auto', marginBottom: 'auto' },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
    gap: 32,
    height: height * 0.40,
  },
  emojiWrap: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  emojiGlow: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
  },
  emoji: { fontSize: 58 },
  slideTitulo: {
    fontSize: 28, fontWeight: '900', color: '#FFFFFF',
    textAlign: 'center', lineHeight: 35,
  },
  slideSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.45)',
    textAlign: 'center', lineHeight: 22,
  },
  dots: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotAtivo: { width: 26, backgroundColor: '#6CC24A' },
  botoesArea: {
    width: '100%', paddingHorizontal: 28,
    gap: 12, marginTop: 'auto', paddingBottom: 8,
  },
  btnCadastrar: {
    backgroundColor: '#6CC24A',
    borderRadius: 16, padding: 17, alignItems: 'center',
    shadowColor: '#6CC24A', shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  btnCadastrarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  btnEntrar: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16, padding: 17, alignItems: 'center',
  },
  btnEntrarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  termsText: {
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    textAlign: 'center', marginTop: 2,
  },
});
