import React, { useEffect } from "react";
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from "react-native-reanimated";

export const characterNames = [
  "O Campeão",
  "O Comando",
  "O Veterano",
  "O Rival",
];
export const characterRoles = [
  "Boxeador · nunca joga a toalha",
  "Forças especiais · plano é tudo",
  "Instrutor · descanso faz parte",
  "Rival · te desafia a melhorar",
];

// Original 80s action archetypes, drawn from scratch. They intentionally do
// not depict any real actor or film character.
const looks = [
  {
    // O Campeão — boxer
    accent: "#00FF6A",
    skin: "#E3A878",
    shade: "#B97E55",
    hair: "#3A2618",
    shirt: "#0FBF5A",
    sky: ["#0B2A1C", "#0D5A37"],
  },
  {
    // O Comando — special forces
    accent: "#FFB347",
    skin: "#C68A5E",
    shade: "#9A6440",
    hair: "#1C1612",
    shirt: "#4B5A2A",
    sky: ["#2A1606", "#7A3E0E"],
  },
  {
    // O Veterano — drill instructor
    accent: "#7FD4FF",
    skin: "#DDB28E",
    shade: "#B48663",
    hair: "#C9CDD2",
    shirt: "#2E3B4E",
    sky: ["#081A2A", "#1E4C72"],
  },
  {
    // O Rival — punk challenger
    accent: "#FF3EA5",
    skin: "#8D5A3B",
    shade: "#6A4029",
    hair: "#FF3EA5",
    shirt: "#1E1B24",
    sky: ["#1B0738", "#6A1257"],
  },
];

