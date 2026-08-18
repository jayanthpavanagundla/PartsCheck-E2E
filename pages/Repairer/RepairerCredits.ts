import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
import { CreditStatusSelection } from "../../helpers/creditStatusPool.js";

// The Repairer's Credit Management grid shows a shorter/different label than
// the Supplier's status description for the same underlying credit status.
const REPAIRER_STATUS_LABELS: Record<string, string> = {
  "Return Arranged": "Return Arranged",
  "Pickup Required": "Pickup Reqd",
  "Inspection Pending": "Inspection Reqd",
  Approved: "Approved",
  Rejected: "Rejected",
};
//=============================CREDITS TAB=============================//
export class OrdersTab {
  // Locators
  orders: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.orders = this.page.locator("span.topTabText", {
      hasText: "All Orders",
    });
  }
  // Methods
  async clickOrders() {
    await step("Click on Orders Tab", async () => {
      await this.orders.click();
      await expect(this.page).toHaveURL(/orders\.php\?action=orders$/);
    });
  }
}
//=============================CREDIT MANAGEMENT TAB=============================//
export class CreditManagementTab {
  // Locators
  creditManagement: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.creditManagement = this.page.locator("span.topTabText", {
      hasText: "Credit Management",
    });
  }
  // Methods
  async clickCreditManagement() {
    await step("Click on Credit Management Tab", async () => {
      await this.creditManagement.click();
      await expect(this.page).toHaveURL(
        /orders\.php\?action=creditManagement$/,
      );
    });
  }

  // Preview toggle for a given supplier - data-supplierid is "<internal id>|<supplierName>"
  previewButton(supplierName: string): Locator {
    return this.page.locator(
      `.gridrow.supplierline[data-supplierid$='|${supplierName}'] .previewBtn:visible`,
    );
  }

  async clickSupplierPreview(supplierName: string): Promise<void> {
    await step(`Click 'Preview' for supplier '${supplierName}'`, async () => {
      await this.previewButton(supplierName).click();
    });
  }

  async verifySupplierPreviewExpanded(supplierName: string): Promise<void> {
    await step(`Verify supplier '${supplierName}' preview panel is expanded ('Hide' shown)`, async () => {
        await expect(this.previewButton(supplierName)).toHaveText("Hide");
      },
    );
  }

  // A credited part's row/status label, located by the Supplier-side recordId.
  // Same markup repeats hidden across the All/Rejected/Pending/Approved sub-tabs,
  // so :visible scopes each locator to whichever copy is currently on screen.
  partRecordRow(recordId: string): Locator {
    return this.page.locator(`.poRecordNo[data-id='${recordId}']:visible`);
  }

  partStatusLabel(recordId: string): Locator {
    return this.page.locator(`.poStatus[data-id='${recordId}']:visible span`);
  }

  // Compares every recordId/statusId/statusDescription the Supplier saved for this
  async verifyCreditStatusSelections(selections: CreditStatusSelection[]): Promise<void> {
    await step(`Verify ${selections.length} credited part status(es) match what the Supplier set`, async () => {
        for (let i = 0; i < selections.length; i++) {
          const { recordId, statusId, statusDescription } = selections[i];
          const expectedLabel = REPAIRER_STATUS_LABELS[statusDescription] ?? statusDescription;
          const partLabel = `Part ${String(i + 1).padStart(2, "0")}`;

          await step(`${partLabel} (record '${recordId}') - expected statusId '${statusId}' ('${expectedLabel}')`, async () => {
              await expect(this.partRecordRow(recordId)).toBeVisible();
            },
          );

          const actualLabel = (await this.partStatusLabel(recordId).innerText()).trim();

          await step(`${partLabel} (record '${recordId}') - received status '${actualLabel}'`, async () => {
              expect(actualLabel).toBe(expectedLabel);
            },
          );
        }
      },
    );
  }
}
//=============================REPAIRER CREDIT MANAGEMENT=======================//
export class RepairerCredits {
  readonly ordersTab: OrdersTab;
  readonly creditManagement: CreditManagementTab;

  constructor(page: Page) {
    this.ordersTab = new OrdersTab(page);
    this.creditManagement = new CreditManagementTab(page);
  }
}