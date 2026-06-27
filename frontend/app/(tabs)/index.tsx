import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  PenTool,
  FileText,
  FileDown,
  Building2,
  Clock,
  Settings as SettingsIcon,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import { useAppStore } from '@/src/store/useAppStore';
import { greeting } from '@/src/utils/format';
import SearchBar from '@/src/components/SearchBar';
import QuickActionCard from '@/src/components/QuickActionCard';
import SectionHeader from '@/src/components/SectionHeader';
import FileCard from '@/src/components/FileCard';
import AdBannerPlaceholder from '@/src/components/AdBannerPlaceholder';
import GovPresetCard from '@/src/components/GovPresetCard';
import { GOV_PRESETS } from '@/src/data/presets';

const HERO_IMG = 'https://images.unsplash.com/photo-1636306950045-4dbb10b7e0f4';

const QUICK_ACTIONS = [
  { id: 'scanner', label: 'Scan Document', icon: Camera, route: '/scanner' },
  { id: 'compressor', label: 'Compress Image', icon: ImageIcon, route: '/compressor' },
  { id: 'signature', label: 'Signature', icon: PenTool, route: '/signature' },
  { id: 'photo-resizer', label: 'Photo Resizer', icon: FileText, route: '/photo-resizer' },
  { id: 'pdf-tools', label: 'PDF Tools', icon: FileDown, route: '/pdf-tools' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const files = useAppStore((s) => s.files);
  const toggleFav = useAppStore((s) => s.toggleFavoriteFile);
  const [query, setQuery] = useState('');

  const recents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? files.filter((f) => f.name.toLowerCase().includes(q)) : files;
    return list.slice(0, 4);
  }, [files, query]);

  const topPresets = GOV_PRESETS.slice(0, 4);

  return (
    <ScrollView
      testID="home-screen"
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingTop: insets.top + spacing.lg, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.onSurfaceSecondary }]}>{greeting()}</Text>
          <Text style={[styles.brand, { color: colors.onSurface }]}>DocMate</Text>
        </View>
        <Pressable
          testID="home-settings-button"
          onPress={() => router.push('/(tabs)/settings')}
          style={[styles.settingsBtn, { backgroundColor: colors.surfaceSecondary }]}
          hitSlop={8}
        >
          <SettingsIcon size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: spacing.xl }}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search files, tools, presets"
          testID="home-search"
        />
      </View>

      {/* Hero / Tips */}
      <Pressable
        testID="home-hero-card"
        onPress={() => router.push('/(tabs)/government')}
        style={[styles.hero, { borderColor: colors.border }]}
      >
        <Image source={{ uri: HERO_IMG }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.heroContent}>
          <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
            <Sparkles size={12} color="#fff" />
            <Text style={styles.heroBadgeText}>OFFLINE · PRIVATE</Text>
          </View>
          <Text style={styles.heroTitle}>Prepare government documents{'\n'}without the guesswork</Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Browse presets</Text>
            <ArrowRight size={16} color="#fff" />
          </View>
        </View>
      </Pressable>

      {/* Quick Actions */}
      <SectionHeader title="Quick actions" style={{ paddingHorizontal: spacing.xl }} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }}
      >
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <QuickActionCard
              key={a.id}
              label={a.label}
              testID={`quick-action-${a.id}`}
              icon={<Icon size={22} color={colors.onBrandTertiary} strokeWidth={1.8} />}
              onPress={() => router.push(a.route as any)}
            />
          );
        })}
      </ScrollView>

      {/* Government services grid */}
      <SectionHeader
        title="Government services"
        style={{ paddingHorizontal: spacing.xl }}
        action={
          <Pressable testID="home-gov-see-all" onPress={() => router.push('/(tabs)/government')}>
            <Text style={[styles.link, { color: colors.brandPrimary }]}>See all</Text>
          </Pressable>
        }
      />
      <View style={styles.grid}>
        {topPresets.map((p) => (
          <View key={p.id} style={styles.gridItem}>
            <GovPresetCard
              preset={p}
              onPress={() => router.push(`/preset/${p.id}` as any)}
              icon={<Building2 size={20} color={colors.onBrandTertiary} />}
            />
          </View>
        ))}
      </View>

      {/* Recent Files */}
      <SectionHeader
        title="Recent files"
        style={{ paddingHorizontal: spacing.xl }}
        action={
          files.length > 0 ? (
            <Pressable testID="home-history-see-all" onPress={() => router.push('/(tabs)/history')}>
              <Text style={[styles.link, { color: colors.brandPrimary }]}>View all</Text>
            </Pressable>
          ) : null
        }
      />
      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}>
        {recents.length === 0 ? (
          <View
            testID="home-recent-empty"
            style={[styles.emptyCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
          >
            <Clock size={20} color={colors.onSurfaceSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>No recent documents</Text>
              <Text style={[styles.emptyDesc, { color: colors.onSurfaceSecondary }]}>
                Your scanned & processed files appear here.
              </Text>
            </View>
            <Pressable
              testID="home-empty-scan"
              onPress={() => router.push('/scanner')}
              style={[styles.emptyBtn, { backgroundColor: colors.brandPrimary }]}
            >
              <Text style={{ color: colors.onBrandPrimary, fontWeight: '600', fontSize: 13 }}>Scan</Text>
            </Pressable>
          </View>
        ) : (
          recents.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              onFavoriteToggle={() => toggleFav(f.id)}
              onPress={() => router.push('/(tabs)/history')}
            />
          ))
        )}
      </View>

      <AdBannerPlaceholder testID="home-ad-banner" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  greeting: { fontSize: typography.sizes.base },
  brand: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    letterSpacing: -1,
    marginTop: 2,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    height: 180,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'flex-end',
  },
  heroContent: { padding: spacing.lg, gap: spacing.sm },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.4, lineHeight: 28 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  heroCtaText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  gridItem: { width: '100%' },
  link: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  emptyDesc: { fontSize: typography.sizes.sm, marginTop: 2 },
  emptyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
});
