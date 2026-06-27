import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import { imageToBase64, fileSize } from './image';

export async function imagesToPdf(imageUris: string[]): Promise<{ uri: string; sizeBytes: number }> {
  const pages: string[] = [];
  for (const uri of imageUris) {
    const b64 = await imageToBase64(uri);
    pages.push(`
      <div style="page-break-after: always; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 0;">
        <img src="data:image/jpeg;base64,${b64}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
      </div>
    `);
  }
  const html = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:#fff;}</style></head>
      <body>${pages.join('')}</body>
    </html>
  `;
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  // Move to documents
  const dir = FileSystem.documentDirectory + 'docmate/';
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {});
  const dest = `${dir}${Date.now()}.pdf`;
  await FileSystem.moveAsync({ from: uri, to: dest });
  return { uri: dest, sizeBytes: await fileSize(dest) };
}
