import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';
import { GovPreset } from '@/src/types';

type Props = {
  preset: GovPreset;
  onPress?: () => void;
  icon?: React.ReactNode;
  testID?: string;
};

export default function GovPresetCard({ preset, onPress, icon, testID }: Props) {
  const { colors } = useTheme();
  const dim = preset.dimensionsPx
    ? `${preset.dimensionsPx.width}×${preset.dimensionsPx.height}px`
    : 'Custom';
  return (
    <Pressable
      testID={testID ?? `preset-card-${preset.id}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.brandTertiary }]}>{icon}</View>
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.onSurface }]} numberOfLines={1}>
          {preset.name}
        </Text>
        <Text style={[styles.meta, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
          Max {preset.maxSizeKB} KB · {dim} · {preset.formats.join('/')}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.onSurfaceTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { flex: 1, gap: 2 },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  meta: { fontSize: typography.sizes.sm },
});
