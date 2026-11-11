// Tupinicode Design Guide v6 palette + TupiniPlanner premium sub-language.
export const colors = {
  primary: "#00FF6A",
  secondary: "#00C653",
  forest: "#0D3B2E",
  background: "#071A14",
  accent: "#FFB347",
  ivory: "#F5F7EF",
  muted: "#A4B9AF",
  subtle: "#6F8A7D",
  line: "#1F4236",
  lineStrong: "#2E5E4C",
  danger: "#FFB4A9",
  surface: "#0C241C",
  surfaceRaised: "#113126",
  overlay: "#020A07E6",
  glow: "#00FF6A33",
  accentGlow: "#FFB34726",
  onPrimary: "#04140E",
};

// One accent per front, so category is readable at a glance (never the only cue).
export const categoryColors = {
  movement: "#00FF6A",
  meal: "#FFB347",
  guitar: "#C9A7FF",
  hydration: "#7FD4FF",
  sleep: "#9FB4FF",
  custom: "#F5F7EF",
} as const;

export const categoryIcons = {
  movement: "fitness",
  meal: "restaurant",
  guitar: "musical-notes",
  hydration: "water",
  sleep: "moon",
  custom: "sparkles",
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

export const fonts = {
  body: "Inter",
  medium: "InterMedium",
  bold: "InterBold",
  mono: "JetBrainsMono",
};

export const motion = { fast: 140, base: 220, slow: 420 };

export const shadow = {
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
};
