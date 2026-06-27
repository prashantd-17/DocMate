import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme/useTheme';
import { spacing, typography } from '@/src/theme';

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  left?: React.ReactNode;
  style?: ViewStyle;
};

export default function ScreenHeader({ title, subtitle, right, left, style }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top + spacing.sm, backgroundColor: colors.surface },
        style,
      ]}
    >
      <View style={styles.row}>
        <View style={{ minWidth: 32 }}>{left}</View>
        <View style={styles.center}>
          <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[styles.sub, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={{ minWidth: 32, alignItems: 'flex-end' }}>{right}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  center: { flex: 1 },
  title: { fontSize: typography.sizes.xxl, fontWeight: typography.weights.bold, letterSpacing: -0.5 },
  sub: { fontSize: typography.sizes.base, marginTop: 2 },
});
