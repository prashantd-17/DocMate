import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Share2, Download } from 'lucide-react-native';
import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';
import { shareFile, saveToGallery } from '@/src/utils/share';
import { useToast } from './Toast';
import { DocFile } from '@/src/types';

type Props = {
  uri: string | null;
  fileType: DocFile['type'];
  filename?: string;
};

export default function ResultActionsRow({ uri, fileType, filename }: Props) {
  const { colors } = useTheme();
  const toast = useToast();

  if (!uri) return null;

  const onShare = async () => {
    const r = await shareFile({ uri, type: fileType, name: filename });
    if (!r.ok && r.reason) toast.show(r.reason, 'error');
  };

  const onSaveGallery = async () => {
    const r = await saveToGallery({ uri, type: fileType });
    if (r.ok) toast.show(r.fellBackToShare ? 'Opened share to save' : 'Saved to gallery');
    else if (r.reason) toast.show(r.reason, 'error');
  };

  return (
    <View style={styles.row}>
      <Pressable
        testID="result-share-btn"
        onPress={onShare}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Share2 size={16} color={colors.onSurface} />
        <Text style={[styles.text, { color: colors.onSurface }]}>Share</Text>
      </Pressable>
      <Pressable
        testID="result-save-gallery-btn"
        onPress={onSaveGallery}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: colors.surfaceSecondary, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Download size={16} color={colors.onSurface} />
        <Text style={[styles.text, { color: colors.onSurface }]}>Save to gallery</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});
