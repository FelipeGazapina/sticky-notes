import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'assets', 'icons');

// SVG icon: yellow sticky note with folded corner and lines
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="noteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE082"/>
      <stop offset="100%" style="stop-color:#FFD54F"/>
    </linearGradient>
    <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFC107"/>
      <stop offset="100%" style="stop-color:#FFB300"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Note body with rounded corners -->
  <path d="M56,32 h320 l104,104 v344 a32,32 0 0 1 -32,32 H56 a32,32 0 0 1 -32,-32 V64 a32,32 0 0 1 32,-32 Z"
        fill="url(#noteGrad)" filter="url(#shadow)"/>

  <!-- Folded corner -->
  <path d="M376,32 v72 a32,32 0 0 0 32,32 h72 Z"
        fill="url(#foldGrad)"/>

  <!-- Text lines -->
  <rect x="80" y="180" width="280" height="12" rx="6" fill="#C8A415" opacity="0.45"/>
  <rect x="80" y="224" width="320" height="12" rx="6" fill="#C8A415" opacity="0.45"/>
  <rect x="80" y="268" width="240" height="12" rx="6" fill="#C8A415" opacity="0.45"/>
  <rect x="80" y="312" width="300" height="12" rx="6" fill="#C8A415" opacity="0.45"/>
  <rect x="80" y="356" width="180" height="12" rx="6" fill="#C8A415" opacity="0.45"/>
</svg>
`;

async function generate() {
  console.log('Generating icons...');

  // Generate 512x512 PNG
  const png512 = resolve(iconsDir, 'icon.png');
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile(png512);
  console.log('Created icon.png (512x512)');

  // Generate multiple sizes for ICO
  const sizes = [16, 32, 48, 256];
  const pngBuffers = [];

  for (const size of sizes) {
    const buf = await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers.push(buf);
  }

  // Convert to ICO
  const icoBuffer = await pngToIco(pngBuffers);
  const icoPath = resolve(iconsDir, 'icon.ico');
  writeFileSync(icoPath, icoBuffer);
  console.log('Created icon.ico (16, 32, 48, 256)');

  console.log('Done! Icons saved to assets/icons/');
}

generate().catch(console.error);
