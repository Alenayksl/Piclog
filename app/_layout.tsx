import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { I18nProvider, useI18n } from "@/src/i18n/app-i18n";
import { PixelThemeProvider } from "@/src/theme/pixel-theme";

function AppStack() {
  const { t } = useI18n();

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="detail/[id]"
        options={{ title: t("detail.title"), headerShown: true }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <I18nProvider>
      <PixelThemeProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AppStack />
          <StatusBar style="auto" />
        </ThemeProvider>
      </PixelThemeProvider>
    </I18nProvider>
  );
}
