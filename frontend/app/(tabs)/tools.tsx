import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera, Image as ImageIcon, PenTool, FileText, FileDown,
  Scissors, Merge, Split, RotateCw, Layers, Star,
} from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, typography } from '@/src/theme';
import ScreenHeader from '@/src/components/ScreenHeader';
import ListRow from '@/src/components/ListRow';
import SectionHeader from '@/src/components/SectionHeader';
import AdBannerPlaceholder from '@/src/components/AdBannerPlaceholder';
import { useAppStore } from '@/src/store/useAppStore';

type Tool = {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  route: string;
};

const IMAGE_TOOLS: Tool[] = [
  { id: 'scanner', label: 'Document Scanner', subtitle: 'Capture & crop documents', icon: Camera, route: '/scanner' },
  { id: 'compressor', label: 'Image Compressor', subtitle: 'Compress to 10–500 KB targets', icon: ImageIcon, route: '/compressor' },
  { id: 'photo-resizer', label: 'Photo Resizer', subtitle: 'Resize by px, inch, cm', icon: Scissors, route: '/photo-resizer' },
  { id: 'signature', label: 'Signature Tool', subtitle: 'Crop, clean, transparent bg', icon: PenTool, route: '/signature' },
];

const PDF_TOOLS: Tool[] = [
  { id: 'image-to-pdf', label: 'Image → PDF', subtitle: 'Combine images into a PDF', icon: FileText, route: '/pdf-tools?mode=image-to-pdf' },
  { id: 'merge-pdf', label: 'Merge PDF', subtitle: 'Combine multiple PDFs', icon: Merge, route: '/pdf-tools?mode=merge' },
  { id: 'split-pdf', label: 'Split PDF', subtitle: 'Extract or split pages', icon: Split, route: '/pdf-tools?mode=split' },
  { id: 'rotate-pdf', label: 'Rotate PDF', subtitle: 'Rotate pages 90°/180°', icon: RotateCw, route: '/pdf-tools?mode=rotate' },
  { id: 'compress-pdf', label: 'Compress PDF', subtitle: 'Shrink large PDFs', icon: FileDown, route: '/pdf-tools?mode=compress' },
  { id: 'reorder-pdf', label: 'Reorder Pages', subtitle: 'Drag to rearrange', icon: Layers, route: '/pdf-tools?mode=reorder' },
];

export default function ToolsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const favorites = useAppStore((s) => s.favoriteTools);
  const toggleFav = useAppStore((s) => s.toggleFavoriteTool);

  const allTools = [...IMAGE_TOOLS, ...PDF_TOOLS];
  const favTools = allTools.filter((t) => favorites.includes(t.id));

  const renderTool = (t: Tool) => {
    const Icon = t.icon;
    const isFav = favorites.includes(t.id);
    return (
      <ListRow
        key={t.id}
        testID={`tool-row-${t.id}`}
        title={t.label}
        subtitle={t.subtitle}
        icon={<Icon size={20} color={colors.onBrandTertiary} strokeWidth={1.8} />}
        onPress={() => router.push(t.route as any)}
        trailing={
          <Star
            size={18}
            color={isFav ? colors.brandPrimary : colors.onSurfaceTertiary}
            fill={isFav ? colors.brandPrimary : 'transparent'}
            onPress={() => toggleFav(t.id)}
          />
        }
      />
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="tools-screen">
      <ScreenHeader title="Tools" subtitle="Everything you need, on device" />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {favTools.length > 0 && (
          <>
            <SectionHeader title="Favorites" />
            <View style={{ gap: spacing.xs }}>{favTools.map(renderTool)}</View>
          </>
        )}

        <SectionHeader title="Image tools" />
        <View style={{ gap: spacing.xs }}>{IMAGE_TOOLS.map(renderTool)}</View>

        <SectionHeader title="PDF tools" />
        <View style={{ gap: spacing.xs }}>{PDF_TOOLS.map(renderTool)}</View>

        <Text style={[styles.hint, { color: colors.onSurfaceTertiary }]}>
          Tap the star to pin a tool to your favorites.
        </Text>
      </ScrollView>
      <AdBannerPlaceholder testID="tools-ad-banner" />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
