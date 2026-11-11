import React, { useEffect, useRef, useState } from "react";
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
  type PressableProps,
  type TextProps,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";
import { colors as c, fonts, radius, shadow, space } from "../theme/tokens";
import { useOptionalApp } from "../features/AppProvider";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
type Tone = "normal" | "muted" | "subtle" | "green" | "accent" | "danger";
const toneColor: Record<Tone, string> = {
  normal: c.ivory,
  muted: c.muted,
  subtle: c.subtle,
  green: c.primary,
  accent: c.accent,
  danger: c.danger,
};

/* ───────────────────────── motion helpers ───────────────────────── */

/** Whether decorative motion should run; safe outside the provider. */
export function useMotion() {
  return useOptionalApp()?.animate ?? false;
}

/** Tweens a number on the JS thread; instant when motion is off. */
export function useTween(target: number, duration = 700) {
  const animate = useMotion();
  const [value, setValue] = useState(animate ? 0 : target);
  const from = useRef(value);
  useEffect(() => {
    if (!animate) {
      from.current = target;
      setValue(target);
      return;
    }
    const start = Date.now();
    const origin = from.current;
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = origin + (target - origin) * eased;
      from.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, animate, duration]);
  return value;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Pressable with a springy press-in scale and optional haptic tick. */
export function PressableScale({
  children,
  style,
  haptic = true,
  scaleTo = 0.97,
  onPress,
  ...props
}: Omit<PressableProps, "style" | "children"> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  scaleTo?: number;
}) {
  const app = useOptionalApp();
  const animate = app?.animate ?? false;
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <AnimatedPressable
      {...props}
      style={[style, animated, !animate && pressed && { opacity: 0.75 }]}
      onPressIn={(e) => {
        setPressed(true);
        if (animate)
          scale.value = withSpring(scaleTo, { damping: 18, stiffness: 420 });
        props.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        if (animate)
          scale.value = withSpring(1, { damping: 14, stiffness: 320 });
        props.onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) app?.haptic("tap");
        onPress?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}

/* ───────────────────────── primitives ───────────────────────── */

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
  tone?: Tone;
  variant?:
    | "body"
    | "small"
    | "label"
    | "title"
    | "heading"
    | "micro"
    | "big"
    | "display";
}) {
  const type = {
    body: { f: fonts.body, s: 15, l: 23 },
    small: { f: fonts.body, s: 13, l: 19 },
    label: { f: fonts.medium, s: 14, l: 20 },
    heading: { f: fonts.bold, s: 19, l: 26 },
    title: { f: fonts.bold, s: 30, l: 37 },
    big: { f: fonts.bold, s: 42, l: 50 },
    display: { f: fonts.mono, s: 54, l: 62 },
    micro: { f: fonts.mono, s: 11, l: 16 },
  }[variant];
  return (
    <Text
      maxFontSizeMultiplier={
        variant === "display" || variant === "big" ? 1.3 : 2
      }
      {...props}
      style={[
        {
          color: toneColor[tone],
          fontFamily: type.f,
          fontSize: type.s,
          lineHeight: type.l,
          letterSpacing:
            variant === "micro"
              ? 1.2
              : variant === "title" || variant === "big"
                ? -0.6
                : 0,
        },
        style,
      ]}
    />
  );
}

/** Discreet 8-bit stair-step that marks TupiniPlanner cards. */
export function PixelCorners({ color = c.primary }: { color?: string }) {
  const px = (top: number, left: number, o = 0.55) => (
    <View
      style={{
        position: "absolute",
        top,
        left,
        width: 3,
        height: 3,
        backgroundColor: color,
        opacity: o,
      }}
    />
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {px(9, 9)}
      {px(9, 12, 0.3)}
      {px(12, 9, 0.3)}
      <View style={{ position: "absolute", bottom: 9, right: 9 }}>
        <View
          style={{ width: 3, height: 3, backgroundColor: color, opacity: 0.55 }}
        />
      </View>
    </View>
  );
}

