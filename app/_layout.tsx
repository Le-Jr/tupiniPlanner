import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono/400Regular";
import { AppProvider, useApp } from "../src/features/AppProvider";
import { AppText, Button, Loading } from "../src/components/ui";
import { ReactionModal } from "../src/components/ReactionModal";
import { Onboarding } from "../src/features/Onboarding";
import { colors } from "../src/theme/tokens";
export { ErrorBoundary } from "expo-router";
function Shell() {
  const { ready, state, error, clearError, retryInitialization } = useApp();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      {error ? (
        <View
          accessibilityLiveRegion="assertive"
          style={{
            backgroundColor: colors.forest,
            padding: 18,
            paddingTop: 38,
            gap: 10,
          }}
        >
          <AppText>{error}</AppText>
          <Button
            title={ready ? "Entendi" : "Tentar abrir novamente"}
            secondary
            onPress={ready ? clearError : retryInitialization}
          />
        </View>
      ) : null}
      {!ready ? (
        <Loading />
      ) : !state.profiles[0]?.onboardingCompleted ? (
        <Onboarding />
      ) : (
        <>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.ivory,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="movement" options={{ title: "Movimento" }} />
            <Stack.Screen name="food" options={{ title: "Alimentação" }} />
            <Stack.Screen
              name="motivation"
              options={{ title: "Motivation Center" }}
            />
          </Stack>
          <ReactionModal />
        </>
      )}
    </View>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterBold: Inter_700Bold,
    JetBrainsMono: JetBrainsMono_400Regular,
  });
  if (!loaded && !error)
    return (
      <SafeAreaProvider>
        <Loading />
      </SafeAreaProvider>
    );
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
