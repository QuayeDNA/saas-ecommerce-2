import fs from "fs";
import sharp from "sharp";
import path from "path";

// Paths
const PUBLIC_DIR = path.resolve("public");
const SOURCE_PNG = path.join(PUBLIC_DIR, "logo.png");

// Inline fallback SVG (kept for backwards compatibility when source PNG is not provided)
const fallbackSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <!-- Caskmaf Datahub brand mark -->
  <rect x="18" y="16" width="16" height="68" rx="8" fill="#1A1A2E" />

  <!-- Network Waves -->
  <path d="M 42 32 A 18 18 0 0 1 42 68" stroke="#0057FF" stroke-width="12" stroke-linecap="round" opacity="0.4" />
  <path d="M 42 16 A 34 34 0 0 1 42 84" stroke="#0057FF" stroke-width="12" stroke-linecap="round" />

  <!-- Brand text: full wording for PWA and larger icons -->
  <text x="50" y="92" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" font-weight="700" fill="#0057FF">Caskmaf Datahub</text>
</svg>`;

function makeSvgWrapperFromPngBase64(base64, width = 1024, height = 1024) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">\n  <image href="data:image/png;base64,${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />\n</svg>`;
}

async function main() {
  let sourceBuffer = null;
  let usingPng = false;

  if (fs.existsSync(SOURCE_PNG)) {
    console.log(`Found source PNG at ${SOURCE_PNG} — using it to generate assets.`);
    sourceBuffer = fs.readFileSync(SOURCE_PNG);
    usingPng = true;
  } else {
    console.log("No source PNG found at public/logo.png — falling back to inline SVG.");
    sourceBuffer = Buffer.from(fallbackSvg);
    usingPng = false;
  }

  // Write SVG wrappers (either embedding the PNG or using the fallback SVG)
  if (usingPng) {
    const base64 = sourceBuffer.toString("base64");
    console.log("source logo.png size:", sourceBuffer.length, "bytes; base64 length:", base64.length);

    const svg192 = makeSvgWrapperFromPngBase64(base64, 192, 192);
    const svg512 = makeSvgWrapperFromPngBase64(base64, 512, 512);
    const svg150 = makeSvgWrapperFromPngBase64(base64, 150, 150);
    const svgFull = makeSvgWrapperFromPngBase64(base64, 1024, 1024);

    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-192.svg"), svg192, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-512.svg"), svg512, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "mstile-150x150.svg"), svg150, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "vite.svg"), svgFull, "utf8");
  } else {
    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-192.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-512.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "mstile-150x150.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "vite.svg"), fallbackSvg, "utf8");
  }

  // Generate PNG outputs using sharp from the source buffer (PNG or SVG)
  await sharp(sourceBuffer)
    .resize(192, 192, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, "android-chrome-192x192.png"));
  console.log("192 png done");

  await sharp(sourceBuffer)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, "android-chrome-512x512.png"));
  console.log("512 png done");

  // Create a mark-only square crop (center) for small favicons (16x16, 32x32)
  let markBuffer = null;
  try {
    const img = sharp(sourceBuffer);
    const meta = await img.metadata();
    const w = meta.width || 512;
    const h = meta.height || 512;
    const size = Math.min(w, h) || 256;
    const left = Math.max(0, Math.floor((w - size) / 2));
    const top = Math.max(0, Math.floor((h - size) / 2));

    markBuffer = await img
      .extract({ left, top, width: size, height: size })
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
  } catch (err) {
    // Fallback: render source to PNG then crop center
    const rendered = await sharp(sourceBuffer).png().toBuffer();
    const img = sharp(rendered);
    const meta = await img.metadata();
    const w = meta.width || 512;
    const h = meta.height || 512;
    const size = Math.min(w, h) || 256;
    const left = Math.max(0, Math.floor((w - size) / 2));
    const top = Math.max(0, Math.floor((h - size) / 2));
    markBuffer = await img.extract({ left, top, width: size, height: size }).resize(512, 512).png().toBuffer();
  }

  // Write mark-only SVG wrappers (embedded PNG base64 inside SVG)
  const markBase64 = markBuffer.toString("base64");
  const markSvg32 = makeSvgWrapperFromPngBase64(markBase64, 32, 32);
  const markSvg16 = makeSvgWrapperFromPngBase64(markBase64, 16, 16);
  const markSvgFull = makeSvgWrapperFromPngBase64(markBase64, 512, 512);
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark.svg"), markSvgFull, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark-32.svg"), markSvg32, "utf8");
  fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark-16.svg"), markSvg16, "utf8");

  // Generate small PNG favicons from the mark buffer (overwrite small default PNGs)
  await sharp(markBuffer)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, "favicon-32x32.png"));
  console.log("32 png (mark-only) done");

  await sharp(markBuffer)
    .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, "favicon-16x16.png"));
  console.log("16 png (mark-only) done");

  // Generate MS tile PNG (keep full-source for tile to preserve branding)
  await sharp(sourceBuffer)
    .resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, "mstile-150x150.png"));
  console.log("150 png done");

  console.log("All replacements complete.");
}

main().catch(console.error);
import fs from "fs";
import sharp from "sharp";
import path from "path";

// Paths
const PUBLIC_DIR = path.resolve("public");
const SOURCE_PNG = path.join(PUBLIC_DIR, "logo.png");

