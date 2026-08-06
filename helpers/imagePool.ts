import * as fs from "fs";
import * as path from "path";

const imagePoolPath = path.join(__dirname, "imagePool.json");

type ImagePool = Record<string, string[]>;

function readImagePool(): ImagePool {
  if (!fs.existsSync(imagePoolPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(imagePoolPath, "utf-8"));
  } catch (e) {
    console.error(`Error loading ${imagePoolPath}:`, e);
    return {};
  }
}

function writeImagePool(pool: ImagePool) {
  fs.writeFileSync(imagePoolPath, JSON.stringify(pool, null, 2));
}

// Persist the image identifiers a Repairer uploaded for a given quote number.
export function saveQuoteImages(quoteNumber: string, images: string[]): void {
  const pool = readImagePool();
  pool[quoteNumber] = images;
  writeImagePool(pool);
}

// Load the image identifiers previously saved for a given quote number.
export function loadQuoteImages(quoteNumber: string): string[] {
  const pool = readImagePool();
  return pool[quoteNumber] ?? [];
}

// Remove a quote's image identifiers once they've been verified.
export function removeQuoteImages(quoteNumber: string): void {
  const pool = readImagePool();
  delete pool[quoteNumber];
  writeImagePool(pool);
}
