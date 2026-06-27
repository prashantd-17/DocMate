import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Star, MoreVertical, FileText, Image as ImageIcon, PenTool } from 'lucide-react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';
import { DocFile } from '@/src/types';
import { formatBytes, formatDate } from '@/src/utils/format';

type Props = {
  file: DocFile;
  onPress?: () => void;
  onFavoriteToggle?: () => void;
  onMenu?: () => void;
  testID?: string;
};

function TypeIcon({ type, color }: { type: DocFile['type']; color: string }) {
  if (type === 'pdf') return <FileText size={20} color={color} />;
  if (type === 'signature') return <PenTool size={20} color={color} />;
  return <ImageIcon size={20} color={color} />;
}

export default function FileCard({ file, onPress, onFavoriteToggle, onMenu, testID }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID ?? `file-card-${file.id}`}
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
      <View style={[styles.thumb, { backgroundColor: colors.surfaceSecondary }]}>
        {file.thumbnailUri ? (
          <Image source={{ uri: file.thumbnailUri }} style={styles.thumbImg} contentFit="cover" />
        ) : (
          <TypeIcon type={file.type} color={colors.onSurfaceSecondary} />
        )}
      </View>
      <View style={styles.center}>
        <Text style={[styles.name, { color: colors.onSurface }]} numberOfLines={1}>
          {file.name}
        </Text>
        <Text style={[styles.meta, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
          {formatDate(file.createdAt)}  ·  {formatBytes(file.sizeBytes)}
        </Text>
        <View style={[styles.badge, { backgroundColor: colors.brandTertiary }]}>
          <Text style={[styles.badgeText, { color: colors.onBrandTertiary }]}>
            {file.type.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          testID={`file-card-fav-${file.id}`}
          onPress={onFavoriteToggle}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Star
            size={18}
            color={file.favorite ? colors.brandPrimary : colors.onSurfaceTertiary}
            fill={file.favorite ? colors.brandPrimary : 'transparent'}
          />
        </Pressable>
        <Pressable
          testID={`file-card-menu-${file.id}`}
          onPress={onMenu}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <MoreVertical size={18} color={colors.onSurfaceSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  center: { flex: 1, gap: 2 },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium },
  meta: { fontSize: typography.sizes.sm },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  badgeText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: spacing.sm },
});