export function Character({
  index,
  animated = false,
  serious = false,
  variant = 0,
  size = 150,
}: {
  index: number;
  animated?: boolean;
  serious?: boolean;
  variant?: number;
  size?: number;
}) {
  const lift = useSharedValue(0);
  useEffect(() => {
    if (animated)
      lift.value = withRepeat(withTiming(-5, { duration: 900 }), -1, true);
    else {
      cancelAnimation(lift);
      lift.value = 0;
    }
    return () => cancelAnimation(lift);
  }, [animated, lift]);
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));
  const i = ((index % 4) + 4) % 4;
  const k = looks[i]!;
  const id = `ch${i}`;
  const raised = variant > 0;
  const ink = "#1A1210";

  const torso =
    "M14 150 L18 124 Q22 106 44 100 L62 95 Q75 103 88 95 L106 100 Q128 106 132 124 L136 150 Z";
  const head =
    "M55 50 Q55 33 75 32 Q95 33 95 50 L95 72 Q95 84 86 90 L80 93 Q75 95 70 93 L64 90 Q55 84 55 72 Z";
  const headShade =
    "M75 32 Q95 33 95 50 L95 72 Q95 84 86 90 L80 93 Q75 95 75 95 Z";
  const angry = serious || i === 3;

  return (
    <Animated.View style={[{ alignSelf: "center" }, motion]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 150 150"
        accessibilityLabel={characterNames[i]}
      >
        <Defs>
          <ClipPath id={`${id}clip`}>
            <Circle cx={75} cy={75} r={69} />
          </ClipPath>
          <LinearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={k.sky[0]} />
            <Stop offset="1" stopColor={k.sky[1]} />
          </LinearGradient>
          <LinearGradient id={`${id}sun`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFE66B" />
            <Stop offset="0.6" stopColor="#FFB347" />
            <Stop offset="1" stopColor="#FF3EA5" />
          </LinearGradient>
          <LinearGradient id={`${id}lens`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B1B2A" />
            <Stop offset="0.55" stopColor="#1E4C72" />
            <Stop offset="1" stopColor="#7FD4FF" />
          </LinearGradient>
        </Defs>

        <G clipPath={`url(#${id}clip)`}>
          {/* synthwave backdrop */}
          <Rect width={150} height={150} fill={`url(#${id}sky)`} />
          <Circle
            cx={75}
            cy={104}
            r={44}
            fill={`url(#${id}sun)`}
            opacity={0.9}
          />
          {[0, 1, 2, 3].map((n) => (
            <Rect
              key={n}
              y={84 + n * 7}
              width={150}
              height={1.5 + n}
              fill={k.sky[1]}
            />
          ))}
          <Rect y={108} width={150} height={42} fill="#0A0414" />
          {[-60, -20, 20, 60, 100, 140, 180, 220].map((x) => (
            <Line
              key={x}
              x1={75}
              y1={108}
              x2={x}
              y2={150}
              stroke="#FF3EA5"
              strokeWidth={0.8}
              opacity={0.5}
            />
          ))}
          {[114, 122, 134].map((y) => (
            <Line
              key={y}
              x1={0}
              x2={150}
              y1={y}
              y2={y}
              stroke="#FF3EA5"
              strokeWidth={0.8}
              opacity={0.4}
            />
          ))}

          {/* raised fist / glove */}
          {raised && i !== 0 && (
            <G>
              <Path
                d="M34 128 L36 84"
                stroke={k.skin}
                strokeWidth={15}
                strokeLinecap="round"
              />
              <Path
                d="M41 128 L42 92"
                stroke={k.shade}
                strokeWidth={4}
                strokeLinecap="round"
                opacity={0.6}
              />
              <Rect x={26} y={68} width={20} height={18} rx={6} fill={k.skin} />
              <Path
                d="M30 72 H44 M30 77 H44"
                stroke={k.shade}
                strokeWidth={1.4}
              />
            </G>
          )}

          {/* neck & muscular torso */}
          <Path d="M62 84 L88 84 L92 104 L58 104 Z" fill={k.shade} />
          <Path d={torso} fill={k.skin} />
          <Path
            d="M44 100 Q34 112 32 132 M106 100 Q116 112 118 132"
            stroke={k.shade}
            strokeWidth={2}
            fill="none"
            opacity={0.7}
          />

          {/* outfits */}
          {i === 0 && (
            <G>
              <Path
                d="M48 150 L50 114 Q58 104 65 99 Q75 110 85 99 Q92 104 100 114 L102 150 Z"
                fill={k.shirt}
              />
              <Path
                d="M65 99 Q75 110 85 99"
                stroke="#E8FFF1"
                strokeWidth={2.5}
                fill="none"
              />
              <Rect
                x={72}
                y={118}
                width={6}
                height={10}
                fill="#E8FFF1"
                opacity={0.9}
              />
            </G>
          )}
          {i === 1 && (
            <G>
              <Path
                d="M48 150 L50 112 Q58 104 66 100 Q75 107 84 100 Q92 104 100 112 L102 150 Z"
                fill={k.shirt}
              />
              <Path
                d="M54 120 l6 -3 M88 130 l7 2 M62 138 l5 3"
                stroke="#2F3A18"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Path d="M42 104 L112 150" stroke="#3A2A16" strokeWidth={11} />
              <Path
                d="M42 104 L112 150"
                stroke="#E2B13C"
                strokeWidth={5}
                strokeDasharray="2.5 3.5"
              />
              <Path
                d="M66 99 Q75 112 84 99"
                stroke="#9AA0A6"
                strokeWidth={1.2}
                fill="none"
              />
              <Rect
                x={72}
                y={110}
                width={6}
                height={8}
                rx={1.5}
                fill="#C9CDD2"
              />
            </G>
          )}
          {i === 2 && (
            <G>
              <Path
                d="M18 150 L20 124 Q24 108 44 102 L62 97 L75 120 L88 97 L106 102 Q126 108 130 124 L132 150 Z"
                fill={k.shirt}
              />
              <Path
                d="M62 97 L68 114 L58 112 Z M88 97 L82 114 L92 112 Z"
                fill="#3E4F68"
              />
              <Path d="M62 97 L75 120 L88 97 Q75 104 62 97 Z" fill={k.skin} />
              {[30, 38, 112, 120].map((x) => (
                <Path
                  key={x}
                  d={`M${x} 112 l1.5 3 h3 l-2.5 2 l1 3 l-3 -2 l-3 2 l1 -3 l-2.5 -2 h3 Z`}
                  fill="#FFE66B"
                />
              ))}
            </G>
          )}
          {i === 3 && (
            <G>
              <Path
                d="M46 150 L48 112 Q58 104 64 100 L75 126 L86 100 Q92 104 102 112 L104 150 Z"
                fill={k.shirt}
              />
              <Path d="M16 126 Q22 100 50 100 L54 122 Z" fill="#2A2A33" />
              <Path d="M134 126 Q128 100 100 100 L96 122 Z" fill="#2A2A33" />
              {[
                "M24 108 L18 98 L30 104 Z",
                "M36 102 L34 90 L42 100 Z",
                "M126 108 L132 98 L120 104 Z",
                "M114 102 L116 90 L108 100 Z",
              ].map((d) => (
                <Path key={d} d={d} fill="#C9CDD2" />
              ))}
            </G>
          )}

          {/* head */}
          <Ellipse cx={54.5} cy={64} rx={3.5} ry={6} fill={k.shade} />
          <Ellipse cx={95.5} cy={64} rx={3.5} ry={6} fill={k.shade} />
          <Path d={head} fill={k.skin} />
          <Path d={headShade} fill={ink} opacity={0.14} />
          <Path
            d="M60 86 Q75 98 90 86"
            stroke={ink}
            strokeWidth={1}
            opacity={0.2}
            fill="none"
          />

          {/* hair & headgear */}
          {i === 0 && (
            <G>
              <Path
                d="M55 50 Q53 30 75 29 Q97 30 95 50 Q90 40 75 40 Q60 40 55 50 Z"
                fill={k.hair}
              />
              <Path
                d="M54 45 Q75 38 96 45 L96 51 Q75 44 54 51 Z"
                fill={k.accent}
              />
              <Path
                d="M54 47.5 Q75 41 96 47.5"
                stroke="#E8FFF1"
                strokeWidth={1}
                fill="none"
              />
            </G>
          )}
          {i === 1 && (
            <G>
              <Path
                d="M55 48 Q55 33 75 32 Q95 33 95 48 Q75 40 55 48 Z"
                fill={k.hair}
              />
              <Path
                d="M54 44 Q75 37 96 44 L96 51 Q75 44 54 51 Z"
                fill={k.accent}
              />
              <Path
                d="M95 46 L110 39 L106 50 Z M95 49 L112 55 L102 58 Z"
                fill={k.accent}
              />
              <Path
                d="M60 69 L70 70 M80 70 L90 69"
                stroke="#2F4A2A"
                strokeWidth={2.6}
                strokeLinecap="round"
              />
            </G>
          )}
          {i === 2 && (
            <G>
              <Path
                d="M55 47 L55 30 L95 30 L95 47 Q75 42 55 47 Z"
                fill={k.hair}
              />
              <Path
                d="M58 31 V44 M64 31 V43 M70 31 V42 M76 31 V42 M82 31 V43 M88 31 V44"
                stroke="#A9AEB4"
                strokeWidth={1}
              />
            </G>
          )}
          {i === 3 && (
            <G>
              <Path
                d="M55 50 Q55 34 75 33 Q95 34 95 50 Q75 44 55 50 Z"
                fill={k.shade}
              />
              <Path
                d="M65 42 L67 16 L72 34 L76 10 L80 34 L85 16 L86 42 Q75 38 65 42 Z"
                fill={k.hair}
              />
              <Path d="M71 34 L76 14 L79 34" fill="#FF8FCB" opacity={0.6} />
              <Circle
                cx={96}
                cy={72}
                r={2.4}
                fill="none"
                stroke="#FFE66B"
                strokeWidth={1.4}
              />
              <Path d="M62 53 L68 71" stroke="#5A2E22" strokeWidth={1.6} />
            </G>
          )}

          {/* face */}
          {i === 2 ? (
            <G>
              <Path
                d="M59 56 L71 58 M79 58 L91 56"
                stroke="#8D9298"
                strokeWidth={3}
                strokeLinecap="round"
              />
              <Path
                d="M57 60 L72 60 Q73 69 65 71 Q58 70 57 60 Z"
                fill={`url(#${id}lens)`}
              />
              <Path
                d="M78 60 L93 60 Q92 70 85 71 Q77 69 78 60 Z"
                fill={`url(#${id}lens)`}
              />
              <Path d="M72 61 L78 61" stroke="#C9CDD2" strokeWidth={1.4} />
              <Path
                d="M60 62 L64 62 M81 62 L85 62"
                stroke="#FFFFFF"
                strokeWidth={1.2}
                opacity={0.8}
              />
            </G>
          ) : (
            <G>
              <Path
                d={
                  angry
                    ? "M59 57 L71 61 M79 61 L91 57"
                    : "M59 58 L71 59 M79 59 L91 58"
                }
                stroke={i === 3 ? "#2A1A12" : ink}
                strokeWidth={3.4}
                strokeLinecap="round"
              />
              <Ellipse
                cx={66}
                cy={64.5}
                rx={2.6}
                ry={angry ? 1.6 : 2.3}
                fill={ink}
              />
              <Ellipse
                cx={84}
                cy={64.5}
                rx={2.6}
                ry={angry ? 1.6 : 2.3}
                fill={ink}
              />
              <Circle cx={66.8} cy={63.7} r={0.7} fill="#FFFFFF" />
              <Circle cx={84.8} cy={63.7} r={0.7} fill="#FFFFFF" />
            </G>
          )}
          <Path
            d="M75 63 L71.5 75 Q75 77 78.5 75"
            stroke={k.shade}
            strokeWidth={1.8}
            fill="none"
            strokeLinejoin="round"
          />
          {(i === 1 || i === 2) && (
            <Path
              d="M60 76 Q62 88 70 92 Q75 94 80 92 Q88 88 90 76 Q84 86 75 86 Q66 86 60 76 Z"
              fill={ink}
              opacity={0.12}
            />
          )}
          {i === 2 && (
            <Path
              d="M64 78 Q70 74 75 76 Q80 74 86 78 Q81 81 75 79 Q69 81 64 78 Z"
              fill={k.hair}
            />
          )}
          {serious ? (
            <Path
              d="M67 83 L83 83"
              stroke={ink}
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          ) : i === 3 ? (
            <G>
              <Path
                d="M66 80 Q76 89 85 78 L84 82 Q76 88 67 82 Z"
                fill="#FFFFFF"
                stroke={ink}
                strokeWidth={1.4}
              />
              <Path
                d="M71 82 V85 M76 83 V86 M80 82 V85"
                stroke={ink}
                strokeWidth={0.8}
              />
            </G>
          ) : i === 2 ? (
            <Path
              d="M69 83 Q75 85 81 83"
              stroke={ink}
              strokeWidth={2.2}
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <Path
              d="M66 81 Q75 88 84 81"
              stroke={ink}
              strokeWidth={2.4}
              fill="none"
              strokeLinecap="round"
            />
          )}
          {i === 0 && (
            <Path
              d="M86 70 l3 1"
              stroke="#C25D4A"
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          )}

          {/* boxer gloves */}
          {i === 0 && (
            <G>
              {(raised
                ? [
                    [34, 72],
                    [116, 72],
                  ]
                : [
                    [30, 132],
                    [120, 132],
                  ]
              ).map(([x, y]) => (
                <G key={x}>
                  <Rect
                    x={x! - 12}
                    y={y! + 8}
                    width={24}
                    height={14}
                    rx={3}
                    fill="#F2F2F2"
                  />
                  <Ellipse cx={x} cy={y} rx={15} ry={14} fill="#E23B3B" />
                  <Ellipse
                    cx={x! - 4}
                    cy={y! - 5}
                    rx={5}
                    ry={3.5}
                    fill="#FF8A8A"
                    opacity={0.7}
                  />
                  <Path
                    d={`M${x! - 9} ${y! + 4} Q${x} ${y! + 9} ${x! + 9} ${y! + 4}`}
                    stroke="#9E1F1F"
                    strokeWidth={1.6}
                    fill="none"
                  />
                </G>
              ))}
            </G>
          )}
        </G>
        <Circle
          cx={75}
          cy={75}
          r={69}
          fill="none"
          stroke={k.accent}
          strokeWidth={2.5}
        />
        <Circle
          cx={75}
          cy={75}
          r={72.5}
          fill="none"
          stroke={k.accent}
          strokeWidth={1}
          opacity={0.35}
        />
      </Svg>
    </Animated.View>
  );
}
