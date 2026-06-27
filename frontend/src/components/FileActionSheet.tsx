import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Eye, Share2, Download, Pencil, Star, Trash2, AlertTriangle,
} from 'lucide-react-native';

import { useTheme } from '@/src/theme/useTheme';
import { radius, spacing, typography } from '@/src/theme';
import { DocFile } from '@/src/types';
import { useAppStore } from '@/src/store/useAppStore';
import { shareFile, saveToGallery } from '@/src/utils/share';
import { useToast } from './Toast';
import { formatBytes, formatDate } from '@/src/utils/format';

type Props = {
  file: DocFile | null;
  onClose: () => void;
};

export default function FileActionSheet({ file, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  const deleteFile = useAppStore((s) => s.deleteFile);
  const renameFile = useAppStore((s) => s.renameFile);
  const toggleFav = useAppStore((s) => s.toggleFavoriteFile);

  const [stage, setStage] = useState<'menu' | 'rename' | 'confirm-delete'>('menu');
  const [name, setName] = useState('');
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (file) {
      setStage('menu');
      setName(file.name);
      Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    } else {
      slide.setValue(0);
    }
  }, [file, slide]);

  if (!file) return null;

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [300, 0] });
  const opacity = slide;

  const close = () => {
    Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      onClose();
    });
  };

  const onShare = async () => {
    const r = await shareFile({ uri: file.uri, type: file.type, name: file.name });
    close();
    if (!r.ok && r.reason) toast.show(r.reason, 'error');
  };
  const onSave = async () => {
    const r = await saveToGallery({ uri: file.uri, type: file.type });
    close();
    if (r.ok) toast.show(r.fellBackToShare ? 'Opened share to save' : 'Saved to gallery');
    else if (r.reason) toast.show(r.reason, 'error');
  };
  const onFav = () => {
    toggleFav(file.id);
    close();
    toast.show(file.favorite ? 'Removed from favorites' : 'Added to favorites');
  };
  const onRenameConfirm = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== file.name) {
      renameFile(file.id, trimmed);
      toast.show('Renamed');
    }
    close();
  };
  const onDeleteConfirm = () => {
    deleteFile(file.id);
    close();
    toast.show('File deleted');
  };

  const Item = ({
    icon, label, testID, onPress, destructive,
  }: { icon: React.ReactNode; label: string; testID: string; onPress: () => void; destructive?: boolean }) => (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
      ]}
    >
      <View style={[styles.itemIcon, { backgroundColor: destructive ? '#FDECEC' : colors.brandTertiary }]}>
        {icon}
      </View>
      <Text style={[styles.itemLabel, { color: destructive ? colors.error : colors.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal transparent visible={!!file} animationType="none" onRequestClose={close}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable testID="action-sheet-backdrop" style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
      <Animated.View
        testID="file-action-sheet"
        style={[
          styles.sheet,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.lg,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {file.name}
          </Text>
          <Text style={[styles.headerSub, { color: colors.onSurfaceSecondary }]}>
            {file.type.toUpperCase()} · {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}
          </Text>
        </View>

        {stage === 'menu' && (
          <View style={{ paddingVertical: spacing.sm }}>
            <Item
              testID="action-share"
              icon={<Share2 size={18} color={colors.onBrandTertiary} />}
              label="Share"
              onPress={onShare}
            />
            <Item
              testID="action-save-gallery"
              icon={<Download size={18} color={colors.onBrandTertiary} />}
              label={file.type === 'pdf' ? 'Save / Export PDF' : 'Save to gallery'}
              onPress={onSave}
            />
            <Item
              testID="action-view"
              icon={<Eye size={18} color={colors.onBrandTertiary} />}
              label="Open / Preview"
              onPress={onShare}
            />
            <Item
              testID="action-favorite"
              icon={
                <Star
                  size={18}
                  color={colors.onBrandTertiary}
                  fill={file.favorite ? colors.brandPrimary : 'transparent'}
                />
              }
              label={file.favorite ? 'Remove from favorites' : 'Add to favorites'}
              onPress={onFav}
            />
            <Item
              testID="action-rename"
              icon={<Pencil size={18} color={colors.onBrandTertiary} />}
              label="Rename"
              onPress={() => setStage('rename')}
            />
            <Item
              testID="action-delete"
              icon={<Trash2 size={18} color={colors.error} />}
              label="Delete"
              destructive
              onPress={() => setStage('confirm-delete')}
            />
          </View>
        )}

        {stage === 'rename' && (
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <Text style={[styles.formLabel, { color: colors.onSurfaceSecondary }]}>New name</Text>
            <TextInput
              testID="rename-input"
              value={name}
              onChangeText={setName}
              autoFocus
              selectTextOnFocus
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.onSurface, backgroundColor: colors.surfaceSecondary },
              ]}
            />
            <View style={styles.actionRow}>
              <Pressable
                testID="rename-cancel"
                onPress={() => setStage('menu')}
                style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <Text style={[styles.actionText, { color: colors.onSurface }]}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="rename-save"
                onPress={onRenameConfirm}
                style={[styles.actionBtn, { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary }]}
              >
                <Text style={[styles.actionText, { color: colors.onBrandPrimary }]}>Rename</Text>
              </Pressable>
            </View>
          </View>
        )}

        {stage === 'confirm-delete' && (
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={[styles.warning, { backgroundColor: '#FDECEC' }]}>
              <AlertTriangle size={20} color={colors.error} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.warningTitle, { color: colors.error }]}>Delete this file?</Text>
                <Text style={[styles.warningDesc, { color: colors.onSurfaceSecondary }]}>
                  &ldquo;{file.name}&rdquo; will be permanently removed from your device. This cannot be undone.
                </Text>
              </View>
            </View>
            <View style={styles.actionRow}>
              <Pressable
                testID="delete-cancel"
                onPress={() => setStage('menu')}
                style={[styles.actionBtn, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
              >
                <Text style={[styles.actionText, { color: colors.onSurface }]}>Cancel</Text>
              </Pressable>
              <Pressable
                testID="delete-confirm"
                onPress={onDeleteConfirm}
                style={[styles.actionBtn, { backgroundColor: colors.error, borderColor: colors.error }]}
              >
                <Text style={[styles.actionText, { color: '#fff' }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: spacing.sm,
    opacity: 0.4,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  headerSub: { fontSize: typography.sizes.sm, marginTop: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: { fontSize: typography.sizes.lg, fontWeight: typography.weights.medium },
  formLabel: { fontSize: typography.sizes.sm },
  input: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.lg,
  },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold },
  warning: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  warningTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold },
  warningDesc: { fontSize: typography.sizes.sm, marginTop: 4, lineHeight: 18 },
});
