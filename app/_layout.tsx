import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    // Handle initial URL when app opens
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url: string) => {
    // Extract the actual video URL from the deep link
    // Format can be: sendit://add?url=https://instagram.com/...
    // Or just the direct URL: https://instagram.com/...

    const parsedUrl = Linking.parse(url);

    // If it's our custom scheme with URL parameter
    if (parsedUrl.queryParams?.url) {
      const videoUrl = parsedUrl.queryParams.url as string;
      // Navigate to home tab with the URL
      router.push({
        pathname: '/(tabs)',
        params: { sharedUrl: videoUrl },
      });
    }
    // If it's a direct social media URL
    else if (url.includes('instagram.com') || url.includes('tiktok.com') ||
             url.includes('youtube.com') || url.includes('youtu.be')) {
      router.push({
        pathname: '/(tabs)',
        params: { sharedUrl: url },
      });
    }
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="collection-detail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
