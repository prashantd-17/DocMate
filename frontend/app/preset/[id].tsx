import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, CheckCircle2, ImagePlus, Sparkles } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import { useAppStore } from '@/src/store/useAppStore';
import { uid, formatBytes } from '@/src/utils/format';
import { resizeToDimensions, compressToTarget, copyToDocuments } from '@/src/utils/image';
import { getPresetById } from '@/src/data/presets';

export default function PresetDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const preset = getPresetById(id ?? '');
  const addFile = useAppStore((s) => s.addFile);

  const [uri, setUri] = useState<string | null>(null);
  const [result, setResult] = useState<{ uri: string; size: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!preset) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, padding: spacing.xl }}>
        <Text style={{ color: colors.onSurface }}>Preset not found</Text>
      </View>
    );
  }

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: preset.dimensionsPx ? [preset.dimensionsPx.width, preset.dimensionsPx.height] : undefined,
      quality: 1,
    });
    if (!r.canceled) {
      setUri(r.assets[0].uri);
      setResult(null);
    }
  };

  const prepare = async () => {
    if (!uri || !preset.dimensionsPx) return;
    setBusy(true);
    try {
      const resized = await resizeToDimensions(uri, preset.dimensionsPx.width, preset.dimensionsPx.height);
      const compressed = await compressToTarget(resized.uri, preset.maxSizeKB);
      setResult({
        uri: compressed.uri,
        size: compressed.sizeBytes,
        w: preset.dimensionsPx.width,
        h: preset.dimensionsPx.height,
      });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!result) return;
    const dest = await copyToDocuments(result.uri, 'jpg');
    addFile({
      id: uid(),
      name: `${preset.name} ${new Date().toLocaleTimeString()}.jpg`,
      type: 'jpg',
      uri: dest,
      thumbnailUri: dest,
      sizeBytes: result.size,
      createdAt: Date.now(),
      meta: { width: result.w, height: result.h, presetId: preset.id },
    });
    router.push('/(tabs)/history');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID={`preset-detail-${preset.id}`}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="preset-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>{preset.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 200, gap: spacing.lg }}>
        <View style={[styles.specs, { backgroundColor: colors.brandTertiary, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
            <Sparkles size={14} color={colors.brandPrimary} />
            <Text style={{ color: colors.brandPrimary, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 }}>
              REQUIREMENTS
            </Text>
          </View>
          <Text style={{ color: colors.onSurface, fontSize: 22, fontWeight: '700', letterSpacing: -0.4 }}>
            {preset.dimensionsPx ? `${preset.dimensionsPx.width} × ${preset.dimensionsPx.height} px` : 'Custom'}
          </Text>
          <Text style={{ color: colors.onSurfaceSecondary, fontSize: 14, marginTop: 4 }}>
            Max {preset.maxSizeKB} KB · {preset.formats.join(' / ')}
          </Text>
          <Text style={{ color: colors.onSurfaceSecondary, fontSize: 13, marginTop: spacing.md, lineHeight: 19 }}>
            {preset.description}
          </Text>
        </View>

        <Pressable
          onPress={pick}
          testID="preset-pick"
          style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
        >
          {uri ? (
            <Image source={{ uri: result?.uri ?? uri }} style={styles.previewImg} contentFit="contain" />
          ) : (
            <>
              <ImagePlus size={32} color={colors.onSurfaceSecondary} strokeWidth={1.4} />
              <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Pick photo to prepare</Text>
              <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>
                We&apos;ll resize & compress it to fit {preset.name} requirements.
              </Text>
            </>
          )}
        </Pressable>

        {result && (
          <View style={[styles.successRow, { backgroundColor: colors.brandTertiary, borderColor: colors.border }]}>
            <CheckCircle2 size={20} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.onSurface, fontWeight: '700' }}>Ready to upload</Text>
              <Text style={{ color: colors.onSurfaceSecondary, fontSize: 12 }}>
                {result.w}×{result.h} px · {formatBytes(result.size)}
              </Text>
            </View>
          </View>
        )}
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
          <View style={{ flex: 1.5 }}>
            <PrimaryButton
              label={result ? 'Re-prepare document' : 'Prepare my document'}
              onPress={prepare}
              loading={busy}
              disabled={!uri}
              testID="preset-prepare-btn"
            />
          </View>
          {result && (
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Save" variant="secondary" onPress={save} testID="preset-save-btn" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  specs: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  preview: {
    height: 220, borderRadius: radius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 6,
  },
  previewImg: { width: '100%', height: '100%' },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base, textAlign: 'center', maxWidth: 260 },
  successRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1,
  },
  cta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
