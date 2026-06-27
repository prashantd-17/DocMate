import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Camera, Image as ImageIcon, FilePlus2, Trash2, RotateCw, FileText } from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { spacing, radius, typography } from '@/src/theme';
import PrimaryButton from '@/src/components/PrimaryButton';
import Chip from '@/src/components/Chip';
import { useToast } from '@/src/components/Toast';
import { useAppStore } from '@/src/store/useAppStore';
import { uid } from '@/src/utils/format';
import { applyFilter, rotateImage, copyToDocuments, fileSize } from '@/src/utils/image';
import { imagesToPdf } from '@/src/utils/pdf';

type Filter = 'original' | 'gray' | 'bw' | 'hd';

export default function ScannerScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addFile = useAppStore((s) => s.addFile);
  const toast = useToast();

  const [pages, setPages] = useState<{ uri: string; w: number; h: number }[]>([]);
  const [filter, setFilter] = useState<Filter>('original');
  const [busy, setBusy] = useState(false);

  const capture = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.92,
    });
    if (!r.canceled) {
      const a = r.assets[0];
      setPages((p) => [...p, { uri: a.uri, w: a.width ?? 0, h: a.height ?? 0 }]);
    }
  }, []);

  const fromGallery = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.92,
    });
    if (!r.canceled) {
      const a = r.assets[0];
      setPages((p) => [...p, { uri: a.uri, w: a.width ?? 0, h: a.height ?? 0 }]);
    }
  }, []);

  const removePage = (i: number) => setPages((p) => p.filter((_, idx) => idx !== i));
  const rotatePage = async (i: number) => {
    const p = pages[i];
    const r = await rotateImage(p.uri, 90);
    setPages((arr) => arr.map((x, idx) => (idx === i ? { uri: r.uri, w: r.width, h: r.height } : x)));
  };

  const saveAsPdf = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      const processed: string[] = [];
      for (const p of pages) {
        const r = await applyFilter(p.uri, filter);
        processed.push(r.uri);
      }
      const { uri, sizeBytes } = await imagesToPdf(processed);
      addFile({
        id: uid(),
        name: `Scan ${new Date().toLocaleString()}.pdf`,
        type: 'pdf',
        uri,
        thumbnailUri: pages[0]?.uri,
        sizeBytes,
        createdAt: Date.now(),
        meta: { pages: pages.length },
      });
      toast.show('PDF saved to history');
      router.push('/(tabs)/history');
    } finally {
      setBusy(false);
    }
  };

  const saveAsJpg = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      for (const p of pages) {
        const r = await applyFilter(p.uri, filter);
        const dest = await copyToDocuments(r.uri, 'jpg');
        const size = await fileSize(dest);
        addFile({
          id: uid(),
          name: `Scan ${new Date().toLocaleString()}.jpg`,
          type: 'scan',
          uri: dest,
          thumbnailUri: dest,
          sizeBytes: size,
          createdAt: Date.now(),
        });
      }
      toast.show(`${pages.length} page${pages.length === 1 ? '' : 's'} saved`);
      router.push('/(tabs)/history');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }} testID="scanner-screen">
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, borderColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} testID="scanner-back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={[styles.title, { color: colors.onSurface }]}>Smart Scanner</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 200, gap: spacing.lg }}>
        {pages.length === 0 ? (
          <View style={[styles.bigDrop, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
            <FileText size={32} color={colors.onSurfaceSecondary} strokeWidth={1.4} />
            <Text style={[styles.dropTitle, { color: colors.onSurface }]}>Add your first page</Text>
            <Text style={[styles.dropDesc, { color: colors.onSurfaceSecondary }]}>
              Use the camera or pick from your gallery. Pages auto-crop and can be exported as PDF or JPG.
            </Text>
          </View>
        ) : (
          <View style={{ gap: spacing.md }}>
            <Text style={[styles.section, { color: colors.onSurface }]}>{pages.length} page{pages.length === 1 ? '' : 's'}</Text>
            <View style={styles.thumbs}>
              {pages.map((p, i) => (
                <View key={i} style={[styles.thumbWrap, { borderColor: colors.border }]}>
                  <Image source={{ uri: p.uri }} style={styles.thumbImg} contentFit="cover" />
                  <View style={styles.thumbActions}>
                    <Pressable onPress={() => rotatePage(i)} testID={`scanner-rotate-${i}`} style={styles.thumbBtn}>
                      <RotateCw size={14} color="#fff" />
                    </Pressable>
                    <Pressable onPress={() => removePage(i)} testID={`scanner-delete-${i}`} style={styles.thumbBtn}>
                      <Trash2 size={14} color="#fff" />
                    </Pressable>
                  </View>
                  <View style={[styles.pageNum, { backgroundColor: colors.brandPrimary }]}>
                    <Text style={{ color: colors.onBrandPrimary, fontSize: 11, fontWeight: '700' }}>{i + 1}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View>
          <Text style={[styles.section, { color: colors.onSurface, marginBottom: spacing.sm }]}>Filter</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {(['original', 'gray', 'bw', 'hd'] as Filter[]).map((f) => (
              <Chip
                key={f}
                testID={`scanner-filter-${f}`}
                label={f === 'bw' ? 'B&W' : f === 'hd' ? 'HD' : f === 'gray' ? 'Grayscale' : 'Original'}
                selected={filter === f}
                onPress={() => setFilter(f)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Camera"
              variant="secondary"
              onPress={capture}
              testID="scanner-camera-btn"
              icon={<Camera size={18} color={colors.onBrandSecondary} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Gallery"
              variant="secondary"
              onPress={fromGallery}
              testID="scanner-gallery-btn"
              icon={<ImageIcon size={18} color={colors.onBrandSecondary} />}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA */}
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
              label="Save as JPG"
              variant="secondary"
              onPress={saveAsJpg}
              disabled={pages.length === 0 || busy}
              testID="scanner-save-jpg"
            />
          </View>
          <View style={{ flex: 1.4 }}>
            <PrimaryButton
              label={busy ? 'Saving…' : 'Save as PDF'}
              onPress={saveAsPdf}
              loading={busy}
              disabled={pages.length === 0}
              testID="scanner-save-pdf"
              icon={<FilePlus2 size={18} color={colors.onBrandPrimary} />}
            />
          </View>
        </View>
      </View>
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
  section: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  bigDrop: {
    height: 220,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  dropTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  dropDesc: { fontSize: typography.sizes.base, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  thumbWrap: {
    width: '31%',
    aspectRatio: 0.75,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  thumbActions: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 4,
  },
  thumbBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNum: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cta: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    padding: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
