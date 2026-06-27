import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, Info } from 'lucide-react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';

type ToastKind = 'success' | 'error' | 'info';
type ToastCtx = { show: (msg: string, kind?: ToastKind) => void };
const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [kind, setKind] = useState<ToastKind>('success');
  const opacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (m: string, k: ToastKind = 'success') => {
      setMsg(m);
      setKind(k);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setMsg(null));
      }, 2200);
    },
    [opacity]
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? XCircle : Info;
  const iconColor = kind === 'success' ? colors.success : kind === 'error' ? colors.error : colors.brandPrimary;

  const wrapStyle: ViewStyle = {
    position: 'absolute',
    bottom: insets.bottom + 96, // above bottom tabs
    left: spacing.xl,
    right: spacing.xl,
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return (
    <Ctx.Provider value={{ show }}>
      {children}
      {msg && (
        <Animated.View style={[wrapStyle, { opacity }]}>
          <View
            style={[
              styles.toast,
              { backgroundColor: colors.surfaceInverse, shadowColor: '#000' },
            ]}
          >
            <Icon size={18} color={iconColor} />
            <Text style={[styles.text, { color: colors.onSurfaceInverse }]} numberOfLines={2}>
              {msg}
            </Text>
          </View>
        </Animated.View>
      )}
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _Pressable = Pressable; // keep import noise free
