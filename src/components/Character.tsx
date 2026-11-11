import React, { useEffect } from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";
import { colors as c } from "../theme/tokens";
export const characterNames = [
  "O Campeão",
  "O Comando",
  "O Veterano",
  "O Rival",
];
const names = characterNames;
// Original geometric archetypes. Replace only with licensed original artwork.
export function Character({
  index,
  animated = false,
  serious = false,
  variant = 0,
}: {
  index: number;
  animated?: boolean;
  serious?: boolean;
  variant?: number;
}) {
  const lift = useSharedValue(0);
  useEffect(() => {
    if (animated)
      lift.value = withRepeat(withTiming(-6, { duration: 1000 }), -1, true);
    else {
      cancelAnimation(lift);
      lift.value = 0;
    }
    return () => cancelAnimation(lift);
  }, [animated, lift]);
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));
  const color = [c.primary, c.accent, "#B3D5EE", "#D6B4FF"][index % 4]!;
  return (
    <Animated.View style={[{ alignSelf: "center" }, motion]}>
      <Svg
        width={150}
        height={150}
        viewBox="0 0 150 150"
        accessibilityLabel={names[index]}
      >
        <Circle cx={75} cy={75} r={69} fill={c.background} stroke={c.line} />
        <Path d="M28 134L38 104L62 92H88L112 104L122 134" fill={color} />
        {variant > 0 && (
          <Path
            d={
              variant % 2
                ? "M18 110L35 88L46 100M104 100L118 81L132 93"
                : "M22 105L38 122M111 122L130 105"
            }
            stroke={color}
            strokeWidth={12}
            fill="none"
          />
        )}
        <Path d="M60 90L75 112L90 90" fill={c.forest} />
        <Rect
          x={49}
          y={35}
          width={52}
          height={62}
          rx={index === 2 ? 8 : 22}
          fill="#CBAF83"
        />
        <Path
          d={
            index === 1
              ? "M45 49L49 27H101L108 49Z"
              : index === 3
                ? "M45 45L55 18L67 30L83 14L102 47Z"
                : "M48 44L50 26H100L104 44Z"
          }
          fill={color}
        />
        <Path d="M58 61H66M84 61H92" stroke={c.background} strokeWidth={5} />
        <Path
          d={
            serious
              ? "M64 81H87"
              : index === 2
                ? "M60 79H90L83 90H67Z"
                : "M64 79Q75 88 87 77"
          }
          fill="none"
          stroke={c.background}
          strokeWidth={3}
        />
        {index === 1 && (
          <Path d="M49 50H101" stroke={c.background} strokeWidth={7} />
        )}
        {index === 3 && (
          <Path
            d="M45 104L104 134M104 104L45 134"
            stroke={c.background}
            strokeWidth={5}
          />
        )}
      </Svg>
    </Animated.View>
  );
}
