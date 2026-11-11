import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "../../src/components/ui";
import { useApp } from "../../src/features/AppProvider";
import { colors, fonts } from "../../src/theme/tokens";
export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { haptic } = useApp();
  const entries: {
    name: string;
    title: string;
    icon: IconName;
    active: IconName;
  }[] = [
    { name: "index", title: "Hoje", icon: "today-outline", active: "today" },
    {
      name: "missions",
      title: "Missões",
      icon: "checkbox-outline",
      active: "checkbox",
    },
    {
      name: "evolution",
      title: "Evolução",
      icon: "stats-chart-outline",
      active: "stats-chart",
    },
    {
      name: "guitar",
      title: "Guitarra",
      icon: "musical-notes-outline",
      active: "musical-notes",
    },
    {
      name: "profile",
      title: "Perfil",
      icon: "person-outline",
      active: "person",
    },
  ];
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic("select") }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 66 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {entries.map((e) => (
        <Tabs.Screen
          key={e.name}
          name={e.name}
          options={{
            title: e.title,
            tabBarIcon: ({ color, focused }) => (
              <View
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: focused
                    ? `${colors.primary}1F`
                    : "transparent",
                }}
              >
                <Icon
                  name={focused ? e.active : e.icon}
                  color={color}
                  size={21}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
