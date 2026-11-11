import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  ZoomIn,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { badgeDefinitions } from "../domain/planner";
import { credit, randomBrute, randomQuote } from "../domain/quotes";
import { useApp } from "../features/AppProvider";
import { AppText } from "./ui";
import { characterNames } from "./Character";
import { PixelTitle } from "./PixelTitle";
import { RetroTV, Scanlines, neon } from "./RetroTV";
import { Synthwave } from "./Synthwave";
import { fonts, radius } from "../theme/tokens";
export { Character } from "./Character";
const lines = [
  "Mais um round vencido. O progresso ficou registrado.",
  "Três caminhadas, três capítulos da sua campanha.",
  "Sete dias possíveis. Você está construindo constância.",
  "Um riff por vez. Suas cordas ganharam uma história.",
  "Você voltou. O próximo round começa com esse passo.",
  "28 dias de compromisso. Sua campanha continua.",
];
const months = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];
const glow = (color: string) => ({
  textShadowColor: color,
  textShadowRadius: 12,
  textShadowOffset: { width: 0, height: 0 },
});

function NeonButton({
  title,
  onPress,
  ghost,
}: {
  title: string;
  onPress: () => void;
  ghost?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
        flex: ghost ? undefined : 1,
      })}
    >
      {ghost ? (
        <View
          style={{
            minHeight: 48,
            paddingHorizontal: 16,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: `${neon.cyan}88`,
            backgroundColor: "#12062AE6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppText
            style={{ fontFamily: fonts.mono, fontSize: 12, color: neon.cyan }}
          >
            {title}
          </AppText>
        </View>
      ) : (
        <LinearGradient
          colors={[neon.pink, neon.sun]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 54,
            borderRadius: radius.md,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: neon.pink,
            shadowOpacity: 0.6,
            shadowRadius: 18,
            elevation: 8,
          }}
        >
          <AppText
            style={{
              fontFamily: fonts.bold,
              fontSize: 16,
              letterSpacing: 3,
              color: "#1A0326",
            }}
          >
            {title}
          </AppText>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function ReactionModal() {
  const { reward, closeReward, animate, haptic } = useApp();
  const insets = useSafeAreaInsets();
  const badge = badgeDefinitions.find((b) => b.id === reward);
  const index = badge?.character ?? 0;
  const reaction = Math.max(
    0,
    badgeDefinitions.findIndex((b) => b.id === reward),
  );
  const [quote, setQuote] = useState(() => randomQuote());
  const [brute, setBrute] = useState(() => randomBrute());
  useEffect(() => {
    if (!reward) return;
    setQuote(randomQuote());
    setBrute(randomBrute());
  }, [reward]);
  const now = useMemo(() => new Date(), [reward]); // eslint-disable-line react-hooks/exhaustive-deps
  const stamp = `${String(now.getDate()).padStart(2, "0")} ${months[now.getMonth()]} 1986`;

  const blink = useSharedValue(1);
  const shake = useSharedValue(0);
  useEffect(() => {
    if (!reward || !animate) {
      cancelAnimation(blink);
      blink.value = 1;
      return;
    }
    blink.value = withRepeat(withTiming(0.15, { duration: 520 }), -1, true);
    shake.value = withSequence(
      withTiming(-3, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 60 }),
    );
    return () => cancelAnimation(blink);
  }, [reward, animate, blink, shake]);
  const rec = useAnimatedStyle(() => ({ opacity: blink.value }));
  const glitch = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Modal
      transparent
      statusBarTranslucent
      visible={!!reward}
      animationType={animate ? "fade" : "none"}
      onRequestClose={closeReward}
    >
      <View
        style={{ flex: 1, backgroundColor: neon.night }}
        accessibilityViewIsModal
      >
        <Synthwave animate={animate} />
        <Scanlines opacity={0.22} />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + 14,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 20,
            gap: 16,
            width: "100%",
            maxWidth: 460,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Animated.View
                style={[
                  {
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: "#FF2D2D",
                  },
                  rec,
                ]}
              />
              <AppText
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                REC
              </AppText>
            </View>
            <AppText
              style={{
                fontFamily: fonts.mono,
                fontSize: 12,
                color: "#FFFFFF",
                ...glow(neon.cyan),
              }}
            >
              SP ▶ {stamp}
            </AppText>
          </View>

          <Animated.View style={glitch}>
            <PixelTitle chrome />
          </Animated.View>
          <AppText
            style={{
              fontFamily: fonts.mono,
              fontSize: 13,
              letterSpacing: 4,
              textAlign: "center",
              color: neon.cyan,
              ...glow(neon.cyan),
            }}
          >
            ★ MISSION COMPLETE ★
          </AppText>

          <Animated.View
            entering={animate ? ZoomIn.springify().damping(14) : undefined}
          >
            <RetroTV
              query={brute}
              fallback={index}
              channel={String(reaction + 1).padStart(2, "0")}
            />
          </Animated.View>

          <View
            style={{
              alignItems: "center",
              gap: 4,
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: radius.lg,
              backgroundColor: "#12062AE6",
              borderWidth: 1,
              borderColor: `${neon.cyan}44`,
            }}
          >
            <AppText
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: neon.sun,
                letterSpacing: 2,
              }}
            >
              NOVA CONQUISTA DESBLOQUEADA
            </AppText>
            <AppText
              accessibilityRole="header"
              style={{
                fontFamily: fonts.bold,
                fontSize: 30,
                lineHeight: 36,
                color: "#FFFFFF",
                textAlign: "center",
                ...glow(neon.pink),
              }}
            >
              {badge?.title}
            </AppText>
            <AppText
              style={{ fontSize: 14, color: "#E6D9FF", textAlign: "center" }}
            >
              {lines[reaction]}
            </AppText>
          </View>

          <Animated.View
            key={quote.id}
            entering={animate ? FadeIn.duration(350) : undefined}
            style={{
              padding: 16,
              gap: 8,
              borderRadius: radius.lg,
              backgroundColor: "#12062AE6",
              borderWidth: 1,
              borderColor: `${neon.pink}66`,
            }}
          >
            <AppText
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: neon.pink,
                letterSpacing: 2,
              }}
            >
              {"// FITA "}
              {quote.kind.toUpperCase()}
            </AppText>
            <AppText
              style={{
                fontFamily: fonts.bold,
                fontSize: 19,
                lineHeight: 26,
                color: "#FFFFFF",
              }}
            >
              “{quote.text}”
            </AppText>
            <AppText
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                lineHeight: 16,
                color: "#B9A6D8",
              }}
            >
              {quote.original}
            </AppText>
            <AppText style={{ fontSize: 12, color: neon.sun }}>
              — {credit(quote)}
            </AppText>
          </Animated.View>

          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <NeonButton
              ghost
              title="◀◀ OUTRA FITA"
              onPress={() => {
                haptic("select");
                setQuote(randomQuote(quote.id));
                setBrute(randomBrute());
              }}
            />
            <NeonButton title="CONTINUAR" onPress={closeReward} />
          </View>
          <AppText
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: "#8C7BA8",
              textAlign: "center",
            }}
          >
            {characterNames[index]} {"// TUPINIPLANNER VIDEO CLUB"}
          </AppText>
        </ScrollView>
      </View>
    </Modal>
  );
}
