import fs from "fs";
import path from "path";
import sharp from "sharp";

const INPUT = path.resolve("public/logo.png");
const OUT_JSON = path.resolve("src/styles/palette.json");

function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b]
      .map((v) => {
        const s = Math.round(v).toString(16);
        return s.length === 1 ? "0" + s : s;
      })
      .join("")
  ).toUpperCase();
}

function distanceSq(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function kmeans(pixels, k = 6, maxIter = 20) {
  if (pixels.length === 0) return [];
  // initialize centers by sampling k distinct pixels
  const centers = [];
  const used = new Set();
  while (centers.length < Math.min(k, pixels.length)) {
    const idx = Math.floor(Math.random() * pixels.length);
    if (used.has(idx)) continue;
    used.add(idx);
    centers.push(pixels[idx].slice());
  }

  for (let iter = 0; iter < maxIter; iter++) {
    const clusters = Array.from({ length: centers.length }, () => []);

    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i];
      let best = 0;
      let bestDist = distanceSq(p, centers[0]);
      for (let c = 1; c < centers.length; c++) {
        const d = distanceSq(p, centers[c]);
        if (d < bestDist) {
          bestDist = d;
          best = c;
        }
      }
      clusters[best].push(p);
    }

    let moved = false;
    for (let c = 0; c < centers.length; c++) {
      const cluster = clusters[c];
      if (cluster.length === 0) continue;
      const mean = [0, 0, 0];
      for (const px of cluster) {
        mean[0] += px[0];
        mean[1] += px[1];
        mean[2] += px[2];
      }
      mean[0] /= cluster.length;
      mean[1] /= cluster.length;
      mean[2] /= cluster.length;
      if (distanceSq(mean, centers[c]) > 1) {
        centers[c] = mean;
        moved = true;
      }
    }

    if (!moved) break;
  }

  // compute counts
  const counts = centers.map(() => 0);
  for (const p of pixels) {
    let best = 0;
    let bestDist = distanceSq(p, centers[0]);
    for (let c = 1; c < centers.length; c++) {
      const d = distanceSq(p, centers[c]);
      if (d < bestDist) {
        bestDist = d;
        best = c;
      }
    }
    counts[best]++;
  }

  const results = centers.map((c, i) => ({
    color: c.map((v) => Math.round(v)),
    count: counts[i],
  }));
  results.sort((a, b) => b.count - a.count);
  return results;
}

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error("Logo not found:", INPUT);
    process.exit(1);
  }

  const { data, info } = await sharp(INPUT)
    .resize(128, 128, { fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const pixels = [];
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = channels >= 4 ? data[i + 3] : 255;
    // ignore mostly-transparent pixels
    if (a < 40) continue;
    pixels.push([r, g, b]);
  }

  if (pixels.length === 0) {
    console.error("No opaque pixels found in image.");
    process.exit(1);
  }

  const k = 6;
  const clusters = kmeans(pixels, k, 30);
  const hexes = clusters.map((c) => ({
    hex: rgbToHex(c.color),
    count: c.count,
  }));

  const out = { palette: hexes };
  // ensure output directory exists
  const outDir = path.dirname(OUT_JSON);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2), "utf8");

  console.log("Extracted palette:");
  console.log(JSON.stringify(hexes, null, 2));
  console.log("Wrote", OUT_JSON);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
