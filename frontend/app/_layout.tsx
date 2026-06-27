import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { useTheme } from '@/src/theme/useTheme';
import { StoreProvider } from '@/src/store/useAppStore';
import { ToastProvider } from '@/src/components/Toast';

LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync();

function ThemedShell({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {children}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StoreProvider>
          <ToastProvider>
            <ThemedShell>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  contentStyle: { backgroundColor: 'transparent' },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="scanner" options={{ presentation: 'card' }} />
                <Stack.Screen name="compressor" options={{ presentation: 'card' }} />
                <Stack.Screen name="signature" options={{ presentation: 'card' }} />
                <Stack.Screen name="photo-resizer" options={{ presentation: 'card' }} />
                <Stack.Screen name="pdf-tools" options={{ presentation: 'card' }} />
                <Stack.Screen name="preset/[id]" options={{ presentation: 'card' }} />
              </Stack>
            </ThemedShell>
          </ToastProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
