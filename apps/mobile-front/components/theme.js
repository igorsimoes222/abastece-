export const colors = {
  // Fundo
  bg: '#060F1A',
  surface: '#0C1929',
  card: '#0F2035',
  cardHigh: '#152840',
  border: 'rgba(255,255,255,0.07)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Marca
  verde: '#4ADE80',
  verdeEscuro: '#22C55E',
  verdeBg: 'rgba(74,222,128,0.12)',
  verdeGlow: 'rgba(74,222,128,0.22)',
  laranja: '#FB923C',
  laranjaBg: 'rgba(251,146,60,0.13)',
  laranjaGlow: 'rgba(251,146,60,0.22)',

  // Texto
  text: '#EDF4FF',
  textSec: '#7B97B4',
  textMuted: '#324A62',

  // Status
  red: '#EF4444',
  redBg: 'rgba(239,68,68,0.12)',
  green: '#4ADE80',
  white: '#FFFFFF',

  // Legacy aliases (compatibilidade com telas existentes)
  accent: '#4ADE80',
  muted: '#7B97B4',
  azul: '#4ADE80',
  azulMedio: '#7B97B4',
  azulClaro: '#B4CFEA',
};

export const shadows = {
  verde: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  laranja: {
    shadowColor: '#FB923C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
