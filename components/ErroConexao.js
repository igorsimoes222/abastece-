import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors, radius } from './theme';

export default function ErroConexao({ mensagem, onRetry, tipo = 'erro' }) {
  const slideAnim = useRef(new Animated.Value(20)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const configs = {
    erro:    { icon: '⚠️', cor: colors.red,    bg: 'rgba(229,57,53,0.08)',    borda: 'rgba(229,57,53,0.3)'    },
    offline: { icon: '📡', cor: colors.laranja, bg: 'rgba(245,166,35,0.08)',   borda: 'rgba(245,166,35,0.3)'   },
    timeout: { icon: '⏱️', cor: colors.laranja, bg: 'rgba(245,166,35,0.08)',   borda: 'rgba(245,166,35,0.3)'   },
    sessao:  { icon: '🔒', cor: colors.textSec, bg: 'rgba(255,255,255,0.04)', borda: 'rgba(255,255,255,0.1)'  },
  };

  const cfg = configs[tipo] ?? configs.erro;

  return (
    <Animated.View style={[
      styles.wrap,
      { backgroundColor: cfg.bg, borderColor: cfg.borda, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      <Text style={styles.icon}>{cfg.icon}</Text>
      <Text style={[styles.msg, { color: cfg.cor }]}>{mensagem}</Text>
      {onRetry && (
        <TouchableOpacity style={[styles.btn, { borderColor: cfg.borda }]} onPress={onRetry} activeOpacity={0.7}>
          <Text style={[styles.btnText, { color: cfg.cor }]}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1, borderRadius: radius.lg,
    padding: 14, gap: 6, alignItems: 'center',
  },
  icon: { fontSize: 24 },
  msg:  { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  btn:  { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 8, marginTop: 4 },
  btnText: { fontSize: 13, fontWeight: '700' },
});