export function AppCard({
  children,
  style,
  variant = "default",
  corners = false,
  accent,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "default" | "raised" | "hero" | "outline";
  corners?: boolean;
  /** Optional colour for a 3px stripe on the left edge. */
  accent?: string;
}) {
  const body = (
    <>
      {accent && (
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 14,
            bottom: 14,
            width: 3,
            borderRadius: 2,
            backgroundColor: accent,
          }}
        />
      )}
      {corners && <PixelCorners />}
      {children}
    </>
  );
  if (variant === "hero")
    return (
      <LinearGradient
        colors={["#12442F", c.surface, "#0A1F18"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.hero, style]}
      >
        {body}
      </LinearGradient>
    );
  return (
    <View
      style={[
        styles.card,
        variant === "raised" && {
          backgroundColor: c.surfaceRaised,
          ...shadow.card,
        },
        variant === "outline" && {
          backgroundColor: "transparent",
          borderStyle: "dashed",
          borderColor: c.lineStrong,
        },
        style,
      ]}
    >
      {body}
    </View>
  );
}

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const app = useOptionalApp();
  const animate = app?.animate ?? false;
  const midnight = app?.state.settings[0]?.theme === "midnight";
  const content = (
    <Animated.View
      entering={animate ? FadeInDown.duration(320) : undefined}
      style={{ gap: space.lg }}
    >
      {children}
      <View style={{ alignItems: "center", gap: 6, marginTop: space.xxl }}>
        <View style={{ flexDirection: "row", gap: 4 }}>
          {[0.5, 0.3, 0.15].map((o) => (
            <View
              key={o}
              style={{
                width: 4,
                height: 4,
                backgroundColor: c.primary,
                opacity: o,
              }}
            />
          ))}
        </View>
        <AppText variant="micro" tone="subtle">
          SIGNED BY LEANDRO JUNIOR
        </AppText>
      </View>
    </Animated.View>
  );
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{
        flex: 1,
        backgroundColor: midnight ? "#050C09" : c.background,
      }}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[midnight ? "#0B1F18" : "#0E3326", "transparent"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 320 }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.screen}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.screen}>{content}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Page heading: mono eyebrow, bold title, muted subtitle, optional action. */
export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  tone = "green",
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tone?: "green" | "accent";
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{ flexDirection: "row", alignItems: "flex-start", gap: space.md }}
    >
      <View style={{ flex: 1, gap: 6 }}>
        {eyebrow && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 6,
                height: 6,
                backgroundColor: tone === "green" ? c.primary : c.accent,
              }}
            />
            <AppText variant="micro" tone={tone}>
              {eyebrow}
            </AppText>
          </View>
        )}
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle && <AppText tone="muted">{subtitle}</AppText>}
      </View>
      {right}
    </View>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.row, { flexWrap: "nowrap" }]}>
      <View style={styles.logo}>
        <AppText
          style={{ fontFamily: fonts.mono, fontSize: 15, lineHeight: 18 }}
          tone="green"
        >
          {">"}_
        </AppText>
        <Svg width={14} height={18} viewBox="0 0 24 28">
          <Path
            d="M12 25V12M12 17C1 17 2 4 2 4S14 4 12 17M12 11C12 2 22 2 22 2S24 12 12 11"
            stroke={c.primary}
            strokeWidth={2.2}
            fill="none"
          />
        </Svg>
      </View>
      <View>
        <AppText
          style={{ fontFamily: fonts.bold, letterSpacing: 1.5, fontSize: 14 }}
        >
          TUPINI
          <AppText tone="green" style={{ fontFamily: fonts.bold }}>
            PLANNER
          </AppText>
        </AppText>
        {!compact && (
          <AppText
            variant="micro"
            tone="subtle"
            style={{ fontSize: 9, lineHeight: 12 }}
          >
            TRAIN · EAT · PRACTICE · EVOLVE
          </AppText>
        )}
      </View>
    </View>
  );
}

export function Button({
  title,
  onPress,
  secondary,
  ghost,
  danger,
  disabled,
  loading,
  icon,
  size = "md",
  style,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  ghost?: boolean;
  danger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  size?: "sm" | "md" | "lg";
  style?: StyleProp<ViewStyle>;
}) {
  const primary = !secondary && !ghost && !danger;
  const solidDanger = !!danger && !secondary && !ghost;
  const fg = primary || solidDanger ? c.onPrimary : danger ? c.danger : c.ivory;
  const height = { sm: 40, md: 50, lg: 58 }[size];
  const inner = (
    <>
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        icon && <Icon name={icon} color={fg} size={size === "sm" ? 16 : 19} />
      )}
      <AppText
        numberOfLines={2}
        style={{
          color: fg,
          fontFamily: fonts.bold,
          fontSize: size === "sm" ? 13 : 15,
          letterSpacing: 0.4,
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {title}
      </AppText>
    </>
  );
  const base: StyleProp<ViewStyle> = [
    styles.button,
    { minHeight: height, opacity: disabled ? 0.4 : 1 },
    size === "sm" && { paddingHorizontal: 14 },
  ];
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        primary && !disabled && shadow.glow,
        { borderRadius: radius.md },
        style,
      ]}
    >
      {primary ? (
        <LinearGradient
          colors={[c.primary, c.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[base, { borderColor: "transparent" }]}
        >
          {inner}
        </LinearGradient>
      ) : (
        <View
          style={[
            base,
            {
              backgroundColor: solidDanger
                ? c.danger
                : danger
                  ? `${c.danger}12`
                  : ghost
                    ? "transparent"
                    : c.surfaceRaised,
              borderColor: danger
                ? c.danger
                : ghost
                  ? "transparent"
                  : c.lineStrong,
            },
          ]}
        >
          {inner}
        </View>
      )}
    </PressableScale>
  );
}

