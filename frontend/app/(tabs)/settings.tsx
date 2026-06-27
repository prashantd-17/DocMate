import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Moon, Sun, Smartphone, HardDrive, Trash2, Share2, Star, Info, Shield, Globe,
} from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import ScreenHeader from '@/src/components/ScreenHeader';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import AdBannerPlaceholder from '@/src/components/AdBannerPlaceholder';
import { useAppStore } from '@/src/store/useAppStore';
import { formatBytes } from '@/src/utils/format';

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const themeMode = useAppStore((s) => s.themeMode);
  const setThemeMode = useAppStore((s) => s.setThemeMode);
  const files = useAppStore((s) => s.files);
  const clearAll = useAppStore((s) => s.clearAllFiles);

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + (f.sizeBytes || 0), 0), [files]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="settings-screen">
      <ScreenHeader title="Settings" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View style={[styles.group, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Theme</Text>
            <View style={styles.segment}>
              {(
                [
                  { id: 'system' as const, label: 'Auto', icon: Smartphone },
                  { id: 'light' as const, label: 'Light', icon: Sun },
                  { id: 'dark' as const, label: 'Dark', icon: Moon },
                ]
              ).map(({ id, label, icon: Icon }) => {
                const active = themeMode === id;
                return (
                  <Pressable
                    key={id}
                    testID={`theme-${id}`}
                    onPress={() => setThemeMode(id)}
                    style={[
                      styles.segmentBtn,
                      {
                        backgroundColor: active ? colors.brandPrimary : 'transparent',
                      },
                    ]}
                  >
                    <Icon size={14} color={active ? colors.onBrandPrimary : colors.onSurfaceSecondary} />
                    <Text
                      style={[
                        styles.segmentText,
                        { color: active ? colors.onBrandPrimary : colors.onSurfaceSecondary },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Storage */}
        <SectionHeader title="Storage" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ListRow
            testID="storage-info-row"
            icon={<HardDrive size={20} color={colors.onBrandTertiary} />}
            title="On-device storage"
            subtitle={`${files.length} file${files.length === 1 ? '' : 's'} · ${formatBytes(totalSize)} used`}
            trailing={<View />}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <ListRow
            testID="clear-all-row"
            icon={<Trash2 size={20} color={colors.error} />}
            title="Clear all files"
            subtitle="Permanently remove all stored documents"
            onPress={clearAll}
            trailing={<Text style={{ color: colors.error, fontWeight: '600' }}>Clear</Text>}
          />
        </View>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ListRow
            testID="language-row"
            icon={<Globe size={20} color={colors.onBrandTertiary} />}
            title="Language"
            subtitle="English (more languages coming soon)"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <ListRow
            testID="privacy-row"
            icon={<Shield size={20} color={colors.onBrandTertiary} />}
            title="Privacy"
            subtitle="100% offline · no account · no tracking"
          />
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ListRow
            testID="rate-app-row"
            icon={<Star size={20} color={colors.onBrandTertiary} />}
            title="Rate DocMate"
            subtitle="Help us improve with a quick review"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <ListRow
            testID="share-app-row"
            icon={<Share2 size={20} color={colors.onBrandTertiary} />}
            title="Share DocMate"
            subtitle="Tell a friend about the app"
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <ListRow
            testID="about-row"
            icon={<Info size={20} color={colors.onBrandTertiary} />}
            title="About"
            subtitle="Version 1.0.0 · Offline-first"
          />
        </View>

        <Text style={[styles.footer, { color: colors.onSurfaceTertiary }]}>
          DocMate works entirely on your device. We never collect, sync or upload your documents.
        </Text>
      </ScrollView>

      <AdBannerPlaceholder testID="settings-ad-banner" />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  label: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium },
  segment: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
    gap: 4,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  segmentText: { fontSize: 12, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: spacing.xs, marginHorizontal: spacing.sm },
  footer: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 18,
  },
});
