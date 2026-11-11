import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient as Gradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Line,
  LinearGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { neon } from "./RetroTV";

const GAP = 30;
const SUN = 260;

/**
 * Full-bleed 80s sunset built from flex layout (not a scaled SVG), so the
 * sun, horizon and grid stay aligned on any screen size.
 */
export function Synthwave({ animate }: { animate: boolean }) {
  const scroll = useSharedValue(0);
  useEffect(() => {
    if (animate)
      scroll.value = withRepeat(
        withTiming(1, { duration: 1400, easing: Easing.linear }),
        -1,
        false,
      );
    else {
      cancelAnimation(scroll);
      scroll.value = 0;
    }
    return () => cancelAnimation(scroll);
  }, [animate, scroll]);
  const gridStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scroll.value * GAP }],
  }));
  const stars = Array.from({ length: 40 }, (_, i) => ({
    left: `${(i * 37) % 100}%` as const,
    top: `${(i * 53) % 90}%` as const,
    size: i % 6 === 0 ? 3 : 2,
  }));
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Gradient
        colors={[neon.night, "#2A0B4A", "#6A1257"]}
        style={{ flex: 64 }}
      >
        {stars.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              backgroundColor: "#FFFFFF",
              opacity: 0.6,
            }}
          />
        ))}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Svg width={SUN} height={SUN / 2} viewBox="0 0 200 100">
            <Defs>
              <LinearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#FFE66B" />
                <Stop offset="0.55" stopColor={neon.sun} />
                <Stop offset="1" stopColor={neon.pink} />
              </LinearGradient>
              <ClipPath id="half">
                <Rect width="200" height="100" />
              </ClipPath>
            </Defs>
            <Circle
              cx={100}
              cy={100}
              r={100}
              fill="url(#sun)"
              clipPath="url(#half)"
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <Rect
                key={i}
                y={52 + i * 10}
                width={200}
                height={2 + i * 1.3}
                fill="#5A1060"
              />
            ))}
          </Svg>
        </View>
      </Gradient>
      <View style={{ height: 2, backgroundColor: neon.cyan }} />
      <Gradient
        colors={["#1A0630", "#05010C"]}
        style={{ flex: 36, overflow: "hidden" }}
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={StyleSheet.absoluteFill}
        >
          {Array.from({ length: 21 }, (_, i) => (
            <Line
              key={i}
              x1={50}
              y1={0}
              x2={-150 + i * 20}
              y2={100}
              stroke={neon.pink}
              strokeWidth={0.4}
              opacity={0.55}
            />
          ))}
        </Svg>
        <Animated.View
          style={[
            { position: "absolute", top: -GAP, left: 0, right: 0, bottom: 0 },
            gridStyle,
          ]}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <View
              key={i}
              style={{
                height: 1.5,
                marginTop: i === 0 ? 0 : GAP - 1.5,
                backgroundColor: neon.pink,
                opacity: 0.2 + Math.min(0.55, i * 0.05),
              }}
            />
          ))}
        </Animated.View>
      </Gradient>
    </View>
  );
}
