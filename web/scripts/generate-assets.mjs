/**
 * Neo cyberpunk JPEG assets for Base.dev (icon 1:1, thumbnail ~1.91:1).
 * Run: node scripts/generate-assets.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="75%">
      <stop offset="0%" stop-color="#0d1a28"/>
      <stop offset="55%" stop-color="#030508"/>
      <stop offset="100%" stop-color="#010204"/>
    </radialGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00ffe5"/>
      <stop offset="45%" stop-color="#ff2ec4"/>
      <stop offset="100%" stop-color="#b8ff3a"/>
    </linearGradient>
    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <g fill="none" stroke="rgba(0,255,229,0.08)" stroke-width="1">
    ${Array.from({ length: 14 }, (_, r) => {
      const r0 = 120 + r * 28;
      return `<polygon points="${[
        [512, 512 - r0],
        [512 + r0 * 0.866, 512 - r0 * 0.5],
        [512 + r0 * 0.866, 512 + r0 * 0.5],
        [512, 512 + r0],
        [512 - r0 * 0.866, 512 + r0 * 0.5],
        [512 - r0 * 0.866, 512 - r0 * 0.5],
      ]
        .map(([x, y]) => `${x.toFixed(0)},${y.toFixed(0)}`)
        .join(" ")}" />`;
    }).join("")}
  </g>
  <circle cx="512" cy="512" r="260" fill="none" stroke="url(#ring)" stroke-width="6" filter="url(#glow)" opacity="0.95"/>
  <circle cx="512" cy="512" r="220" fill="none" stroke="#ff2ec4" stroke-width="2" opacity="0.45"/>
  ${Array.from({ length: 180 }, (_, i) => {
    const a = (i / 180) * Math.PI * 2;
    const rr = 80 + (i % 7) * 38;
    const x = 512 + Math.cos(a) * rr + Math.sin(i * 0.7) * 12;
    const y = 512 + Math.sin(a) * rr + Math.cos(i * 0.5) * 12;
    const c = i % 3 === 0 ? "#00ffe5" : i % 3 === 1 ? "#ff2ec4" : "#b8ff3a";
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" fill="${c}" opacity="0.85"/>`;
  }).join("")}
</svg>`;

const thumbW = 1910;
const thumbH = 1000;

const thumbSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${thumbW} ${thumbH}">
  <defs>
    <linearGradient id="tb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071018"/>
      <stop offset="100%" stop-color="#020308"/>
    </linearGradient>
    <linearGradient id="beam" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#00ffe5" stop-opacity="0"/>
      <stop offset="50%" stop-color="#b8ff3a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ff2ec4" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#tb)"/>
  <rect x="0" y="${thumbH * 0.42}" width="${thumbW}" height="6" fill="url(#beam)" opacity="0.7"/>
  <text x="80" y="${thumbH * 0.35}" font-family="sans-serif" font-weight="900" font-size="72" fill="#00ffe5" opacity="0.95">NEOPULSE FIELD</text>
  <text x="80" y="${thumbH * 0.48}" font-family="sans-serif" font-size="28" fill="#7a9aa3">Swipe-charged containment on Base</text>
  <g transform="translate(${thumbW * 0.62} ${thumbH * 0.35})">
    <circle r="180" fill="none" stroke="#00ffe5" stroke-width="4" opacity="0.6"/>
    <circle r="140" fill="none" stroke="#ff2ec4" stroke-width="2" opacity="0.5"/>
    ${Array.from({ length: 40 }, (_, i) => {
      const a = (i / 40) * Math.PI * 2;
      const rr = 40 + (i % 5) * 28;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      const c = i % 2 ? "#b8ff3a" : "#00ffe5";
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4" fill="${c}"/>`;
    }).join("")}
  </g>
</svg>`;

async function main() {
  const iconBuf = await sharp(Buffer.from(iconSvg)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  const iconPath = join(publicDir, "app-icon.jpg");
  writeFileSync(iconPath, iconBuf);

  const thumbBuf = await sharp(Buffer.from(thumbSvg)).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  const thumbPath = join(publicDir, "app-thumbnail.jpg");
  writeFileSync(thumbPath, thumbBuf);

  console.log("Wrote", iconPath, iconBuf.length, "bytes");
  console.log("Wrote", thumbPath, thumbBuf.length, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
