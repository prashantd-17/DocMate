# DocMate — Government Document Toolkit (Expo Mobile App)

## Product
A premium, **fully offline**, no-account-required mobile app that helps users prepare documents for government portals (Passport, Aadhaar, PAN, Driving License, Scholarships, Bank KYC, Govt Jobs, Visa, etc.). Designed for students, job seekers, working professionals and senior citizens.

## Architecture
- **Framework:** Expo SDK 54 + Expo Router (file-based)
- **Language:** TypeScript
- **State:** React Context + useReducer + AsyncStorage persistence (in `src/store/useAppStore.tsx`)
- **Storage:** AsyncStorage (key-value); files saved to `FileSystem.documentDirectory/docmate/`
- **No backend, no API calls, no auth.** Everything runs on-device.

## Tech Choices
| Need | Library |
|------|---------|
| Routing | expo-router |
| Image manipulation | expo-image-manipulator |
| Image picking / camera | expo-image-picker |
| PDF generation | expo-print (HTML → PDF) |
| File system | expo-file-system (legacy) |
| Share | expo-sharing |
| Icons | lucide-react-native@0.475.0 |
| Safe area | react-native-safe-area-context |
| Glass tab bar | expo-blur |
| Image | expo-image |

## Navigation
- 5-tab bottom navigation: **Home · Tools · Government · History · Settings**
- Stack overlays: `scanner`, `compressor`, `signature`, `photo-resizer`, `pdf-tools`, `preset/[id]`

## Features Implemented
- **Home:** greeting, hero card (offline · private), search, horizontal quick actions, government services grid, recent files, ad placeholder
- **Smart Document Scanner:** camera + gallery capture, multi-page, rotate/delete, filter chips (Original/Grayscale/B&W/HD), export as PDF or JPG to history
- **Image Compressor:** target presets 10/20/50/100/200/500 KB + custom, binary-search quality, before/after size + dimension stats
- **Signature Tool:** crop via image picker editor, government-style presets (PAN, bank, etc.), resize + compress
- **Photo Resizer:** preset chips (Passport, Aadhaar, PAN, DL, Visa, exams), unit selector (px/in/cm), custom width/height
- **PDF Tools:** Image → PDF fully functional (multi-image picker, reorder, remove, generate PDF). Other PDF modes show a graceful "coming up" card with fallback CTA.
- **Government Presets:** 8 ready-made presets with dimensions, max size, formats and description. One-tap "Prepare my document" applies resize + target compression.
- **History:** filter chips (All / Favorites / PDFs / Images / Signatures), search, sort (newest/oldest), favorite, delete, share
- **Favorites:** pin/unpin tools from Tools tab; appears at top
- **Settings:** Auto / Light / Dark theme segmented control, storage info, clear all, language placeholder, privacy, about
- **Ad placeholders:** bottom of Home, Tools, History and Settings (Google AdMob ready)
- **Theme system:** Sage green + monochrome from design_guidelines.json, light + dark, auto-follows system

## Persistence Schema (`docmate-store-v1` in AsyncStorage)
```ts
{
  files: DocFile[];          // documents user has produced
  favoriteTools: string[];   // pinned tool IDs
  themeMode: 'system' | 'light' | 'dark';
}
```

## Permissions
- `expo-image-picker` requests Camera + Media Library at the moment of use (contextual)

## Known Limitations (non-blocking)
- True B&W / Grayscale filter is approximated via JPEG re-encode (expo-image-manipulator has no built-in grayscale matrix). The pipeline is in place; can be upgraded with `react-native-image-filter-kit` in a native build.
- PDF tools other than "Image → PDF" show a placeholder card pointing back to the working flow (PDF reading/splitting is not in scope for offline Expo Go preview).
