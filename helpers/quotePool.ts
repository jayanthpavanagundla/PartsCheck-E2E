import * as fs from "fs";
import * as path from "path";

const poolPath = path.join(__dirname, "quotePool.json");
const completedPoolPath = path.join(__dirname, "completedQuotePool.json");

function readJsonArray(filePath: string): string[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e);
    return [];
  }
}

function writeJsonArray(filePath: string, values: string[]) {
  fs.writeFileSync(filePath, JSON.stringify(values, null, 2));
}

// Load the active (in-progress) pool.
export function loadQuotePool(): string[] {
  return readJsonArray(poolPath);
}

// Add a quote number to the active pool and persist it.
export function addQuoteToPool(quoteNumber: string): string[] {
  const quotes = loadQuotePool(); // always read latest
  if (!quotes.includes(quoteNumber)) {
    quotes.push(quoteNumber);
  }
  writeJsonArray(poolPath, quotes);
  return quotes;
}

// Remove a quote number from the active pool.
export function removeQuoteFromPool(quoteNumber: string): string[] {
  const updated = loadQuotePool().filter((q) => q !== quoteNumber);
  writeJsonArray(poolPath, updated);
  return updated;
}

// Load the completed pool.
export function loadCompletedQuotePool(): string[] {
  return readJsonArray(completedPoolPath);
}

// Move a quote number into the completed pool once the quote process has
// fully gone through (e.g. after the "submitted successfully" confirmation).
export function addToCompletedPool(quoteNumber: string): string[] {
  const completed = loadCompletedQuotePool();
  if (!completed.includes(quoteNumber)) {
    completed.push(quoteNumber);
  }
  writeJsonArray(completedPoolPath, completed);
  removeQuoteFromPool(quoteNumber);
  return completed;
}