// Inline fallback SVG (kept for backwards compatibility when source PNG is not provided)
const fallbackSvg = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <!-- Caskmaf Datahub brand mark -->
  <rect x="18" y="16" width="16" height="68" rx="8" fill="#1A1A2E" />

  <!-- Network Waves -->
  <path d="M 42 32 A 18 18 0 0 1 42 68" stroke="#0057FF" stroke-width="12" stroke-linecap="round" opacity="0.4" />
  <path d="M 42 16 A 34 34 0 0 1 42 84" stroke="#0057FF" stroke-width="12" stroke-linecap="round" />

  <!-- Brand text: full wording for PWA and larger icons -->
  <text x="50" y="92" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" font-weight="700" fill="#0057FF">Caskmaf Datahub</text>
</svg>`;

function makeSvgWrapperFromPngBase64(base64, width = 1024, height = 1024) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">\n  <image href="data:image/png;base64,${base64}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />\n</svg>`;
}

async function main() {
  let sourceBuffer = null;
  let usingPng = false;

  if (fs.existsSync(SOURCE_PNG)) {
    console.log(
      `Found source PNG at ${SOURCE_PNG} — using it to generate assets.`,
    );
    sourceBuffer = fs.readFileSync(SOURCE_PNG);
    usingPng = true;
  } else {
    console.log(
      "No source PNG found at public/logo.png — falling back to inline SVG.",
    );
    sourceBuffer = Buffer.from(fallbackSvg);
    usingPng = false;
  }

  // Generate SVG wrappers: if using PNG source, embed base64 PNG inside an SVG wrapper;
  // otherwise just write the fallback SVG to the svg files.
  if (usingPng) {
    const base64 = sourceBuffer.toString("base64");
    console.log(
      "source logo.png size:",
      sourceBuffer.length,
      "bytes; base64 length:",
      base64.length,
    );
    const svg192 = makeSvgWrapperFromPngBase64(base64, 192, 192);
    const svg512 = makeSvgWrapperFromPngBase64(base64, 512, 512);
    const svg150 = makeSvgWrapperFromPngBase64(base64, 150, 150);
    const svgFull = makeSvgWrapperFromPngBase64(base64, 1024, 1024);

    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo.svg"), svgFull, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-192.svg"), svg192, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo-512.svg"), svg512, "utf8");
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "mstile-150x150.svg"),
      svg150,
      "utf8",
    );
    fs.writeFileSync(path.join(PUBLIC_DIR, "vite.svg"), svgFull, "utf8");
  } else {
    // fallback: write the inline SVG to files
    fs.writeFileSync(path.join(PUBLIC_DIR, "favicon.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "icon.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(path.join(PUBLIC_DIR, "logo.svg"), fallbackSvg, "utf8");
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "logo-192.svg"),
      fallbackSvg,
      "utf8",
    );
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "logo-512.svg"),
      fallbackSvg,
      "utf8",
    );
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "mstile-150x150.svg"),
      fallbackSvg,
      "utf8",
    );
    fs.writeFileSync(path.join(PUBLIC_DIR, "vite.svg"), fallbackSvg, "utf8");
  }

  // Generate PNG outputs using sharp from the source buffer (PNG or SVG)
  await sharp(sourceBuffer)
    .resize(192, 192, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(PUBLIC_DIR, "android-chrome-192x192.png"));
      await sharp(sourceBuffer)
        .resize(192, 192, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(PUBLIC_DIR, "android-chrome-192x192.png"));
      console.log("192 png done");

      await sharp(sourceBuffer)
        .resize(512, 512, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toFile(path.join(PUBLIC_DIR, "android-chrome-512x512.png"));
      console.log("512 png done");

      // Create a mark-only square crop (center) for small favicons (16x16, 32x32)
      let markBuffer = null;
      try {
        const img = sharp(sourceBuffer);
        const meta = await img.metadata();
        const w = meta.width || 512;
        const h = meta.height || 512;
        const size = Math.min(w, h) || 256;
        const left = Math.max(0, Math.floor((w - size) / 2));
        const top = Math.max(0, Math.floor((h - size) / 2));
        markBuffer = await img
          .extract({ left, top, width: size, height: size })
          .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toBuffer();
      } catch (err) {
        // Fallback: render source to PNG then crop center
        const rendered = await sharp(sourceBuffer).png().toBuffer();
        const img = sharp(rendered);
        const meta = await img.metadata();
        const w = meta.width || 512;
        const h = meta.height || 512;
        const size = Math.min(w, h) || 256;
        const left = Math.max(0, Math.floor((w - size) / 2));
        const top = Math.max(0, Math.floor((h - size) / 2));
        markBuffer = await img.extract({ left, top, width: size, height: size }).resize(512, 512).png().toBuffer();
      }

      // Write mark-only SVG wrappers (embedded PNG base64 inside SVG)
      const markBase64 = markBuffer.toString("base64");
      const markSvg32 = makeSvgWrapperFromPngBase64(markBase64, 32, 32);
      const markSvg16 = makeSvgWrapperFromPngBase64(markBase64, 16, 16);
      const markSvgFull = makeSvgWrapperFromPngBase64(markBase64, 512, 512);
      fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark.svg"), markSvgFull, "utf8");
      fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark-32.svg"), markSvg32, "utf8");
      fs.writeFileSync(path.join(PUBLIC_DIR, "favicon-mark-16.svg"), markSvg16, "utf8");

      // Generate small PNG favicons from the mark buffer (overwrite small default PNGs)
      await sharp(markBuffer)
        .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(PUBLIC_DIR, "favicon-32x32.png"));
      console.log("32 png (mark-only) done");

      await sharp(markBuffer)
        .resize(16, 16, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(PUBLIC_DIR, "favicon-16x16.png"));
      console.log("16 png (mark-only) done");

      // Generate MS tile PNG (keep full-source for tile to preserve branding)
      await sharp(sourceBuffer)
        .resize(150, 150, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(PUBLIC_DIR, "mstile-150x150.png"));
      console.log("150 png done");
