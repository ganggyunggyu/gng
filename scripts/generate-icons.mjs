import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const sizes = [192, 512];
const outputDir = join(process.cwd(), 'public/icons');

// SVG 아이콘 - 심플한 Bold G
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0a0a0a"/>
  <!-- 외곽 C 형태 (두꺼운 원호) -->
  <path fill="white" d="
    M 360 256
    A 104 104 0 1 0 256 360
    L 256 312
    A 56 56 0 1 1 312 256
    L 360 256
    Z
  "/>
  <!-- 가운데 가로막대 -->
  <rect x="256" y="232" width="104" height="48" fill="white"/>
  <!-- 수직막대 -->
  <rect x="312" y="232" width="48" height="80" fill="white"/>
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
