import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

function OrbFlutuante({ size, cor, initialX, initialY, duration, delay }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 1200, delay, useNativeDriver: true }).start();

    const floatX = () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(x, { toValue: 18,  duration: duration,       useNativeDriver: true, delay }),
          Animated.timing(x, { toValue: -14, duration: duration * 1.2, useNativeDriver: true }),
          Animated.timing(x, { toValue: 0,   duration: duration * 0.9, useNativeDriver: true }),
        ])
      ).start();

    const floatY = () =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(y, { toValue: -22, duration: duration * 1.1, useNativeDriver: true, delay }),
          Animated.timing(y, { toValue: 12,  duration: duration,       useNativeDriver: true }),
          Animated.timing(y, { toValue: 0,   duration: duration * 0.8, useNativeDriver: true }),
        ])
      ).start();

    floatX();
    floatY();
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
        opacity,
        transform: [{ translateX: x }, { translateY: y }],
      }}
    />
  );
}

export default function SplashScreen({ navigation }) {
  const scaleAnim   = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const barWidth    = useRef(new Animated.Value(0)).current;
  const insets      = useSafeAreaInsets();

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(barWidth, { toValue: 1, duration: 1100, useNativeDriver: false }),
    ]).start(() => {
      setTimeout(() => navigation.replace('Onboarding'), 150);
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom || 40 }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1B2E" />

      {/* Orbs flutuantes de fundo */}
      <OrbFlutuante size={220} cor="rgba(108,194,74,0.06)" initialX={-60}        initialY={-40}          duration={4800} delay={0}    />
      <OrbFlutuante size={160} cor="rgba(108,194,74,0.05)" initialX={width - 100} initialY={height * 0.55} duration={5600} delay={400}  />
      <OrbFlutuante size={100} cor="rgba(108,194,74,0.05)" initialX={width * 0.3} initialY={height * 0.7}  duration={3900} delay={700}  />
      <OrbFlutuante size={80}  cor="rgba(108,194,74,0.04)" initialX={width * 0.6} initialY={60}           duration={5100} delay={200}  />

      <View style={styles.center}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <Animated.Text style={[styles.tagline, { opacity: taglineAnim }]}>
          PAGUE · ABASTEÇA · SIGA
        </Animated.Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <Animated.View
            style={[
              styles.barFill,
              { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
            ]}
          />
        </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  logo: { width: 300, height: 220 },
  tagline: {
    fontSize: 11, fontWeight: '700',
    color: 'rgba(108,194,74,0.6)',
    letterSpacing: 4,
  },
  footer: { width: '100%', alignItems: 'center', paddingBottom: 16 },
  barTrack: {
    width: 120, height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10, overflow: 'hidden',
  },
  barFill: {
    height: '100%', backgroundColor: '#6CC24A', borderRadius: 10,
  },
});
