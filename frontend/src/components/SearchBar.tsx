import React from 'react';
import { TextInput, View, StyleSheet, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  testID?: string;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Search', style, testID }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
        style,
      ]}
    >
      <Search size={18} color={colors.onSurfaceSecondary} />
      <TextInput
        testID={testID ?? 'search-bar-input'}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceTertiary}
        style={[styles.input, { color: colors.onSurface }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.lg,
    paddingVertical: 0,
  },
});
