import React from "react";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { colors } from "../theme/tokens";
// Original 5×7 bitmap lettering, rendered as vectors; no font/network dependency.
const glyphs: Record<string, string[]> = {
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  N: ["10001", "11001", "11001", "10101", "10011", "10011", "10001"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
};
const lines = ["CONGRAT", "ULATIONS"];
/**
 * CONGRATULATIONS in 8-bit lettering. `chrome` paints an 80s chrome gradient
 * with a neon drop shadow; otherwise flat brand green.
 */
export function PixelTitle({ chrome = false }: { chrome?: boolean }) {
  const pixels = (dx: number, dy: number, fill: string, prefix: string) =>
    lines.map((line, row) =>
      [...line].flatMap((char, i) =>
        glyphs[char]!.flatMap((bits, y) =>
          [...bits].map((bit, x) =>
            bit === "1" ? (
              <Rect
                key={`${prefix}-${row}-${i}-${y}-${x}`}
                x={i * 6 + x + (89 - line.length * 6) / 2 + dx}
                y={row * 9 + y + dy}
                width={0.9}
                height={0.9}
                fill={fill}
              />
            ) : null,
          ),
        ),
      ),
    );
  return (
    <Svg
      accessible
      accessibilityLabel="CONGRATULATIONS"
      width="100%"
      height={chrome ? 76 : 62}
      viewBox="-1 -1 91 18"
    >
      {chrome && (
        <Defs>
          <LinearGradient
            id="chrome"
            x1="0"
            y1="0"
            x2="0"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#E8FBFF" />
            <Stop offset="0.18" stopColor="#3EF2FF" />
            <Stop offset="0.21" stopColor="#FFFFFF" />
            <Stop offset="0.38" stopColor="#7B2CFF" />
            <Stop offset="0.5" stopColor="#E8FBFF" />
            <Stop offset="0.68" stopColor="#3EF2FF" />
            <Stop offset="0.72" stopColor="#FFFFFF" />
            <Stop offset="0.88" stopColor="#FF3EA5" />
            <Stop offset="1" stopColor="#FFB347" />
          </LinearGradient>
        </Defs>
      )}
      {chrome && pixels(0.55, 0.55, "#FF3EA5", "s")}
      {pixels(0, 0, chrome ? "url(#chrome)" : colors.primary, "f")}
    </Svg>
  );
}
