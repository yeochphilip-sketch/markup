/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * One-off brand asset generator. Renders the MARKUP mark (dark tile, indigo M)
 * to app/favicon.ico, app/apple-icon.png and public/og-image.png using sharp.
 *
 * Run: node scripts/generate-brand-assets.js
 * Safe to delete this file afterwards; re-run any time the brand art changes.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, '..', 'app');
const publicDir = path.join(__dirname, '..', 'public');

const BRAND_BG = '#07090e';      // site background
const BRAND_INDIGO = '#6366f1';  // indigo-500 accent
const BRAND_INDIGO_LIGHT = '#818cf8';

/**
 * Render the brand mark into a square canvas of the given size.
 * Painted as an SVG so sharp can rasterise it crisply at any resolution.
 */
function brandMarkSvg(size) {
  const scale = size / 512;
  const fontSize = Math.round(360 * scale);
  return Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${Math.round(96 * scale)}" fill="${BRAND_BG}"/>
      <rect x="${Math.round(10 * scale)}" y="${Math.round(10 * scale)}" width="${size - Math.round(20 * scale)}" height="${size - Math.round(20 * scale)}" rx="${Math.round(86 * scale)}" fill="none" stroke="${BRAND_INDIGO}" stroke-opacity="0.35" stroke-width="${Math.max(1, Math.round(8 * scale))}"/>
      <text x="${size / 2}" y="${size / 2}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900" fill="${BRAND_INDIGO_LIGHT}" text-anchor="middle" dominant-baseline="central">M</text>
    </svg>
  `);
}

/** og:image / twitter:image — 1200x630, matching the landing hero aesthetic. */
function ogImageSvg() {
  return Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="0%" r="90%">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.22"/>
          <stop offset="60%" stop-color="#6366f1" stop-opacity="0.04"/>
          <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="630" fill="${BRAND_BG}"/>
      <rect width="1200" height="630" fill="url(#glow)"/>

      <!-- Brand tile -->
      <rect x="80" y="150" width="96" height="96" rx="22" fill="#0b0f18" stroke="#6366f1" stroke-opacity="0.5" stroke-width="2"/>
      <text x="128" y="198" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="900" fill="#818cf8" text-anchor="middle" dominant-baseline="central">M</text>

      <text x="200" y="216" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="900" fill="#ffffff" letter-spacing="6">MARKUP</text>

      <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" fill="#ffffff">Master the O-Level</text>
      <text x="80" y="415" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="900" fill="#818cf8">Humanities with AI</text>

      <text x="80" y="490" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="400" fill="#94a3b8">SBQ · SEQ · SRQ — graded instantly against the LORMS rubric.</text>
      <text x="80" y="528" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="400" fill="#64748b">Built for Singapore SEAB Social Studies &amp; Elective History.</text>

      <text x="80" y="580" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="#64748b" letter-spacing="3">LORMS · SEAB SYLLABUS · SINGAPORE</text>
    </svg>
  `);
}

/**
 * Build a multi-size .ico: BMP frames for 16/32/48 (max compatibility) and a
 * PNG-compressed 256px frame (standard practice — keeps the file small).
 */
async function buildIco(filePath) {
  const sizes = [16, 32, 48, 256];
  const frames = [];
  for (const s of sizes) {
    const { data } = await sharp(brandMarkSvg(256))
      .resize(s, s)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    frames.push({ size: s, data });
  }

  const parts = [];
  let offset = 6 + frames.length * 16; // ICONDIR + ICONDIRENTRYs
  const entries = [];

  for (const { size, data } of frames) {
    if (size <= 48) {
      // BMP-in-ICO: BITMAPINFOHEADER (height doubled for XOR+AND), BGRA rows
      // bottom-up, then an all-zero AND mask (image is fully opaque).
      const header = Buffer.alloc(40);
      header.writeUInt32LE(40, 0);
      header.writeInt32LE(size, 4);
      header.writeInt32LE(size * 2, 8);
      header.writeUInt16LE(1, 12);
      header.writeUInt16LE(32, 14);
      const xor = Buffer.alloc(size * size * 4);
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const si = ((size - 1 - y) * size + x) * 4;
          const di = (y * size + x) * 4;
          xor[di] = data[si + 2]; // B
          xor[di + 1] = data[si + 1]; // G
          xor[di + 2] = data[si]; // R
          xor[di + 3] = data[si + 3]; // A
        }
      }
      const andMask = Buffer.alloc(Math.ceil(size / 32) * 4 * size);
      const body = Buffer.concat([header, xor, andMask]);
      entries.push({ size, body, png: false });
    } else {
      // 256px frame: PNG-compressed inside the ICO container
      const png = await sharp(brandMarkSvg(256)).resize(size, size).png().toBuffer();
      entries.push({ size, body: png, png: true });
    }
  }

  for (const e of entries) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(e.size >= 256 ? 0 : e.size, 0); // width (0 = 256)
    entry.writeUInt8(e.size >= 256 ? 0 : e.size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(e.body.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += e.body.length;
    parts.push(entry);
  }

  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2); // type: icon
  dir.writeUInt16LE(entries.length, 4);

  fs.writeFileSync(filePath, Buffer.concat([dir, ...parts, ...entries.map((e) => e.body)]));
}

async function main() {
  // favicon.ico — Next.js convention: app/favicon.ico
  await buildIco(path.join(appDir, 'favicon.ico'));

  // apple-icon.png — Next.js convention: app/apple-icon.png (180x180)
  await sharp(brandMarkSvg(512))
    .resize(180, 180)
    .png()
    .toFile(path.join(appDir, 'apple-icon.png'));

  // icon.png — Next.js convention: high-res favicon for tabs/PWA (512x512).
  // Replaces the stale 892KB starter icon with a compact branded mark.
  await sharp(brandMarkSvg(512))
    .resize(512, 512)
    .png({ compressionLevel: 9 })
    .toFile(path.join(appDir, 'icon.png'));

  // og-image.png — referenced from layout metadata + JSON-LD
  await sharp(ogImageSvg())
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('✅ Generated app/favicon.ico (16/32/48/256), app/icon.png, app/apple-icon.png, public/og-image.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
