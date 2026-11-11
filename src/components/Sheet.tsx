import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useApp } from "../features/AppProvider";
import { AppText, Button, IconButton, styles } from "./ui";
import { colors } from "../theme/tokens";
export function Sheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { error, clearError } = useApp();
  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#000B",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ maxHeight: "95%" }}
        >
          <View
            accessibilityViewIsModal
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              gap: 16,
              maxHeight: "100%",
              maxWidth: 760,
              width: "100%",
              alignSelf: "center",
            }}
          >
            <View style={[styles.row, { justifyContent: "space-between" }]}>
              <AppText variant="heading" style={{ flex: 1 }}>
                {title}
              </AppText>
              <IconButton
                label="Fechar"
                icon="close-outline"
                onPress={onClose}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 16, paddingBottom: 36 }}
            >
              {error && (
                <View accessibilityLiveRegion="assertive" style={{ gap: 8 }}>
                  <AppText tone="accent">{error}</AppText>
                  <Button title="Entendi" secondary onPress={clearError} />
                </View>
              )}
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
