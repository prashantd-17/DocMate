import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import Chip from '@/src/components/Chip';
import ResultActionsRow from '@/src/components/ResultActionsRow';
import { useToast } from '@/src/components/Toast';
import { useAppStore } from '@/src/store/useAppStore';
import { uid, formatBytes } from '@/src/utils/format';
import { resizeToDimensions, copyToDocuments } from '@/src/utils/image';
import { GOV_PRESETS } from '@/src/data/presets';

type Unit = 'px' | 'in' | 'cm';

export default function PhotoResizerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addFile = useAppStore((s) => s.addFile);
  const toast = useToast();

  const [uri, setUri] = useState<string | null>(null);
  const [width, setWidth] = useState('413');
  const [height, setHeight] = useState('531');
  const [unit, setUnit] = useState<Unit>('px');
  const [result, setResult] = useState<{ uri: string; size: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const toPx = (v: number) => {
    if (unit === 'px') return v;
    if (unit === 'in') return Math.round(v * 96);
    return Math.round((v / 2.54) * 96); // cm → in → px
  };

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!r.canceled) {
      setUri(r.assets[0].uri);
      setResult(null);
    }
  };

  const applyPreset = (p: typeof GOV_PRESETS[number]) => {
    if (!p.dimensionsPx) return;
    setUnit('px');
    setWidth(String(p.dimensionsPx.width));
    setHeight(String(p.dimensionsPx.height));
  };

  const resize = async () => {
    if (!uri) return;
    setBusy(true);
    try {
      const w = toPx(parseInt(width, 10));
      const h = toPx(parseInt(height, 10));
      const r = await resizeToDimensions(uri, w, h);
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
      name: `Resized ${result.w}x${result.h}.jpg`,
      type: 'jpg',
      uri: dest,
      thumbnailUri: dest,
      sizeBytes: result.size,
      createdAt: Date.now(),
      meta: { width: result.w, height: result.h },
    });
    toast.show('Saved to history');
    router.push('/(tabs)/history');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="photo-resizer-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="photo-resizer-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Photo Resizer</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 220, gap: spacing.lg }}>
        <Pressable
          onPress={pick}
          testID="photo-resizer-pick"
          style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
        >
          {uri ? (
            <Image source={{ uri: result?.uri ?? uri }} style={styles.previewImg} contentFit="contain" />
          ) : (
            <>
              <ImagePlus size={32} color={colors.onSurfaceSecondary} strokeWidth={1.4} />
              <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Pick a photo</Text>
              <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>Then pick a preset or enter dimensions.</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.section, { color: colors.onSurface }]}>Quick presets</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          {GOV_PRESETS.filter((p) => p.dimensionsPx).map((p) => (
            <Chip
              key={p.id}
              testID={`resizer-preset-${p.id}`}
              label={p.name}
              onPress={() => applyPreset(p)}
            />
          ))}
        </ScrollView>

        <Text style={[styles.section, { color: colors.onSurface }]}>Custom dimensions</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(['px', 'in', 'cm'] as Unit[]).map((u) => (
            <Chip key={u} testID={`resizer-unit-${u}`} label={u.toUpperCase()} selected={unit === u} onPress={() => setUnit(u)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Width</Text>
            <TextInput
              testID="resizer-width-input"
              value={width}
              onChangeText={setWidth}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.border, color: colors.onSurface, backgroundColor: colors.surfaceSecondary }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.onSurfaceSecondary }]}>Height</Text>
            <TextInput
              testID="resizer-height-input"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              style={[styles.input, { borderColor: colors.border, color: colors.onSurface, backgroundColor: colors.surfaceSecondary }]}
            />
          </View>
        </View>

        {result && (
          <View style={[styles.resultRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={{ color: colors.onSurface, fontWeight: '600' }}>{result.w}×{result.h} px</Text>
            <Text style={{ color: colors.brandPrimary, fontWeight: '700' }}>{formatBytes(result.size)}</Text>
          </View>
        )}

        {result && <ResultActionsRow uri={result.uri} fileType="jpg" />}
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
              label={result ? 'Resize again' : 'Resize'}
              onPress={resize}
              loading={busy}
              disabled={!uri}
              testID="resizer-go-btn"
            />
          </View>
          {result && (
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Save" variant="secondary" onPress={save} testID="resizer-save-btn" />
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
  preview: {
    height: 220, borderRadius: radius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 6,
  },
  previewImg: { width: '100%', height: '100%' },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base },
  section: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  label: { fontSize: typography.sizes.sm, marginBottom: 6 },
  input: {
    height: 48, borderRadius: radius.md, borderWidth: 1,
    paddingHorizontal: spacing.md, fontSize: typography.sizes.lg,
  },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1,
  },
  cta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
