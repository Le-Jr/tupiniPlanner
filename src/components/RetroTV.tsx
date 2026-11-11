import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  View,
} from "react-native";
import Svg, { Defs, Pattern, Rect } from "react-native-svg";
import { giphyConfigured, randomGif, type RetroGif } from "../services/giphy";
import { useApp } from "../features/AppProvider";
import { AppText } from "./ui";
import { Character } from "./Character";
import { fonts, radius } from "../theme/tokens";

export const neon = {
  pink: "#FF3EA5",
  cyan: "#3EF2FF",
  purple: "#7B2CFF",
  night: "#0B0420",
  sun: "#FFB347",
};

/** Whether online GIFs may be fetched right now. */
export function useGifsAllowed() {
  const { state } = useApp();
  return giphyConfigured && state.settings[0]?.gifsEnabled !== false;
}

export function useRetroGif(query: string, enabled: boolean) {
  const [gif, setGif] = useState<RetroGif | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const load = useCallback(
    (avoid?: string) => {
      if (!enabled) return;
      setLoading(true);
      setFailed(false);
      randomGif(query, avoid)
        .then((g) => {
          setGif(g);
          setFailed(!g);
        })
        .catch(() => setFailed(true))
        .finally(() => setLoading(false));
    },
    [query, enabled],
  );
  useEffect(() => {
    setGif(null);
    load();
  }, [load]);
  return { gif, loading, failed, next: () => load(gif?.id) };
}

/** Scanline overlay for a CRT look. */
export function Scanlines({ opacity = 0.18 }: { opacity?: number }) {
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height="100%"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <Defs>
        <Pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
          <Rect width="4" height="2" fill="#000" opacity={opacity} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#scan)" />
    </Svg>
  );
}

/**
 * 80s CRT television that plays a GIPHY GIF, or an original vector
 * character when offline / not configured. Respects reduce motion.
 */
export function RetroTV({
  query,
  channel = "03",
  fallback = 0,
  height = 200,
  onShuffle,
}: {
  query: string;
  channel?: string;
  fallback?: number;
  height?: number;
  onShuffle?: () => void;
}) {
  const { animate } = useApp();
  const allowed = useGifsAllowed();
  const { gif, loading, failed, next } = useRetroGif(query, allowed);
  const showGif = allowed && gif && !failed;
  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          padding: 10,
          paddingBottom: 26,
          borderRadius: radius.lg,
          backgroundColor: "#1A1424",
          borderWidth: 1,
          borderColor: "#3A2D4F",
        }}
      >
        <View
          style={{
            height,
            borderRadius: 18,
            overflow: "hidden",
            backgroundColor: "#05020C",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: "#000",
          }}
        >
          {showGif ? (
            <Image
              accessibilityLabel={gif.title || "GIF anos 80"}
              source={{ uri: animate ? gif.url : gif.still }}
              resizeMode="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : loading ? (
            <ActivityIndicator color={neon.cyan} />
          ) : (
            <View style={{ transform: [{ scale: height / 170 }] }}>
              <Character index={fallback} animated={animate} />
            </View>
          )}
          <Scanlines />
          <View style={{ position: "absolute", top: 8, left: 10 }}>
            <AppText
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: neon.cyan,
                textShadowColor: neon.cyan,
                textShadowRadius: 6,
              }}
            >
              ▶ PLAY · CH {channel}
            </AppText>
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 7,
            left: 14,
            right: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", gap: 5 }}>
            {[neon.pink, neon.sun, neon.cyan].map((col) => (
              <View
                key={col}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: col,
                }}
              />
            ))}
          </View>
          {(allowed || onShuffle) && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trocar GIF"
              hitSlop={10}
              onPress={() => {
                next();
                onShuffle?.();
              }}
            >
              <AppText
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  color: "#B9A6D8",
                }}
              >
                ◀◀ REBOBINAR
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
      {showGif && (
        <AppText
          accessibilityRole="link"
          onPress={() => void Linking.openURL(gif.page)}
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: "#8C7BA8",
            textAlign: "right",
          }}
        >
          POWERED BY GIPHY
        </AppText>
      )}
      {!giphyConfigured && (
        <AppText
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: "#8C7BA8",
            textAlign: "center",
          }}
        >
          GIFS OFFLINE · CONFIGURE A CHAVE GIPHY PARA LIGAR A TV
        </AppText>
      )}
    </View>
  );
}
