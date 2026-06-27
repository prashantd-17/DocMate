import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Building2 } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import ScreenHeader from '@/src/components/ScreenHeader';
import GovPresetCard from '@/src/components/GovPresetCard';
import SearchBar from '@/src/components/SearchBar';
import Chip from '@/src/components/Chip';
import { GOV_PRESETS } from '@/src/data/presets';

const HERO_IMG = 'https://images.pexels.com/photos/5793964/pexels-photo-5793964.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'identity', label: 'Identity' },
  { id: 'travel', label: 'Travel' },
  { id: 'finance', label: 'Finance' },
  { id: 'employment', label: 'Employment' },
  { id: 'education', label: 'Education' },
];

export default function GovernmentScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = GOV_PRESETS.filter((p) => {
    const matchCat = cat === 'all' || p.category === cat;
    const matchQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="government-screen">
      <ScreenHeader title="Government" subtitle="Ready-made document presets" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[2]}
      >
        {/* Hero */}
        <View style={[styles.hero, { borderColor: colors.border }]}>
          <Image source={{ uri: HERO_IMG }} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>One-tap document prep</Text>
            <Text style={styles.heroSubtitle}>
              Aadhaar, PAN, Passport, Visa & more — sized & compressed automatically.
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search presets"
            testID="government-search"
          />
        </View>

        {/* Sticky chips */}
        <View style={{ backgroundColor: colors.surface }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {CATEGORIES.map((c) => (
              <Chip
                key={c.id}
                testID={`gov-chip-${c.id}`}
                label={c.label}
                selected={cat === c.id}
                onPress={() => setCat(c.id)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Cards */}
        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md, paddingTop: spacing.sm }}>
          {filtered.map((p) => (
            <GovPresetCard
              key={p.id}
              preset={p}
              icon={<Building2 size={20} color={colors.onBrandTertiary} />}
              onPress={() => router.push(`/preset/${p.id}` as any)}
            />
          ))}
          {filtered.length === 0 && (
            <Text style={[styles.empty, { color: colors.onSurfaceSecondary }]}>
              No presets match this filter.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: spacing.xl,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'flex-end',
  },
  heroContent: { padding: spacing.lg, gap: 4 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  chipRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  empty: { textAlign: 'center', marginTop: spacing.xl, fontSize: typography.sizes.base },
});
