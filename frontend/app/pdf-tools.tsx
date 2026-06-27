import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ImagePlus, Trash2, FilePlus2 } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import { useToast } from '@/src/components/Toast';
import { useAppStore } from '@/src/store/useAppStore';
import { uid } from '@/src/utils/format';
import { imagesToPdf } from '@/src/utils/pdf';

export default function PdfToolsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const addFile = useAppStore((s) => s.addFile);
  const toast = useToast();

  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const headerTitle = (() => {
    switch (mode) {
      case 'merge': return 'Merge PDF';
      case 'split': return 'Split PDF';
      case 'rotate': return 'Rotate PDF';
      case 'compress': return 'Compress PDF';
      case 'reorder': return 'Reorder Pages';
      default: return 'Image → PDF';
    }
  })();

  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.92,
    });
    if (!r.canceled) {
      setImages((prev) => [...prev, ...r.assets.map((a) => a.uri)]);
    }
  };

  const removeAt = (i: number) => setImages((p) => p.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    setImages((p) => {
      const arr = [...p];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return p;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  const exportPdf = async () => {
    if (images.length === 0) return;
    setBusy(true);
    try {
      const { uri, sizeBytes } = await imagesToPdf(images);
      addFile({
        id: uid(),
        name: `Document ${new Date().toLocaleString()}.pdf`,
        type: 'pdf',
        uri,
        thumbnailUri: images[0],
        sizeBytes,
        createdAt: Date.now(),
        meta: { pages: images.length },
      });
      toast.show('PDF saved to history');
      router.push('/(tabs)/history');
    } finally {
      setBusy(false);
    }
  };

  const placeholder = mode && mode !== 'image-to-pdf';

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="pdf-tools-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="pdf-tools-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>{headerTitle}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 200, gap: spacing.lg }}>
        {placeholder ? (
          <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <Text style={[styles.placeholderTitle, { color: colors.onSurface }]}>Coming up next</Text>
            <Text style={[styles.placeholderDesc, { color: colors.onSurfaceSecondary }]}>
              {headerTitle} works locally on selected PDFs. Try{' '}
              <Text style={{ color: colors.brandPrimary, fontWeight: '700' }}>Image → PDF</Text> for now — it&apos;s fully working.
            </Text>
            <PrimaryButton
              label="Try Image → PDF"
              onPress={() => router.replace('/pdf-tools?mode=image-to-pdf')}
              testID="pdf-tools-fallback-btn"
            />
          </View>
        ) : (
          <>
            <Pressable
              onPress={pick}
              testID="pdf-tools-add"
              style={[styles.addCard, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}
            >
              <ImagePlus size={28} color={colors.onSurfaceSecondary} strokeWidth={1.6} />
              <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Add images</Text>
              <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>
                Multi-select supported. They&apos;ll be combined in the order you choose.
              </Text>
            </Pressable>

            {images.length > 0 && (
              <>
                <Text style={[styles.section, { color: colors.onSurface }]}>{images.length} image{images.length === 1 ? '' : 's'}</Text>
                <View style={{ gap: spacing.sm }}>
                  {images.map((u, i) => (
                    <View
                      key={i}
                      style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    >
                      <View style={[styles.thumb, { backgroundColor: colors.surfaceSecondary }]}>
                        <Image source={{ uri: u }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.onSurface, fontWeight: '600' }}>Page {i + 1}</Text>
                      </View>
                      <Pressable onPress={() => move(i, -1)} testID={`pdf-up-${i}`} style={styles.iconBtn}>
                        <Text style={{ color: colors.onSurfaceSecondary, fontSize: 18 }}>↑</Text>
                      </Pressable>
                      <Pressable onPress={() => move(i, 1)} testID={`pdf-down-${i}`} style={styles.iconBtn}>
                        <Text style={{ color: colors.onSurfaceSecondary, fontSize: 18 }}>↓</Text>
                      </Pressable>
                      <Pressable onPress={() => removeAt(i)} testID={`pdf-remove-${i}`} style={styles.iconBtn}>
                        <Trash2 size={18} color={colors.error} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      {!placeholder && (
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
          <PrimaryButton
            label={busy ? 'Building PDF…' : 'Export as PDF'}
            onPress={exportPdf}
            loading={busy}
            disabled={images.length === 0}
            testID="pdf-tools-export"
            icon={<FilePlus2 size={18} color={colors.onBrandPrimary} />}
          />
        </View>
      )}
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
  addCard: {
    height: 200, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg,
  },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base, textAlign: 'center', maxWidth: 280 },
  section: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1,
  },
  thumb: { width: 48, height: 48, borderRadius: radius.sm, overflow: 'hidden' },
  iconBtn: { padding: spacing.sm },
  placeholder: {
    padding: spacing.xl, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, alignItems: 'flex-start',
  },
  placeholderTitle: { fontSize: typography.sizes.xl, fontWeight: '700' },
  placeholderDesc: { fontSize: typography.sizes.base, lineHeight: 20 },
  cta: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    padding: spacing.xl, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
