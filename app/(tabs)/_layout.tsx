import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const router = useRouter();
  const accentColor = useThemeStore((s) => s.accentColor);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: accentColor,
        headerBackTitleVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.map"),
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/search")}
              style={{ marginRight: 16 }}
            >
              <FontAwesome name="search" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: t("tabs.visits"),
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/visit/new")}
              style={{ marginLeft: 16 }}
              hitSlop={8}
            >
              <FontAwesome name="plus" size={20} color={accentColor} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.push("/search")}
              style={{ marginRight: 16 }}
              hitSlop={8}
            >
              <FontAwesome name="search" size={20} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: t("tabs.stats"),
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="signal" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings"),
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
