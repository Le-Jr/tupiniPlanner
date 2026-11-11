import React from "react";
import { View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../features/AppProvider";
import { AppText, Icon } from "./ui";
import { colors as c, radius, shadow } from "../theme/tokens";

/** Non-blocking confirmation banner; announced to screen readers. */
export function Toast() {
  const { toast, animate } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const color =
    toast.tone === "reward"
      ? c.accent
      : toast.tone === "info"
        ? c.muted
        : c.primary;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: insets.top + 8,
        left: 16,
        right: 16,
        alignItems: "center",
      }}
    >
      <Animated.View
        key={toast.id}
        entering={animate ? FadeInUp.springify().damping(16) : undefined}
        exiting={animate ? FadeOutUp.duration(180) : undefined}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          maxWidth: 440,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: radius.pill,
          backgroundColor: c.surfaceRaised,
          borderWidth: 1,
          borderColor: `${color}66`,
          ...shadow.card,
        }}
      >
        <Icon
          name={
            toast.tone === "reward"
              ? "flash"
              : toast.tone === "info"
                ? "information-circle"
                : "checkmark-circle"
          }
          color={color}
          size={18}
        />
        <AppText variant="label" style={{ flexShrink: 1 }}>
          {toast.text}
        </AppText>
      </Animated.View>
    </View>
  );
}
