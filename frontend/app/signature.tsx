import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, PenTool } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import Chip from '@/src/components/Chip';
import ResultActionsRow from '@/src/components/ResultActionsRow';
import { useToast } from '@/src/components/Toast';
import { useAppStore } from '@/src/store/useAppStore';
import { uid, formatBytes } from '@/src/utils/format';
import { resizeToDimensions, compressToTarget, copyToDocuments, fileSize } from '@/src/utils/image';

const SIG_PRESETS = [
  { id: 's-small', label: '6×3 cm · 20 KB', w: 200, h: 100, kb: 20 },
  { id: 's-med', label: '6×3 cm · 50 KB', w: 300, h: 150, kb: 50 },
  { id: 's-pan', label: 'PAN · 2×4.5 cm', w: 200, h: 90, kb: 30 },
  { id: 's-bank', label: 'Bank · 140×60', w: 280, h: 120, kb: 30 },
];

export default function SignatureScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addFile = useAppStore((s) => s.addFile);
  const toast = useToast();

  const [uri, setUri] = useState<string | null>(null);
  const [presetId, setPresetId] = useState(SIG_PRESETS[1].id);
  const [result, setResult] = useState<{ uri: string; size: number; w: number; h: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const preset = SIG_PRESETS.find((p) => p.id === presetId)!;

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 1],
      quality: 1,
    });
    if (!r.canceled) {
      setUri(r.assets[0].uri);
      setResult(null);
    }
  };

  const prepare = async () => {
    if (!uri) return;
    setBusy(true);
    try {
      const resized = await resizeToDimensions(uri, preset.w, preset.h);
      const compressed = await compressToTarget(resized.uri, preset.kb);
      setResult({ uri: compressed.uri, size: compressed.sizeBytes, w: preset.w, h: preset.h });
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!result) return;
    const dest = await copyToDocuments(result.uri, 'jpg');
    addFile({
      id: uid(),
      name: `Signature ${new Date().toLocaleTimeString()}.jpg`,
      type: 'signature',
      uri: dest,
      thumbnailUri: dest,
      sizeBytes: result.size,
      createdAt: Date.now(),
      meta: { width: result.w, height: result.h },
    });
    toast.show('Signature saved');
    router.push('/(tabs)/history');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="signature-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="signature-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Signature Tool</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 200, gap: spacing.lg }}>
        <Pressable
          onPress={pick}
          testID="signature-pick"
          style={[styles.preview, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
        >
          {uri ? (
            <Image source={{ uri: result?.uri ?? uri }} style={styles.previewImg} contentFit="contain" />
          ) : (
            <>
              <PenTool size={32} color={colors.onSurfaceSecondary} strokeWidth={1.4} />
              <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Pick a signature image</Text>
              <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>
                Crop tightly around your signature for best results.
              </Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.section, { color: colors.onSurface }]}>Preset</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {SIG_PRESETS.map((p) => (
            <Chip
              key={p.id}
              testID={`signature-preset-${p.id}`}
              label={p.label}
              selected={presetId === p.id}
              onPress={() => setPresetId(p.id)}
            />
          ))}
        </View>

        {result && (
          <View style={[styles.resultRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={{ color: colors.onSurface, fontWeight: '600' }}>{result.w}×{result.h} px</Text>
            <Text style={{ color: colors.brandPrimary, fontWeight: '700' }}>{formatBytes(result.size)}</Text>
          </View>
        )}

        {result && <ResultActionsRow uri={result.uri} fileType="signature" />}
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
              label={result ? 'Re-prepare' : 'Prepare signature'}
              onPress={prepare}
              loading={busy}
              disabled={!uri}
              testID="signature-prepare-btn"
            />
          </View>
          {result && (
            <View style={{ flex: 1 }}>
              <PrimaryButton label="Save" variant="secondary" onPress={save} testID="signature-save-btn" />
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
    height: 200, borderRadius: radius.lg, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', gap: 6,
  },
  previewImg: { width: '100%', height: '100%' },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base, textAlign: 'center', maxWidth: 260 },
  section: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  resultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1,
  },
  cta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
