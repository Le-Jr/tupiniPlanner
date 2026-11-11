import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextProps,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Svg, { Circle, Path } from "react-native-svg";
import { colors as c, fonts } from "../theme/tokens";
import { useApp } from "../features/AppProvider";
export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export const Icon = ({
  name,
  color = c.primary,
  size = 22,
}: {
  name: IconName;
  color?: string;
  size?: number;
}) => <Ionicons name={name} color={color} size={size} accessible={false} />;
export function AppText({
  tone = "normal",
  variant = "body",
  style,
  ...props
}: TextProps & {
  tone?: "normal" | "muted" | "green" | "accent";
  variant?: "body" | "title" | "heading" | "micro" | "big";
}) {
  return (
    <Text
      {...props}
      style={[
        {
          color: {
            normal: c.ivory,
            muted: c.muted,
            green: c.primary,
            accent: c.accent,
          }[tone],
          fontFamily:
            variant === "micro"
              ? fonts.mono
              : ["title", "heading", "big"].includes(variant)
                ? fonts.bold
                : fonts.body,
          fontSize: { body: 14, title: 30, heading: 19, micro: 11, big: 42 }[
            variant
          ],
          lineHeight: { body: 22, title: 38, heading: 27, micro: 18, big: 50 }[
            variant
          ],
        },
        style,
      ]}
    />
  );
}
export function AppCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Screen({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{
        flex: 1,
        backgroundColor:
          state.settings[0]?.theme === "midnight" ? "#080F0C" : c.background,
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.screen}
        >
          {children}
          <AppText
            variant="micro"
            tone="muted"
            style={{ textAlign: "center", marginTop: 20 }}
          >
            Signed by Leandro Junior
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Brand() {
  return (
    <View style={styles.row}>
      <View style={styles.logo}>
        <AppText variant="heading" tone="green">
          {">"}_
        </AppText>
        <Svg width={18} height={24} viewBox="0 0 24 28">
          <Path
            d="M12 25V12M12 17C1 17 2 4 2 4S14 4 12 17M12 11C12 2 22 2 22 2S24 12 12 11"
            stroke={c.primary}
            strokeWidth={2}
            fill="none"
          />
        </Svg>
      </View>
      <View>
        <AppText style={{ fontFamily: fonts.bold, letterSpacing: 1 }}>
          TUPINI<AppText tone="green">PLANNER</AppText>
        </AppText>
        <AppText variant="micro" tone="muted">
          TRAIN. EAT. PRACTICE. EVOLVE.
        </AppText>
      </View>
    </View>
  );
}
export function Button({
  title,
  onPress,
  secondary,
  danger,
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary
            ? "transparent"
            : danger
              ? c.danger
              : c.primary,
          borderColor: danger ? c.danger : secondary ? c.line : c.primary,
          opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
        },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          color={secondary ? c.ivory : c.background}
          size={18}
        />
      )}
      <AppText
        style={{
          color: secondary ? (danger ? c.danger : c.ivory) : c.background,
          fontFamily: fonts.bold,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {title}
      </AppText>
    </Pressable>
  );
}
export function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.iconButton}
    >
      <Icon name={icon} />
    </Pressable>
  );
}
export function SectionHeader({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  return (
    <View
      style={[styles.row, { justifyContent: "space-between", marginTop: 10 }]}
    >
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <AppText variant="micro" tone="green">
            {eyebrow}
          </AppText>
        )}
        <AppText variant="heading">{title}</AppText>
      </View>
      {action}
    </View>
  );
}
export function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <AppCard>
      <Icon name="leaf-outline" />
      <AppText variant="heading">{title}</AppText>
      <AppText tone="muted">{detail}</AppText>
      {action}
    </AppCard>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <AppText tone="muted">{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#829C8F"
        selectionColor={c.primary}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 92, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Toggle({
  label,
  value,
  onChange,
  detail,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detail?: string;
}) {
  return (
    <View
      style={[styles.row, { justifyContent: "space-between", minHeight: 48 }]}
    >
      <View style={{ flex: 1 }}>
        <AppText>{label}</AppText>
        {detail && (
          <AppText variant="micro" tone="muted">
            {detail}
          </AppText>
        )}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.line, true: c.secondary }}
        thumbColor={c.ivory}
      />
    </View>
  );
}
export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: c.forest, borderColor: c.primary },
      ]}
    >
      <AppText tone={selected ? "green" : "muted"}>{label}</AppText>
    </Pressable>
  );
}
export function ProgressRing({ done, total }: { done: number; total: number }) {
  const radius = 52,
    length = 2 * Math.PI * radius;
  return (
    <View
      accessible
      accessibilityLabel={`${done} de ${total} missões concluídas`}
      style={{
        width: 132,
        height: 132,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={132} height={132} style={StyleSheet.absoluteFill}>
        <Circle
          cx={66}
          cy={66}
          r={radius}
          stroke={c.line}
          strokeWidth={7}
          fill="none"
        />
        <Circle
          cx={66}
          cy={66}
          r={radius}
          stroke={c.primary}
          strokeWidth={7}
          strokeDasharray={`${length} ${length}`}
          strokeDashoffset={length * (1 - (total ? done / total : 0))}
          rotation={-90}
          origin="66,66"
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      <AppText variant="title">
        {done}
        <AppText tone="muted">/{total}</AppText>
      </AppText>
      <AppText variant="micro" tone="muted">
        MISSÕES
      </AppText>
    </View>
  );
}
export function RetroBadge({
  title,
  unlocked,
}: {
  title: string;
  unlocked: boolean;
}) {
  return (
    <View style={[styles.row, { opacity: unlocked ? 1 : 0.6 }]}>
      <Icon
        name={unlocked ? "ribbon-outline" : "lock-closed-outline"}
        color={unlocked ? c.accent : c.muted}
      />
      <AppText>{title}</AppText>
      <AppText variant="micro" tone="muted">
        {unlocked ? "LIBERADO" : "EM BREVE"}
      </AppText>
    </View>
  );
}
export function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: c.background,
        gap: 20,
      }}
    >
      <Brand />
      <ActivityIndicator color={c.primary} />
      <AppText tone="muted">Preparando seu próximo passo…</AppText>
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: {
    padding: 20,
    gap: 18,
    paddingBottom: 36,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  card: {
    padding: 18,
    gap: 12,
    backgroundColor: c.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.line,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  logo: { flexDirection: "row", alignItems: "center", gap: 3 },
  button: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.line,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 13,
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.line,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 10,
    backgroundColor: c.background,
    color: c.ivory,
    padding: 12,
    fontSize: 16,
    fontFamily: fonts.body,
  },
});
