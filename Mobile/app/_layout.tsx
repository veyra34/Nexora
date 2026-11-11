import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../store/useAuthStore';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const router = useRouter();
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();

    const subscription = Linking.addEventListener('url', (event) => {
      if (
        event.url &&
        (event.url.includes('auth-callback') ||
          event.url.includes('access_token') ||
          event.url.includes('error='))
      ) {
        router.push('/auth-callback');
      }
    });

    return () => subscription.remove();
  }, [initialize, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.dark.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="problem/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="recommendations/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="bookmarks/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
