// Generates the app icon, adaptive icon layers, splash and notification icon
// from original vector art (terminal prompt + sprout). Requires rsvg-convert.
// Usage: node tools/make-brand-assets.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = "assets/images";
mkdirSync(out, { recursive: true });

const green = "#00FF6A";
const deep = "#00C653";
const bg = "#071A14";

/** The mark, drawn in a 1024 box, centred inside the adaptive safe zone. */
function mark({ color = green, glow = true, scale = 1 } = {}) {
  const s = scale;
  const t = (1 - s) * 512;
  return `
  <g transform="translate(${t} ${t}) scale(${s})" ${glow ? 'filter="url(#glow)"' : ""}>
    <!-- prompt chevron -->
    <polyline points="300,470 410,560 300,650" fill="none" stroke="${color}"
      stroke-width="46" stroke-linecap="square" stroke-linejoin="miter"/>
    <!-- cursor -->
    <rect x="452" y="622" width="210" height="44" fill="${color}"/>
    <!-- sprout growing from the cursor -->
    <path d="M557 622 V430" stroke="${color}" stroke-width="30" fill="none" stroke-linecap="square"/>
    <path d="M557 520 C470 520 420 470 410 380 C500 385 550 430 557 520 Z" fill="${color}"/>
    <path d="M557 470 C560 370 620 320 724 310 C720 410 660 470 557 470 Z" fill="${color}"/>
  </g>`;
}

const defs = `
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0" stop-color="#0F3A2A"/>
      <stop offset="0.55" stop-color="${bg}"/>
      <stop offset="1" stop-color="#030C09"/>
    </radialGradient>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="14" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0 H0 V64" fill="none" stroke="${deep}" stroke-opacity="0.09" stroke-width="2"/>
    </pattern>
  </defs>`;

const background = `
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <rect width="1024" height="1024" fill="url(#grid)"/>
  <!-- pixel corners -->
  ${[
    [96, 96, 1, 1],
    [928, 96, -1, 1],
    [96, 928, 1, -1],
    [928, 928, -1, -1],
  ]
    .map(
      ([x, y, dx, dy]) =>
        `<path d="M${x} ${y + dy * 70} V${y} H${x + dx * 70}" fill="none" stroke="${green}" stroke-opacity="0.55" stroke-width="12"/>`,
    )
    .join("")}`;

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs}${body}</svg>`;

const files = {
  // Legacy/full icon (also used by stores and iOS).
  "icon.svg": svg(background + mark()),
  // Android adaptive: background + foreground kept inside the 66% safe zone.
  "adaptive-background.svg": svg(background),
  "adaptive-foreground.svg": svg(mark({ scale: 0.82 })),
  // Android 13 themed icon: single colour silhouette.
  "adaptive-monochrome.svg": svg(
    mark({ color: "#FFFFFF", glow: false, scale: 0.82 }),
  ),
  // Splash mark, transparent, on the brand background colour.
  "splash-icon.svg": svg(mark()),
  // Status-bar notification icon: white on transparent.
  "notification-icon.svg": svg(
    mark({ color: "#FFFFFF", glow: false, scale: 1.25 }),
  ),
};

for (const [name, content] of Object.entries(files)) {
  const svgPath = join(out, name);
  writeFileSync(svgPath, content);
  const size = name.startsWith("notification") ? 96 : 1024;
  execFileSync("rsvg-convert", [
    "-w",
    String(size),
    "-h",
    String(size),
    svgPath,
    "-o",
    svgPath.replace(/\.svg$/, ".png"),
  ]);
}
console.log("brand assets written to", out);
