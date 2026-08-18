import * as fs from "fs";
import * as path from "path";

const creditStatusPoolPath = path.join(__dirname, "creditStatusPool.json");

export interface CreditStatusSelection {
  recordId: string;
  statusId: string;
  statusDescription: string;
  creditNoteNo?: string;
  rejectedReasonId?: string;
}

type CreditStatusPool = Record<string, CreditStatusSelection[]>;

function readCreditStatusPool(): CreditStatusPool {
  if (!fs.existsSync(creditStatusPoolPath)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(creditStatusPoolPath, "utf-8"));
  } catch (e) {
    console.error(`Error loading ${creditStatusPoolPath}:`, e);
    return {};
  }
}

function writeCreditStatusPool(pool: CreditStatusPool) {
  fs.writeFileSync(creditStatusPoolPath, JSON.stringify(pool, null, 2));
}

// Persist the credit statuses a Supplier set for a given Order No, so the
// Repairer-side test can verify the same recordId/statusId/description were applied.
export function saveCreditStatusSelections(
  orderNumber: string,
  selections: CreditStatusSelection[],
): void {
  const pool = readCreditStatusPool();
  pool[orderNumber] = selections;
  writeCreditStatusPool(pool);
}

// Load the credit statuses previously saved for a given Order No.
export function loadCreditStatusSelections(
  orderNumber: string,
): CreditStatusSelection[] {
  const pool = readCreditStatusPool();
  return pool[orderNumber] ?? [];
}

// Remove a completed Order No's credit statuses once the Repairer-side has verified them.
export function removeCreditStatusSelections(orderNumber: string): void {
  const pool = readCreditStatusPool();
  delete pool[orderNumber];
  writeCreditStatusPool(pool);
}
