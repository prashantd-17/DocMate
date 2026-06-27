import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DocFile, ThemeMode } from '@/src/types';

type State = {
  files: DocFile[];
  favoriteTools: string[];
  themeMode: ThemeMode;
  _hydrated: boolean;
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<State> }
  | { type: 'ADD_FILE'; payload: DocFile }
  | { type: 'DELETE_FILE'; payload: string }
  | { type: 'RENAME_FILE'; payload: { id: string; name: string } }
  | { type: 'TOGGLE_FAV_FILE'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'TOGGLE_FAV_TOOL'; payload: string }
  | { type: 'SET_THEME'; payload: ThemeMode };

const STORAGE_KEY = 'docmate-store-v1';

const initial: State = {
  files: [],
  favoriteTools: ['scanner', 'compressor'],
  themeMode: 'system',
  _hydrated: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, _hydrated: true };
    case 'ADD_FILE':
      return { ...state, files: [action.payload, ...state.files] };
    case 'DELETE_FILE':
      return { ...state, files: state.files.filter((f) => f.id !== action.payload) };
    case 'RENAME_FILE':
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.id ? { ...f, name: action.payload.name } : f
        ),
      };
    case 'TOGGLE_FAV_FILE':
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload ? { ...f, favorite: !f.favorite } : f
        ),
      };
    case 'CLEAR_ALL':
      return { ...state, files: [] };
    case 'TOGGLE_FAV_TOOL':
      return {
        ...state,
        favoriteTools: state.favoriteTools.includes(action.payload)
          ? state.favoriteTools.filter((t) => t !== action.payload)
          : [...state.favoriteTools, action.payload],
      };
    case 'SET_THEME':
      return { ...state, themeMode: action.payload };
    default:
      return state;
  }
}

type Store = State & {
  addFile: (f: DocFile) => void;
  deleteFile: (id: string) => void;
  renameFile: (id: string, name: string) => void;
  toggleFavoriteFile: (id: string) => void;
  clearAllFiles: () => void;
  toggleFavoriteTool: (id: string) => void;
  setThemeMode: (m: ThemeMode) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const hydratedRef = useRef(false);

  // Hydrate from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          dispatch({ type: 'HYDRATE', payload: parsed });
        } else {
          dispatch({ type: 'HYDRATE', payload: {} });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: {} });
      } finally {
        hydratedRef.current = true;
      }
    })();
  }, []);

  // Persist on state change (after initial hydrate)
  useEffect(() => {
    if (!state._hydrated) return;
    const { _hydrated, ...persistable } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)).catch(() => {});
  }, [state]);

  const value: Store = {
    ...state,
    addFile: (f) => dispatch({ type: 'ADD_FILE', payload: f }),
    deleteFile: (id) => dispatch({ type: 'DELETE_FILE', payload: id }),
    renameFile: (id, name) => dispatch({ type: 'RENAME_FILE', payload: { id, name } }),
    toggleFavoriteFile: (id) => dispatch({ type: 'TOGGLE_FAV_FILE', payload: id }),
    clearAllFiles: () => dispatch({ type: 'CLEAR_ALL' }),
    toggleFavoriteTool: (id) => dispatch({ type: 'TOGGLE_FAV_TOOL', payload: id }),
    setThemeMode: (m) => dispatch({ type: 'SET_THEME', payload: m }),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore<T>(selector: (s: Store) => T): T {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useAppStore must be used within StoreProvider');
  return selector(ctx);
}
