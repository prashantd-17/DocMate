// DocMate Theme — Sage Green + Monochrome (per design_guidelines.json)

export const lightColors = {
  surface: '#FFFFFF',
  onSurface: '#121212',
  surfaceSecondary: '#F4F4F5',
  onSurfaceSecondary: '#525252',
  surfaceTertiary: '#E5E5E5',
  onSurfaceTertiary: '#737373',
  surfaceInverse: '#1C1C1E',
  onSurfaceInverse: '#FFFFFF',
  brand: '#4A5D4E',
  brandPrimary: '#4A5D4E',
  onBrandPrimary: '#FFFFFF',
  brandSecondary: '#E8EBE9',
  onBrandSecondary: '#313F34',
  brandTertiary: '#F2F4F2',
  onBrandTertiary: '#4A5D4E',
  success: '#347A52',
  warning: '#B57B22',
  error: '#B33A3A',
  border: '#E5E5E5',
  borderStrong: '#A3A3A3',
  divider: '#F0F0F0',
} as const;

export const darkColors = {
  surface: '#0E0E10',
  onSurface: '#F5F5F5',
  surfaceSecondary: '#1C1C1E',
  onSurfaceSecondary: '#A3A3A3',
  surfaceTertiary: '#2A2A2C',
  onSurfaceTertiary: '#8A8A8A',
  surfaceInverse: '#FFFFFF',
  onSurfaceInverse: '#121212',
  brand: '#8FA793',
  brandPrimary: '#8FA793',
  onBrandPrimary: '#0E0E10',
  brandSecondary: '#1F2A22',
  onBrandSecondary: '#C7D4C9',
  brandTertiary: '#1A2019',
  onBrandTertiary: '#8FA793',
  success: '#5FAE7E',
  warning: '#D69A4E',
  error: '#E06B6B',
  border: '#2A2A2C',
  borderStrong: '#52525B',
  divider: '#1F1F22',
} as const;

export type ColorScheme = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

export const typography = {
  family: undefined as string | undefined, // System font (Geist not bundled — use system stack)
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 15,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};