export function IconButton({
  label,
  icon,
  onPress,
  color = c.primary,
  badge,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  color?: string;
  badge?: boolean;
}) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      scaleTo={0.9}
      style={styles.iconButton}
    >
      <Icon name={icon} color={color} size={21} />
      {badge && (
        <View
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: c.accent,
          }}
        />
      )}
    </PressableScale>
  );
}

/** Rounded tinted square holding an icon, used for categories and stats. */
export function IconTile({
  icon,
  color = c.primary,
  size = 42,
}: {
  icon: IconName;
  color?: string;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.32,
        backgroundColor: `${color}1F`,
        borderWidth: 1,
        borderColor: `${color}40`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={icon} color={color} size={size * 0.5} />
    </View>
  );
}

export function Pill({
  label,
  color = c.muted,
  icon,
}: {
  label: string;
  color?: string;
  icon?: IconName;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: radius.pill,
        backgroundColor: `${color}1A`,
        borderWidth: 1,
        borderColor: `${color}33`,
      }}
    >
      {icon && <Icon name={icon} color={color} size={11} />}
      <AppText
        variant="micro"
        style={{ color, fontSize: 10, lineHeight: 14, letterSpacing: 0.6 }}
      >
        {label}
      </AppText>
    </View>
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
      style={[
        styles.row,
        {
          justifyContent: "space-between",
          marginTop: space.md,
          flexWrap: "nowrap",
        },
      ]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow && (
          <AppText variant="micro" tone="green">
            {"// "}
            {eyebrow}
          </AppText>
        )}
        <AppText variant="heading" accessibilityRole="header">
          {title}
        </AppText>
      </View>
      {action}
    </View>
  );
}

export function EmptyState({
  title,
  detail,
  action,
  icon = "leaf-outline",
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
  icon?: IconName;
}) {
  return (
    <AppCard
      variant="outline"
      style={{ alignItems: "center", paddingVertical: 28 }}
    >
      <IconTile icon={icon} size={52} />
      <AppText variant="heading" style={{ textAlign: "center" }}>
        {title}
      </AppText>
      <AppText tone="muted" style={{ textAlign: "center", maxWidth: 320 }}>
        {detail}
      </AppText>
      {action}
    </AppCard>
  );
}

export function Field({
  label,
  hint,
  ...props
}: TextInputProps & { label: string; hint?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label" tone={focused ? "green" : "muted"}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={c.subtle}
        selectionColor={c.primary}
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.input,
          focused && { borderColor: c.primary, backgroundColor: "#0A2219" },
          props.multiline && { minHeight: 96, textAlignVertical: "top" },
          props.style,
        ]}
      />
      {hint && (
        <AppText variant="small" tone="subtle">
          {hint}
        </AppText>
      )}
    </View>
  );
}

export function Toggle({
  label,
  value,
  onChange,
  detail,
  icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  detail?: string;
  icon?: IconName;
}) {
  const app = useOptionalApp();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      onPress={() => {
        app?.haptic("select");
        onChange(!value);
      }}
      style={[
        styles.row,
        { justifyContent: "space-between", minHeight: 52, flexWrap: "nowrap" },
      ]}
    >
      {icon && (
        <IconTile icon={icon} size={36} color={value ? c.primary : c.muted} />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label">{label}</AppText>
        {detail && (
          <AppText variant="small" tone="subtle">
            {detail}
          </AppText>
        )}
      </View>
      <Switch
        accessible={false}
        value={value}
        onValueChange={(v) => {
          app?.haptic("select");
          onChange(v);
        }}
        trackColor={{ false: c.line, true: c.secondary }}
        thumbColor={value ? c.ivory : c.muted}
      />
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
  color = c.primary,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  color?: string;
}) {
  const app = useOptionalApp();
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      haptic={false}
      onPress={() => {
        app?.haptic("select");
        onPress();
      }}
      style={[
        styles.chip,
        selected && { backgroundColor: `${color}1F`, borderColor: color },
      ]}
    >
      {icon && (
        <Icon name={icon} size={15} color={selected ? color : c.muted} />
      )}
      <AppText
        variant="label"
        style={{ color: selected ? color : c.muted, fontSize: 13 }}
      >
        {label}
      </AppText>
    </PressableScale>
  );
}

