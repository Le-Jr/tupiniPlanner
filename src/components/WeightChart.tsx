import React from "react";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { View } from "react-native";
import { AppText, styles } from "./ui";
import { colors as c } from "../theme/tokens";
export function WeightChart({
  points,
}: {
  points: { date: string; weight: number }[];
}) {
  if (!points.length)
    return (
      <AppText tone="muted">
        Registre uma medição para começar sua linha do tempo.
      </AppText>
    );
  const values = points.map((p) => p.weight);
  const low = Math.min(...values) - 0.5;
  const high = Math.max(...values) + 0.5;
  const first = Date.parse(`${points[0]!.date}T12:00:00Z`);
  const last = Date.parse(`${points.at(-1)!.date}T12:00:00Z`);
  const coords = points.map((p) => ({
    x:
      first === last
        ? 140
        : 16 +
          ((Date.parse(`${p.date}T12:00:00Z`) - first) / (last - first)) * 248,
    y: 115 - ((p.weight - low) / (high - low)) * 95,
  }));
  return (
    <View style={{ gap: 10 }}>
      <AppText variant="micro" tone="muted">
        MÉDIA SEMANAL · {low.toFixed(1)}–{high.toFixed(1)} kg
      </AppText>
      <Svg
        width="100%"
        height={140}
        viewBox="0 0 280 140"
        accessible
        accessibilityLabel={`Tendência do peso em ${points.length} semanas, de ${points[0]!.weight.toFixed(1)} a ${points.at(-1)!.weight.toFixed(1)} quilos.`}
      >
        <Line x1={16} x2={264} y1={115} y2={115} stroke={c.line} />
        <Line
          x1={16}
          x2={264}
          y1={66}
          y2={66}
          stroke={c.line}
          strokeDasharray="4 6"
        />
        <Polyline
          points={coords.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke={c.primary}
          strokeWidth={3}
          fill="none"
        />
        {coords.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={c.primary} />
        ))}
      </Svg>
      <View style={[styles.row, { justifyContent: "space-between" }]}>
        <AppText variant="micro" tone="muted">
          {points[0]!.date}
        </AppText>
        <AppText variant="micro" tone="muted">
          {points.at(-1)!.date}
        </AppText>
      </View>
    </View>
  );
}
