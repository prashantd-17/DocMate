import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DocFile, ThemeMode } from '@/src/types';

type State = {
  files: DocFile[];
  favoriteTools: string[]; // tool ids like 'scanner', 'compressor', ...
  themeMode: ThemeMode;
  hasOnboarded: boolean;

  addFile: (file: DocFile) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  toggleFavoriteFile: (id: string) => void;
  clearAllFiles: () => void;

  toggleFavoriteTool: (toolId: string) => void;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useAppStore = create<State>()(
  persist(
    (set) => ({
      files: [],
      favoriteTools: ['scanner', 'compressor'],
      themeMode: 'system',
      hasOnboarded: false,

      addFile: (file) =>
        set((s) => ({ files: [file, ...s.files] })),

      deleteFile: (id) =>
        set((s) => ({ files: s.files.filter((f) => f.id !== id) })),

      renameFile: (id, name) =>
        set((s) => ({
          files: s.files.map((f) => (f.id === id ? { ...f, name } : f)),
        })),

      toggleFavoriteFile: (id) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, favorite: !f.favorite } : f
          ),
        })),

      clearAllFiles: () => set({ files: [] }),

      toggleFavoriteTool: (toolId) =>
        set((s) => ({
          favoriteTools: s.favoriteTools.includes(toolId)
            ? s.favoriteTools.filter((t) => t !== toolId)
            : [...s.favoriteTools, toolId],
        })),

      setThemeMode: (mode) => set({ themeMode: mode }),
    }),
    {
      name: 'docmate-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
