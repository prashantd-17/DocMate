import { useColorScheme } from 'react-native';
import { useAppStore } from '@/src/store/useAppStore';
import { darkColors, lightColors, ColorScheme } from './index';

export function useTheme(): { colors: ColorScheme; isDark: boolean } {
  const system = useColorScheme();
  const mode = useAppStore((s) => s.themeMode);
  const effective = mode === 'system' ? (system ?? 'light') : mode;
  const isDark = effective === 'dark';
  return { colors: isDark ? darkColors : lightColors, isDark };
}
