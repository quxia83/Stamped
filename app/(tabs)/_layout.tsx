import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { colors } from "@/lib/constants";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
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
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
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
          title: "Visits",
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerLeft: () => (
            <Pressable
              onPress={() => router.push("/visit/new")}
              style={{ marginLeft: 16 }}
              hitSlop={8}
            >
              <FontAwesome name="plus" size={20} color={colors.accent} />
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
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="bar-chart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
