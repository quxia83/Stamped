import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ActivityIndicator, View, Text } from "react-native";
import { useDatabase } from "@/hooks/useDatabase";
import { colors } from "@/lib/constants";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
  },
};

export default function RootLayout() {
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

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerBackTitleVisible: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="visit/new" options={{ title: "New Visit" }} />
        <Stack.Screen name="visit/[id]" options={{ title: "Visit" }} />
        <Stack.Screen name="place/[id]" options={{ title: "Place" }} />
        <Stack.Screen name="search" options={{ title: "Search" }} />
      </Stack>
    </ThemeProvider>
  );
}
