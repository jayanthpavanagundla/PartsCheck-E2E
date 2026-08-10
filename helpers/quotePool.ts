import * as fs from "fs";
import * as path from "path";

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

interface QuotePool {
  load(): string[];
  add(quoteNumber: string): string[];
  remove(quoteNumber: string): string[];
  loadCompleted(): string[];
  addToCompleted(quoteNumber: string): string[];
}

// Normal Quote and Direct Purchase quotes follow separate flows end-to-end,
// so each gets its own active/completed pool pair (quote numbers must not
// cross over between them).
function createQuotePool(poolFile: string, completedPoolFile: string): QuotePool {
  const poolPath = path.join(__dirname, poolFile);
  const completedPoolPath = path.join(__dirname, completedPoolFile);

  function load(): string[] {
    return readJsonArray(poolPath);
  }

  function add(quoteNumber: string): string[] {
    const quotes = load(); // always read latest
    if (!quotes.includes(quoteNumber)) {
      quotes.push(quoteNumber);
    }
    writeJsonArray(poolPath, quotes);
    return quotes;
  }

  function remove(quoteNumber: string): string[] {
    const updated = load().filter((q) => q !== quoteNumber);
    writeJsonArray(poolPath, updated);
    return updated;
  }

  function loadCompleted(): string[] {
    return readJsonArray(completedPoolPath);
  }

  function addToCompleted(quoteNumber: string): string[] {
    const completed = loadCompleted();
    if (!completed.includes(quoteNumber)) {
      completed.push(quoteNumber);
    }
    writeJsonArray(completedPoolPath, completed);
    remove(quoteNumber);
    return completed;
  }

  return { load, add, remove, loadCompleted, addToCompleted };
}

const normalQuotePool = createQuotePool(
  "normalQuotePool.json",
  "completedNormalQuotePool.json",
);
const directQuotePool = createQuotePool(
  "directQuotePool.json",
  "completedDirectQuotePool.json",
);

// --- Normal Quote pool -------------------------------------------------------
export const loadNormalQuotePool = normalQuotePool.load;
export const addQuoteToNormalPool = normalQuotePool.add;
export const removeQuoteFromNormalPool = normalQuotePool.remove;
export const loadCompletedNormalQuotePool = normalQuotePool.loadCompleted;
export const addToCompletedNormalPool = normalQuotePool.addToCompleted;

// --- Direct Purchase Quote pool ----------------------------------------------
export const loadDirectQuotePool = directQuotePool.load;
export const addQuoteToDirectPool = directQuotePool.add;
export const removeQuoteFromDirectPool = directQuotePool.remove;
export const loadCompletedDirectQuotePool = directQuotePool.loadCompleted;
export const addToCompletedDirectPool = directQuotePool.addToCompleted;
