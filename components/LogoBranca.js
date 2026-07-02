import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LogoBranca({ scale = 1 }) {
  const s = scale;

  return (
    <View style={[styles.row, { transform: [{ scale: s }] }]}>
      {/* ícone: pin de localização + gota */}
      <View style={styles.pinWrap}>
        {/* corpo do pin */}
        <View style={styles.pinBody}>
          {/* círculo interno */}
          <View style={styles.pinInner}>
            {/* gota de combustível */}
            <View style={styles.dropWrap}>
              <View style={styles.dropBody} />
              <View style={styles.dropTip} />
            </View>
          </View>
        </View>
        {/* ponta do pin */}
        <View style={styles.pinPoint} />
      </View>

      {/* texto */}
      <View style={styles.textWrap}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>Abastece</Text>
          <Text style={styles.plus}>+</Text>
        </View>
        <Text style={styles.tagline}>PAGUE. ABASTECA. SIGA.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  pinWrap: {
    alignItems: 'center',
    width: 52,
  },
  pinBody: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 4,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '45deg' }],
  },
  pinInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
  },
  dropWrap: {
    alignItems: 'center',
  },
  dropTip: {
    width: 0, height: 0,
    borderLeftWidth: 4.5,
    borderRightWidth: 4.5,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.9)',
    transform: [{ rotate: '180deg' }],
  },
  dropBody: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  textWrap: {
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  plus: {
    fontSize: 30,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 34,
  },
  tagline: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.8,
  },
});
