import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export async function fileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    // @ts-ignore
    return info.size ?? 0;
  } catch {
    return 0;
  }
}

export type ManipResult = {
  uri: string;
  width: number;
  height: number;
  sizeBytes: number;
};

/**
 * Compress image to fit under targetKB by binary-searching quality.
 */
export async function compressToTarget(
  uri: string,
  targetKB: number,
  maxWidth?: number
): Promise<ManipResult> {
  const targetBytes = targetKB * 1024;
  let lo = 5;
  let hi = 100;
  let bestUri = uri;
  let bestW = 0;
  let bestH = 0;
  let bestSize = Number.MAX_SAFE_INTEGER;

  // First, optionally resize to constrain dimension
  let workingUri = uri;
  let baseDims: { width: number; height: number } | undefined;
  if (maxWidth) {
    const r = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );
    workingUri = r.uri;
    baseDims = { width: r.width, height: r.height };
  }

  // Binary search over quality
  for (let iter = 0; iter < 8; iter++) {
    const q = (lo + hi) / 2 / 100;
    const r = await ImageManipulator.manipulateAsync(workingUri, [], {
      compress: q,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    const size = await fileSize(r.uri);
    if (size <= targetBytes) {
      if (Math.abs(size - targetBytes) < Math.abs(bestSize - targetBytes) || bestSize > targetBytes) {
        bestUri = r.uri;
        bestW = r.width;
        bestH = r.height;
        bestSize = size;
      }
      lo = q * 100;
    } else {
      hi = q * 100;
    }
    if (hi - lo < 3) break;
  }

  if (bestSize === Number.MAX_SAFE_INTEGER) {
    // Could not get under target — return lowest-q result
    const r = await ImageManipulator.manipulateAsync(workingUri, [], {
      compress: 0.05,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return {
      uri: r.uri,
      width: r.width,
      height: r.height,
      sizeBytes: await fileSize(r.uri),
    };
  }

  return { uri: bestUri, width: bestW || baseDims?.width || 0, height: bestH || baseDims?.height || 0, sizeBytes: bestSize };
}

export async function resizeToDimensions(
  uri: string,
  width: number,
  height: number
): Promise<ManipResult> {
  const r = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width, height } }],
    { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
  );
  return { uri: r.uri, width: r.width, height: r.height, sizeBytes: await fileSize(r.uri) };
}

export async function applyFilter(
  uri: string,
  filter: 'original' | 'bw' | 'gray' | 'hd'
): Promise<ManipResult> {
  // expo-image-manipulator doesn't support B&W natively;
  // for filter == 'gray'/'bw' we keep dimensions and apply quality + flag for UI.
  // True grayscale will be applied via brightness/contrast post-processing once supported.
  const r = await ImageManipulator.manipulateAsync(uri, [], {
    compress: filter === 'hd' ? 0.98 : 0.9,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return { uri: r.uri, width: r.width, height: r.height, sizeBytes: await fileSize(r.uri) };
}

export async function rotateImage(uri: string, deg: number): Promise<ManipResult> {
  const r = await ImageManipulator.manipulateAsync(uri, [{ rotate: deg }], {
    compress: 0.95,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return { uri: r.uri, width: r.width, height: r.height, sizeBytes: await fileSize(r.uri) };
}

export async function cropImage(
  uri: string,
  rect: { originX: number; originY: number; width: number; height: number }
): Promise<ManipResult> {
  const r = await ImageManipulator.manipulateAsync(uri, [{ crop: rect }], {
    compress: 0.95,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return { uri: r.uri, width: r.width, height: r.height, sizeBytes: await fileSize(r.uri) };
}

export async function imageToBase64(uri: string): Promise<string> {
  return await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export async function copyToDocuments(uri: string, ext: string): Promise<string> {
  const dir = FileSystem.documentDirectory + 'docmate/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  const dest = `${dir}${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}
