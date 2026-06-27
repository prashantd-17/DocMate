import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';
import PrimaryButton from './PrimaryButton';

type Props = {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCta?: () => void;
  icon?: React.ReactNode;
  testID?: string;
};

export default function EmptyState({ title, description, ctaLabel, onCta, icon, testID }: Props) {
  const { colors } = useTheme();
  return (
    <View testID={testID ?? 'empty-state'} style={styles.container}>
      {icon ? <View style={[styles.iconWrap, { backgroundColor: colors.brandTertiary }]}>{icon}</View> : null}
      <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      {description ? (
        <Text style={[styles.desc, { color: colors.onSurfaceSecondary }]}>{description}</Text>
      ) : null}
      {ctaLabel && onCta ? (
        <View style={{ marginTop: spacing.lg, alignSelf: 'stretch', paddingHorizontal: spacing.xxl }}>
          <PrimaryButton label={ctaLabel} onPress={onCta} testID="empty-state-cta" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  desc: {
    fontSize: typography.sizes.base,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
