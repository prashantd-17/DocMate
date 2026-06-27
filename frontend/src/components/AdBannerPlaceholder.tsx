import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';

type Props = {
  label?: string;
  style?: ViewStyle;
  testID?: string;
};

export default function AdBannerPlaceholder({ label = 'Ad Placement', style, testID }: Props) {
  const { colors } = useTheme();
  return (
    <View
      testID={testID ?? 'ad-banner-placeholder'}
      style={[
        styles.container,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.onSurfaceTertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
  },
  text: {
    fontSize: typography.sizes.sm,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
