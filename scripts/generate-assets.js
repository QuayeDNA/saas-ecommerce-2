import fs from "fs";
import sharp from "sharp";

const svg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <!-- Minimalist D-pillar -->
  <rect x="18" y="16" width="16" height="68" rx="8" fill="#1A1A2E" />
  
  <!-- Network Waves -->
  <path d="M 42 32 A 18 18 0 0 1 42 68" stroke="#0057FF" stroke-width="12" stroke-linecap="round" opacity="0.4" />
  <path d="M 42 16 A 34 34 0 0 1 42 84" stroke="#0057FF" stroke-width="12" stroke-linecap="round" />
</svg>`;

async function main() {
  fs.writeFileSync("public/favicon.svg", svg);
  fs.writeFileSync("public/icon.svg", svg);
  fs.writeFileSync("public/logo-192.svg", svg);
  fs.writeFileSync("public/logo-512.svg", svg);
  fs.writeFileSync("public/vite.svg", svg);

  await sharp(Buffer.from(svg))
    .resize(192, 192)
    .png()
    .toFile("public/android-chrome-192x192.png");
  console.log("192 png done");
  await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toFile("public/android-chrome-512x512.png");
  console.log("512 png done");
  await sharp(Buffer.from(svg))
    .resize(32, 32)
    .png()
    .toFile("public/favicon-32x32.png");
  console.log("32 png done");
  await sharp(Buffer.from(svg))
    .resize(16, 16)
    .png()
    .toFile("public/favicon-16x16.png");
  console.log("16 png done");

  console.log("All replacements complete.");
}

main().catch(console.error);
