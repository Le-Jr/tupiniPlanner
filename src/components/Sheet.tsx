import React, { useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../features/AppProvider";
import { AppText, Button, IconButton, styles } from "./ui";
import { colors, radius } from "../theme/tokens";
export function Sheet({
  visible,
  title,
  eyebrow,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { error, clearError, animate } = useApp();
  const insets = useSafeAreaInsets();
  const shown = useSharedValue(0);
  useEffect(() => {
    if (!visible) return;
    shown.value = 0;
    shown.value = animate
      ? withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) })
      : 1;
  }, [visible, animate, shown]);
  const backdrop = useAnimatedStyle(() => ({ opacity: shown.value }));
  const panel = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - shown.value) * 60 }],
    opacity: 0.4 + shown.value * 0.6,
  }));
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.overlay },
          backdrop,
        ]}
      >
        <Pressable
          accessibilityLabel="Fechar painel"
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
      </Animated.View>
      <View
        style={{ flex: 1, justifyContent: "flex-end" }}
        pointerEvents="box-none"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ maxHeight: "92%" }}
        >
          <Animated.View
            accessibilityViewIsModal
            style={[
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius.xl,
                borderTopRightRadius: radius.xl,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: colors.lineStrong,
                paddingHorizontal: 20,
                paddingTop: 10,
                gap: 14,
                maxHeight: "100%",
                maxWidth: 760,
                width: "100%",
                alignSelf: "center",
              },
              panel,
            ]}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.lineStrong,
              }}
            />
            <View
              style={[
                styles.row,
                { justifyContent: "space-between", flexWrap: "nowrap" },
              ]}
            >
              <View style={{ flex: 1 }}>
                {eyebrow && (
                  <AppText variant="micro" tone="green">
                    {eyebrow}
                  </AppText>
                )}
                <AppText variant="heading" accessibilityRole="header">
                  {title}
                </AppText>
              </View>
              <IconButton
                label="Fechar"
                icon="close"
                color={colors.muted}
                onPress={onClose}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                gap: 16,
                paddingBottom: insets.bottom + 28,
              }}
            >
              {error && (
                <View accessibilityLiveRegion="assertive" style={{ gap: 8 }}>
                  <AppText tone="accent">{error}</AppText>
                  <Button title="Entendi" secondary onPress={clearError} />
                </View>
              )}
              {children}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
