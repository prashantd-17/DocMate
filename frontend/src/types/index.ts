export type FileType = 'pdf' | 'jpg' | 'png' | 'signature' | 'scan';

export type DocFile = {
  id: string;
  name: string;
  type: FileType;
  uri: string;
  thumbnailUri?: string;
  sizeBytes: number;
  createdAt: number;
  favorite?: boolean;
  meta?: {
    width?: number;
    height?: number;
    pages?: number;
    presetId?: string;
  };
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type GovPreset = {
  id: string;
  name: string;
  category: 'identity' | 'travel' | 'finance' | 'employment' | 'education';
  dimensionsPx?: { width: number; height: number };
  dimensionsMm?: { width: number; height: number };
  maxSizeKB: number;
  formats: ('JPG' | 'PNG' | 'PDF')[];
  description: string;
};
