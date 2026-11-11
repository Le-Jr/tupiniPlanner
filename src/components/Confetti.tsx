import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";
import { colors } from "../theme/tokens";
export function Confetti() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1600 });
  }, [progress]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [{ translateY: progress.value * 80 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      style={[StyleSheet.absoluteFill, style]}
    >
      <Svg width="100%" height={200} viewBox="0 0 300 200">
        {Array.from({ length: 16 }, (_, i) => (
          <Rect
            key={i}
            x={(i * 53) % 290}
            y={(i * 37) % 110}
            width={4}
            height={7}
            fill={i % 2 ? colors.primary : colors.accent}
            transform={`rotate(${i * 23}, ${(i * 53) % 290}, ${(i * 37) % 110})`}
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