export function ProgressRing({
  done,
  total,
  size = 132,
  stroke = 9,
  label = "MISSÕES",
  color = c.primary,
}: {
  done: number;
  total: number;
  size?: number;
  stroke?: number;
  label?: string;
  color?: string;
}) {
  const ratio = useTween(total ? done / total : 0, 900);
  const r = (size - stroke) / 2 - 4;
  const length = 2 * Math.PI * r;
  const mid = size / 2;
  return (
    <View
      accessible
      accessibilityLabel={`${done} de ${total} ${label.toLowerCase()} concluídas`}
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} />
            <Stop
              offset="1"
              stopColor={color === c.primary ? c.secondary : color}
              stopOpacity={0.7}
            />
          </SvgGradient>
        </Defs>
        <Circle
          cx={mid}
          cy={mid}
          r={r}
          stroke={c.line}
          strokeWidth={stroke}
          strokeDasharray="2 4"
          fill="none"
        />
        {ratio > 0.001 && (
          <Circle
            cx={mid}
            cy={mid}
            r={r}
            stroke="url(#ring)"
            strokeWidth={stroke}
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={length * (1 - ratio)}
            rotation={-90}
            origin={`${mid},${mid}`}
            strokeLinecap="round"
            fill="none"
          />
        )}
      </Svg>
      <AppText
        variant={size >= 120 ? "title" : "heading"}
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {done}
        <AppText variant={size >= 120 ? "heading" : "small"} tone="subtle">
          /{total}
        </AppText>
      </AppText>
      {size >= 100 && (
        <AppText variant="micro" tone="muted" style={{ fontSize: 9 }}>
          {label}
        </AppText>
      )}
    </View>
  );
}

/** Console-style segmented progress line: ▮▮▮▮▯▯▯▯. */
export function ProgressBar({
  value,
  total,
  color = c.primary,
  segments = 14,
  height = 6,
}: {
  value: number;
  total: number;
  color?: string;
  segments?: number;
  height?: number;
}) {
  const ratio = useTween(total ? Math.min(1, value / total) : 0, 800);
  const lit = ratio * segments;
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: value }}
      style={{ flexDirection: "row", gap: 3 }}
    >
      {Array.from({ length: segments }, (_, i) => {
        const fill = Math.max(0, Math.min(1, lit - i));
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height,
              borderRadius: 1.5,
              backgroundColor: c.line,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${fill * 100}%`,
                height: "100%",
                backgroundColor: color,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export function StatTile({
  icon,
  value,
  label,
  color = c.primary,
  style,
}: {
  icon: IconName;
  value: string | number;
  label: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <AppCard style={[{ flex: 1, minWidth: 96, padding: 14, gap: 10 }, style]}>
      <IconTile icon={icon} color={color} size={34} />
      <View>
        <AppText variant="heading" style={{ fontVariant: ["tabular-nums"] }}>
          {value}
        </AppText>
        <AppText variant="micro" tone="subtle" style={{ fontSize: 9.5 }}>
          {label}
        </AppText>
      </View>
    </AppCard>
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
    <View style={[styles.row, { flexWrap: "nowrap" }]}>
      <IconTile
        icon={unlocked ? "ribbon" : "lock-closed-outline"}
        color={unlocked ? c.accent : c.subtle}
        size={44}
      />
      <View style={{ flex: 1 }}>
        <AppText variant="label" tone={unlocked ? "normal" : "muted"}>
          {title}
        </AppText>
        <AppText variant="micro" tone={unlocked ? "accent" : "subtle"}>
          {unlocked ? "★ LIBERADO" : "EM BREVE"}
        </AppText>
      </View>
    </View>
  );
}

export function Loading() {
  const blink = useSharedValue(1);
  useEffect(() => {
    blink.value = withRepeat(withTiming(0.2, { duration: 600 }), -1, true);
    return () => cancelAnimation(blink);
  }, [blink]);
  const cursor = useAnimatedStyle(() => ({ opacity: blink.value }));
  return (
    <View style={styles.loading}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={{ alignItems: "center", gap: 22 }}
      >
        <Brand />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="micro" tone="muted">
            Preparando seu próximo passo
          </AppText>
          <Animated.View
            style={[
              { width: 7, height: 12, backgroundColor: c.primary },
              cursor,
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  card: {
    padding: 18,
    gap: space.md,
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    overflow: "hidden",
  },
  hero: { borderColor: "#2C6B4E", padding: 20 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "#00FF6A14",
    borderWidth: 1,
    borderColor: "#00FF6A33",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  chip: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: radius.md,
    backgroundColor: c.surface,
    color: c.ivory,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: c.background,
  },
});
