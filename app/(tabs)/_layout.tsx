import React from "react";
import { Tabs } from "expo-router";
import { Icon, type IconName } from "../../src/components/ui";
import { colors } from "../../src/theme/tokens";
export default function TabLayout() {
  const entries: { name: string; title: string; icon: IconName }[] = [
    { name: "index", title: "Hoje", icon: "grid-outline" },
    { name: "missions", title: "Missões", icon: "checkbox-outline" },
    { name: "evolution", title: "Evolução", icon: "stats-chart-outline" },
    { name: "guitar", title: "Guitarra", icon: "musical-notes-outline" },
    { name: "profile", title: "Perfil", icon: "person-outline" },
  ];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.line,
          paddingTop: 8,
          minHeight: 72,
        },
        tabBarLabelStyle: { fontFamily: "Inter", fontSize: 10 },
        tabBarHideOnKeyboard: true,
      }}
    >
      {entries.map((e) => (
        <Tabs.Screen
          key={e.name}
          name={e.name}
          options={{
            title: e.title,
            tabBarIcon: ({ color }) => (
              <Icon name={e.icon} color={color} size={22} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
