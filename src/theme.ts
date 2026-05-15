import { useColorScheme } from 'react-native';
import { useStore } from './store';

export type ColorScheme = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primarySoft: string;
  accent: string;
  warning: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
  danger: string;
};

export const lightColors: ColorScheme = {
  bg: '#F4F1FB',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEAF8',
  primary: '#6C5CE7',
  primarySoft: '#A29BFE',
  accent: '#00B894',
  warning: '#FDCB6E',
  text: '#2D3436',
  textMuted: '#636E72',
  textFaint: '#9AA1A6',
  border: '#E4DEF2',
  danger: '#E17055',
};

export const darkColors: ColorScheme = {
  bg: '#15131F',
  surface: '#211E32',
  surfaceAlt: '#2C2841',
  primary: '#9C8FFF',
  primarySoft: '#7468E1',
  accent: '#1FD8A8',
  warning: '#FFD479',
  text: '#ECE7FA',
  textMuted: '#9D97B5',
  textFaint: '#6A647F',
  border: '#2C2841',
  danger: '#FF8674',
};

// Default export kept for any non-React code path; do not rely on this in
// components — use useColors() so the palette tracks the live setting.
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const type = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '500' as const },
  small: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const },
};

export const useColors = (): ColorScheme => {
  const pref = useStore((s) => s.settings.theme);
  const system = useColorScheme();
  if (pref === 'light') return lightColors;
  if (pref === 'dark') return darkColors;
  return system === 'dark' ? darkColors : lightColors;
};
