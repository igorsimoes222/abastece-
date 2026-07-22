import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Animated, TouchableOpacity, StyleSheet, Vibration,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { colors, radius, spacing } from '../../components/theme';

// Produção: instalar react-native-nfc-manager + custom dev client
// Tag NFC deve conter NDEF JSON: { bico: "09", bomba: "2", posto_id: "2", combustivel: "Gasolina Comum" }

export default function NFCScreen({ navigation, route }) {
  const posto = route?.params?.posto ?? null;
  const [detectado, setDetectado] = useState(false);

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const criarPulso = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 2000, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    Animated.parallel([
      criarPulso(pulse1, 0),
      criarPulso(pulse2, 666),
      criarPulso(pulse3, 1333),
    ]).start();
  }, []);

  const onNFCDetectado = (dadosNFC) => {
    if (detectado) return;
    setDetectado(true);
    Vibration.vibrate([0, 80, 60, 120]);

    Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, tension: 60 }).start();

    setTimeout(() => {
      navigation.navigate('Autorizacao', {
        posto,
        nfcDetected: true,
        bicoNFC: dadosNFC.bico,
        bomba: dadosNFC.bomba,
        combustivel: dadosNFC.combustivel ?? 'Gasolina Comum',
      });
    }, 700);
  };

  const simularNFC = () =>
    onNFCDetectado({ bico: '09', bomba: '2', combustivel: 'Gasolina Comum' });

  const pulseStyle = (val) => ({
    opacity: val.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] }),
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
  });

  return (
    <ScreenWrapper edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Abastecer</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        {/* Card do posto (se veio do mapa) */}
        {posto && (
          <View style={styles.postoCard}>
            <Text style={styles.postoEmoji}>⛽</Text>
            <View style={styles.postoInfo}>
              <Text style={styles.postoNome}>{posto.nome}</Text>
              <Text style={styles.postoEnde}>{posto.endereco ?? posto.ende ?? ''}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.trocarBtn}>Trocar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Área NFC com ondas */}
        <View style={styles.nfcArea}>
          {[pulse1, pulse2, pulse3].map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.pulseRing,
                pulseStyle(p),
                detectado && { borderColor: colors.verde, opacity: 0 },
              ]}
            />
          ))}
          <Animated.View
            style={[
              styles.nfcCircle,
              detectado && styles.nfcCircleOk,
              { transform: [{ scale: detectado ? checkScale : 1 }] },
            ]}
          >
            <Text style={styles.nfcIcon}>{detectado ? '✓' : '📡'}</Text>
          </Animated.View>
        </View>

        <Text style={styles.titulo}>
          {detectado ? 'Bico identificado!' : 'Aproxime o celular do bico'}
        </Text>
        <Text style={styles.subtitulo}>
          {detectado
            ? 'Abrindo autorização...'
            : 'Encoste a parte de trás do celular na etiqueta NFC fixada no bico'}
        </Text>

        {/* Separador */}
        {!detectado && (
          <View style={styles.separadorRow}>
            <View style={styles.separadorLinha} />
            <Text style={styles.separadorText}>ou</Text>
            <View style={styles.separadorLinha} />
          </View>
        )}

        {/* Fallback manual */}
        {!detectado && (
          <View style={styles.fallbackArea}>
            <TouchableOpacity
              style={styles.fallbackBtn}
              onPress={() => navigation.navigate('Autorizacao', { posto })}
            >
              <Text style={styles.fallbackIcon}>⌨️</Text>
              <View>
                <Text style={styles.fallbackTitulo}>Prefere digitar o código?</Text>
                <Text style={styles.fallbackDesc}>Insira o número do bico manualmente</Text>
              </View>
              <Text style={styles.fallbackArrow}>›</Text>
            </TouchableOpacity>

            {/* Botão DEV apenas em modo desenvolvimento */}
            {__DEV__ && (
              <TouchableOpacity style={styles.devBtn} onPress={simularNFC}>
                <Text style={styles.devBtnText}>🧪 Simular leitura NFC (DEV)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: 22,
  },

  postoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 14,
    width: '100%',
  },
  postoEmoji: { fontSize: 28 },
  postoInfo: { flex: 1 },
  postoNome: { fontSize: 14, fontWeight: '800', color: colors.text },
  postoEnde: { fontSize: 11, color: colors.textSec, marginTop: 2 },
  trocarBtn: { fontSize: 13, color: colors.verde, fontWeight: '700' },

  nfcArea: {
    width: 200, height: 200,
    alignItems: 'center', justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: colors.verde,
  },
  nfcCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(108,194,74,0.10)',
    borderWidth: 2.5, borderColor: colors.verde,
    alignItems: 'center', justifyContent: 'center',
  },
  nfcCircleOk: {
    backgroundColor: 'rgba(108,194,74,0.22)',
    borderColor: colors.verde,
  },
  nfcIcon: { fontSize: 46 },

  titulo: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center' },
  subtitulo: {
    fontSize: 14, color: colors.textSec,
    textAlign: 'center', lineHeight: 20, paddingHorizontal: 10,
  },

  separadorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, width: '80%',
  },
  separadorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  separadorText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },

  fallbackArea: { width: '100%', alignItems: 'center', gap: 12 },
  fallbackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.xl, padding: 16, width: '100%',
  },
  fallbackIcon: { fontSize: 22 },
  fallbackTitulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  fallbackDesc: { fontSize: 11, color: colors.textSec, marginTop: 2 },
  fallbackArrow: { fontSize: 22, color: colors.textSec, marginLeft: 'auto' },

  devBtn: {
    backgroundColor: 'rgba(255,140,0,0.08)',
    borderRadius: radius.md, paddingVertical: 9, paddingHorizontal: 18,
    borderWidth: 1, borderColor: 'rgba(255,140,0,0.25)',
  },
  devBtnText: { fontSize: 12, color: '#FF8C00', fontWeight: '700' },
});
