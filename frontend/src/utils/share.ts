import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import { DocFile } from '@/src/types';

const mimeFor = (file: Pick<DocFile, 'type'>) =>
  file.type === 'pdf' ? 'application/pdf' : 'image/jpeg';

const dialogTitleFor = (file: Pick<DocFile, 'type' | 'name'>) =>
  file.type === 'pdf' ? 'Share PDF' : 'Share image';

export async function shareFile(file: { uri: string; name?: string; type: DocFile['type'] }) {
  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, reason: 'Sharing not available on this device' as const };
  }
  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: mimeFor(file),
      dialogTitle: dialogTitleFor(file),
      UTI: file.type === 'pdf' ? 'com.adobe.pdf' : 'public.jpeg',
    });
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false, reason: String(e?.message ?? e) };
  }
}

/**
 * Saves an image (or PDF on Android via MediaLibrary asset) to the device gallery / Downloads.
 * On iOS PDFs aren't saveable to Photos — falls back to Share so the user can save to Files.
 */
export async function saveToGallery(file: { uri: string; type: DocFile['type'] }) {
  if (file.type === 'pdf' && Platform.OS === 'ios') {
    const r = await shareFile(file);
    return { ok: r.ok, fellBackToShare: true as const };
  }
  try {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      return { ok: false as const, reason: 'Gallery permission denied' };
    }
    await MediaLibrary.saveToLibraryAsync(file.uri);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, reason: String(e?.message ?? e) };
  }
}
