/**
 * Generates placeholder PNG assets for Collegiate Runner App.
 * Run once with: node scripts/generate-assets.js
 * Replace the output files with real artwork before App Store submission.
 */

const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ── CRC32 ──────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

// ── Chunk builder ──────────────────────────────────────────────────────────
function makeChunk(type, data) {
  const len = Buffer.allocUnsafe(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// ── PNG creator ────────────────────────────────────────────────────────────
function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // colour type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const rowBytes = 1 + width * 3; // filter byte + 3 channels per pixel
  const raw = Buffer.allocUnsafe(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const base = y * rowBytes;
    raw[base] = 0; // filter: None
    for (let x = 0; x < width; x++) {
      raw[base + 1 + x * 3]     = r;
      raw[base + 1 + x * 3 + 1] = g;
      raw[base + 1 + x * 3 + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 1 });

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Write files ────────────────────────────────────────────────────────────
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

const files = [
  { name: 'icon.png',          width: 1024, height: 1024, r: 26,  g: 26,  b: 46  }, // dark navy
  { name: 'adaptive-icon.png', width: 1024, height: 1024, r: 26,  g: 26,  b: 46  }, // dark navy
  { name: 'splash.png',        width: 1284, height: 2778, r: 26,  g: 26,  b: 46  }, // dark navy
];

for (const f of files) {
  const outPath = path.join(assetsDir, f.name);
  if (fs.existsSync(outPath)) {
    console.log(`  SKIP  ${f.name}  (already exists)`);
    continue;
  }
  process.stdout.write(`  Creating ${f.name} (${f.width}x${f.height})…`);
  const png = createPNG(f.width, f.height, f.r, f.g, f.b);
  fs.writeFileSync(outPath, png);
  console.log(` done (${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\nAssets written to ./assets/');
console.log('Replace these placeholder PNGs with real artwork before App Store submission.\n');
