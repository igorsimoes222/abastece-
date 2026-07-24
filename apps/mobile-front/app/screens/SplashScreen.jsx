import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../components/theme';

const logoDeitada = require('../../assets/logodeitada.png');

export default function SplashScreen({ navigation }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.timing(barWidth, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace('Login');
    });
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <View style={s.center}>
        <Animated.View style={{ transform: [{ scale }], opacity, alignItems: 'center' }}>
          <Image
            source={logoDeitada}
            style={s.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <View style={s.barWrap}>
        <Animated.View
          style={[s.bar, {
            width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }]}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 320,
    height: 160,
  },
  barWrap: {
    marginHorizontal: 60,
    marginBottom: 48,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.verde,
    borderRadius: 2,
  },
});
