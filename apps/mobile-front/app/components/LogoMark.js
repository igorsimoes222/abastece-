import React from 'react';
import { View } from 'react-native';

// Logo mark: pin verde + círculo navy + gota laranja
export default function LogoMark({ size = 80 }) {
  const pinW = size;
  const pinH = size * 1.15;
  const r = pinW / 2;
  const circleSize = size * 0.62;
  const dropW = size * 0.22;
  const dropH = size * 0.3;

  return (
    <View
      style={{
        width: pinW,
        height: pinH,
        backgroundColor: '#4ADE80',
        borderRadius: r,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: pinH * 0.08,
      }}
    >
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: '#060F1A',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            width: dropW,
            height: dropH,
            backgroundColor: '#FB923C',
            borderTopLeftRadius: dropW / 2,
            borderTopRightRadius: dropW / 2,
            borderBottomLeftRadius: dropW * 0.15,
            borderBottomRightRadius: dropW * 0.15,
            transform: [{ rotate: '180deg' }],
          }}
        />
      </View>
    </View>
  );
}
