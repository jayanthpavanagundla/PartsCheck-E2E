import * as fs from "fs";
import * as path from "path";

const attachmentPoolPath = path.join(__dirname, "attachmentPool.json");

type AttachmentPool = Record<string, string[]>;

function readAttachmentPool(): AttachmentPool {
  if (!fs.existsSync(attachmentPoolPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(attachmentPoolPath, "utf-8"));
  } catch (e) {
    console.error(`Error loading ${attachmentPoolPath}:`, e);
    return {};
  }
}

function writeAttachmentPool(pool: AttachmentPool) {
  fs.writeFileSync(attachmentPoolPath, JSON.stringify(pool, null, 2));
}

// Persist the attachment file names a Supplier uploaded for a given quote number.
export function saveQuoteAttachments(
  quoteNumber: string,
  attachments: string[],
): void {
  const pool = readAttachmentPool();
  pool[quoteNumber] = attachments;
  writeAttachmentPool(pool);
}

// Load the attachment file names previously saved for a given quote number.
export function loadQuoteAttachments(quoteNumber: string): string[] {
  const pool = readAttachmentPool();
  return pool[quoteNumber] ?? [];
}

// Remove a quote's attachment file names once they've been verified.
export function removeQuoteAttachments(quoteNumber: string): void {
  const pool = readAttachmentPool();
  delete pool[quoteNumber];
  writeAttachmentPool(pool);
}

// Pick `count` random PDF files out of helpers/ (the attachment source
// files live alongside quotePool.json/Img01-03.jpg), returning absolute paths.
export function getRandomAttachmentFiles(count: number): string[] {
  const files = fs
    .readdirSync(__dirname)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (files.length < count) {
    throw new Error(
      `Not enough .pdf files in ${__dirname} to pick ${count} (found ${files.length})`,
    );
  }

  const shuffled = [...files].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((f) => path.join(__dirname, f));
}
