import React, { useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, ArrowDownAZ, ArrowUpAZ } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import ScreenHeader from '@/src/components/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import Chip from '@/src/components/Chip';
import FileCard from '@/src/components/FileCard';
import EmptyState from '@/src/components/EmptyState';
import AdBannerPlaceholder from '@/src/components/AdBannerPlaceholder';
import FileActionSheet from '@/src/components/FileActionSheet';
import { useAppStore } from '@/src/store/useAppStore';
import { DocFile } from '@/src/types';

const FILTERS: { id: 'all' | DocFile['type'] | 'favorites'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'pdf', label: 'PDFs' },
  { id: 'jpg', label: 'Images' },
  { id: 'signature', label: 'Signatures' },
];

export default function HistoryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const files = useAppStore((s) => s.files);
  const toggleFav = useAppStore((s) => s.toggleFavoriteFile);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<typeof FILTERS[number]['id']>('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [activeFile, setActiveFile] = useState<DocFile | null>(null);

  const list = useMemo(() => {
    let r = files;
    if (filter === 'favorites') r = r.filter((f) => f.favorite);
    else if (filter !== 'all') r = r.filter((f) => f.type === filter);
    const q = query.trim().toLowerCase();
    if (q) r = r.filter((f) => f.name.toLowerCase().includes(q));
    r = [...r].sort((a, b) => (sortDesc ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
    return r;
  }, [files, query, filter, sortDesc]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="history-screen">
      <ScreenHeader
        title="History"
        subtitle={`${files.length} document${files.length === 1 ? '' : 's'} on device`}
        right={
          <Pressable
            testID="history-sort-toggle"
            onPress={() => setSortDesc((v) => !v)}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceSecondary }]}
            hitSlop={8}
          >
            {sortDesc ? (
              <ArrowDownAZ size={18} color={colors.onSurface} />
            ) : (
              <ArrowUpAZ size={18} color={colors.onSurface} />
            )}
          </Pressable>
        }
      />

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.md }}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search history" testID="history-search" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            testID={`history-filter-${f.id}`}
            label={f.label}
            selected={filter === f.id}
            onPress={() => setFilter(f.id)}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 140, gap: spacing.sm }}
        showsVerticalScrollIndicator={false}
      >
        {list.length === 0 ? (
          <EmptyState
            testID="history-empty"
            title="Your history is empty"
            description="Documents you scan, compress or convert will be stored here on your device."
            ctaLabel="Scan first document"
            onCta={() => router.push('/scanner')}
            icon={<Clock size={32} color={colors.onBrandTertiary} strokeWidth={1.6} />}
          />
        ) : (
          list.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              onPress={() => setActiveFile(f)}
              onFavoriteToggle={() => toggleFav(f.id)}
              onMenu={() => setActiveFile(f)}
            />
          ))
        )}
        {list.length > 0 && (
          <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]}>
            Tap the menu icon to remove a file from device.
          </Text>
        )}
      </ScrollView>

      <AdBannerPlaceholder testID="history-ad-banner" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
