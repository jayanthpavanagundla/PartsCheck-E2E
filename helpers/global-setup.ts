import * as fs from "fs";
import * as path from "path";

// Cross-test-file state (quote numbers, uploaded image/attachment identifiers,
// credit status selections) is handed off between projects via these JSON
// pool files. Reset them to empty before every run so a run never starts by
// picking up leftover state from a previous, possibly incomplete run.
const ARRAY_POOLS = [
  "normalQuotePool.json",
  "directQuotePool.json",
  "completedNormalQuotePool.json",
  "completedDirectQuotePool.json",
];

const OBJECT_POOLS = [
  "imagePool.json",
  "attachmentPool.json",
  "creditStatusPool.json",
];

export default function globalSetup() {
  const stateDir = path.join(__dirname, "state");

  for (const file of ARRAY_POOLS) {
    fs.writeFileSync(path.join(stateDir, file), JSON.stringify([], null, 2));
  }

  for (const file of OBJECT_POOLS) {
    fs.writeFileSync(path.join(stateDir, file), JSON.stringify({}, null, 2));
  }
}
