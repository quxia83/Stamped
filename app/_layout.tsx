import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useDatabase } from "@/hooks/useDatabase";
import { useThemeStore } from "@/stores/useThemeStore";
import { colors } from "@/lib/constants";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const accentColor = useThemeStore((s) => s.accentColor);
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { isReady: dbReady, error: dbError } = useDatabase();

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded && dbReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady]);

  if (dbError) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Database error: {dbError.message}</Text>
      </View>
    );
  }

  if (!fontsLoaded || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: accentColor,
      background: colors.background,
    },
  };

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerBackTitleVisible: false, headerTintColor: accentColor }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Stamped" }} />
      </Stack>
    </ThemeProvider>
  );
}
