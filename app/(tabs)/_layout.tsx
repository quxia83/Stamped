import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { color: theme.colors.text },
        headerTintColor: theme.colors.accent,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.map"),
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/search")}
              hitSlop={8}
              style={{ marginRight: 16, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
              accessibilityLabel="Search"
              accessibilityRole="button"
            >
              <FontAwesome name="search" size={20} color={theme.colors.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: t("tabs.visits"),
          headerTitle: () => null,
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/visit/new")}
              style={{ marginLeft: 16, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
              hitSlop={8}
              accessibilityLabel="Add visit"
              accessibilityRole="button"
            >
              <FontAwesome name="plus" size={20} color={theme.colors.accent} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/search")}
              style={{ marginRight: 16, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
              hitSlop={8}
              accessibilityLabel="Search"
              accessibilityRole="button"
            >
              <FontAwesome name="search" size={20} color={theme.colors.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("tabs.stats"),
          headerTitle: () => null,
          tabBarIcon: ({ color }) => <TabBarIcon name="signal" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
          headerTitle: () => null,
          tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
        }}
      />
      {/* Hidden screens — keep tab bar visible */}
      <Tabs.Screen name="place/[id]" options={{ href: null, title: t("screens.place") }} />
      <Tabs.Screen name="visit/[id]" options={{ href: null, title: t("screens.visit") }} />
      <Tabs.Screen name="visit/new" options={{ href: null, title: t("screens.newVisit") }} />
      <Tabs.Screen name="search" options={{ href: null, title: t("screens.search") }} />
    </Tabs>
  );
}
