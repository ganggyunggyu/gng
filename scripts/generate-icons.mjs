import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [192, 512];
const outputDir = join(process.cwd(), 'public/icons');

// SVG 아이콘 (검은 배경 + 흰색 G)
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <text x="256" y="340" text-anchor="middle" font-family="system-ui, sans-serif" font-size="280" font-weight="900" fill="white">G</text>
</svg>
`;

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(join(outputDir, `icon-${size}.png`));

    console.log(`Generated icon-${size}.png`);
  }

  // Apple touch icon
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(join(process.cwd(), 'public/apple-touch-icon.png'));

  console.log('Generated apple-touch-icon.png');
}

generateIcons().catch(console.error);
