import "@/lib/i18n";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider as NavThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useDatabase } from "@/hooks/useDatabase";
import { useTranslation } from "react-i18next";
import { ThemeProvider, useTheme } from "@/theme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = { initialRouteName: "(tabs)" };

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const theme = useTheme();
  const navTheme = theme.scheme === "dark" ? DarkTheme : DefaultTheme;
  const navThemeWithAccent = {
    ...navTheme,
    colors: {
      ...navTheme.colors,
      primary: theme.colors.accent,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };
  return (
    <NavThemeProvider value={navThemeWithAccent}>
      <Stack
        screenOptions={{
          headerTintColor: theme.colors.accent,
          headerStyle: { backgroundColor: theme.colors.surface },
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Stamped" }} />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  const { t } = useTranslation();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const { isReady: dbReady, error: dbError } = useDatabase();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady) SplashScreen.hideAsync();
  }, [fontsLoaded, dbReady]);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("error.databaseError", { message: dbError.message })}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
