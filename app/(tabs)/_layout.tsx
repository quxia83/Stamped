import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { colors } from "@/lib/constants";
import { useThemeStore } from "@/stores/useThemeStore";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
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
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
          headerRight: () => (
            <Pressable
              onPress={() => router.navigate("/search")}
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
          title: "Visits",
          tabBarIcon: ({ color }) => <TabBarIcon name="bookmark" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={() => router.navigate("/visit/new")}
              style={{ marginLeft: 16 }}
              hitSlop={8}
            >
              <FontAwesome name="plus" size={20} color={accentColor} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => router.navigate("/search")}
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
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="signal" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="sliders" color={color} />,
        }}
      />
    </Tabs>
  );
}
