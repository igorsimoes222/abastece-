import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, font } from '../config/theme';

export default function PosStatusBar() {
  const [hora, setHora] = useState('');

  useEffect(() => {
    function atualizar() {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setHora(`${h}:${m}`);
    }
    atualizar();
    const id = setInterval(atualizar, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={s.bar}>
      <Text style={s.hora}>{hora}</Text>
      <View style={s.online}>
        <View style={s.dot} />
        <Text style={s.onlineText}>Online</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hora: { fontSize: font.sm, color: colors.muted },
  online: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  onlineText: { fontSize: font.sm, color: colors.green, fontWeight: '700' },
});
