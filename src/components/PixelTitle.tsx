import React from "react";
import Svg, { Rect } from "react-native-svg";
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
export function PixelTitle() {
  return (
    <Svg
      accessible
      accessibilityLabel="CONGRATULATIONS"
      width="100%"
      height={62}
      viewBox="0 0 89 17"
    >
      {["CONGRAT", "ULATIONS"].map((line, row) =>
        [...line].flatMap((char, i) =>
          glyphs[char]!.flatMap((pixels, y) =>
            [...pixels].map((pixel, x) =>
              pixel === "1" ? (
                <Rect
                  key={`${row}-${i}-${y}-${x}`}
                  x={i * 6 + x + (89 - line.length * 6) / 2}
                  y={row * 9 + y}
                  width={0.85}
                  height={0.85}
                  fill={colors.primary}
                />
              ) : null,
            ),
          ),
        ),
      )}
    </Svg>
  );
}
