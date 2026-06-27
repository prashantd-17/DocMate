import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ImagePlus, ChevronRight } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import Chip from '@/src/components/Chip';
import { useAppStore } from '@/src/store/useAppStore';
import { uid, formatBytes } from '@/src/utils/format';
import { compressToTarget, fileSize, copyToDocuments } from '@/src/utils/image';

const PRESETS_KB = [10, 20, 50, 100, 200, 500];

export default function CompressorScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addFile = useAppStore((s) => s.addFile);

  const [uri, setUri] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState(0);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [targetKB, setTargetKB] = useState<number>(100);
  const [result, setResult] = useState<{ uri: string; size: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!r.canceled) {
      const a = r.assets[0];
      setUri(a.uri);
      setOrigSize((a.fileSize as number | undefined) ?? (await fileSize(a.uri)));
      setOrigDims({ w: a.width ?? 0, h: a.height ?? 0 });
      setResult(null);
    }
  };

  const compress = async () => {
    if (!uri) return;
    setBusy(true);
    try {
      const r = await compressToTarget(uri, targetKB);
      setResult({ uri: r.uri, size: r.sizeBytes, w: r.width, h: r.height });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!result) return;
    const dest = await copyToDocuments(result.uri, 'jpg');
    addFile({
      id: uid(),
      name: `Compressed ${new Date().toLocaleTimeString()}.jpg`,
      type: 'jpg',
      uri: dest,
      thumbnailUri: dest,
      sizeBytes: result.size,
      createdAt: Date.now(),
      meta: { width: result.w, height: result.h },
    });
    router.push('/(tabs)/history');
  };

  const ratio = origSize > 0 && result ? Math.max(0, Math.round((1 - result.size / origSize) * 100)) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="compressor-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="compressor-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Image Compressor</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 200, gap: spacing.lg }}>
        {/* Preview */}
        <Pressable
          onPress={pick}
          testID="compressor-pick"
          style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
        >
          {uri ? (
            <Image source={{ uri: result?.uri ?? uri }} style={styles.previewImg} contentFit="contain" />
          ) : (
            <>
              <ImagePlus size={32} color={colors.onSurfaceSecondary} strokeWidth={1.4} />
              <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Pick an image</Text>
              <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>
                JPG / PNG · stays on your device
              </Text>
            </>
          )}
        </Pressable>

        {uri && (
          <View style={[styles.stats, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Stat label="Original" value={formatBytes(origSize)} sub={origDims ? `${origDims.w}×${origDims.h}` : ''} colors={colors} />
            <ChevronRight size={16} color={colors.onSurfaceTertiary} />
            <Stat
              label="Compressed"
              value={result ? formatBytes(result.size) : '—'}
              sub={result ? `${result.w}×${result.h}` : 'Set target & compress'}
              colors={colors}
              accent
            />
            <View style={[styles.badge, { backgroundColor: colors.brandTertiary }]}>
              <Text style={[styles.badgeText, { color: colors.onBrandTertiary }]}>
                {result ? `-${ratio}%` : 'Ready'}
              </Text>
            </View>
          </View>
        )}

        <Text style={[styles.section, { color: colors.onSurface }]}>Target size</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {PRESETS_KB.map((k) => (
            <Chip
              key={k}
              testID={`compressor-target-${k}`}
              label={`${k} KB`}
              selected={targetKB === k}
              onPress={() => setTargetKB(k)}
            />
          ))}
        </ScrollView>
      </ScrollView>

      <View
        style={[
          styles.cta,
          {
            paddingBottom: insets.bottom + spacing.md,
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={result ? 'Re-compress' : `Compress to ${targetKB} KB`}
              onPress={compress}
              loading={busy}
              disabled={!uri || busy}
              testID="compressor-compress-btn"
            />
          </View>
          {result && (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Save"
                variant="secondary"
                onPress={save}
                testID="compressor-save-btn"
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function Stat({ label, value, sub, colors, accent }: any) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: colors.onSurfaceTertiary, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: accent ? colors.brandPrimary : colors.onSurface, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
        {value}
      </Text>
      {!!sub && <Text style={{ color: colors.onSurfaceSecondary, fontSize: 11, marginTop: 2 }}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  preview: {
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 6,
  },
  previewImg: { width: '100%', height: '100%' },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  badgeText: { fontSize: 11, fontWeight: '700' },
  section: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  cta: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
