import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
import { DataGenerators } from "../../helpers/DataGenerators";
//=============================ORDERS TAB=============================//
export class OrdersTab {
  // Locators
  orders: Locator;
  allOrdersGrid: Locator;
  quoteText: Locator;
  documentsTab: Locator;
  documentRows: Locator;
  cancelItemsButton: Locator;
  itemSelectCheckboxes: Locator;
  referenceInput: Locator;
  updatePurchaserOrderButton: Locator;
  cancelItemFrame: FrameLocator;
  cancelReasonSelect: Locator;
  cancelItemOkButton: Locator;
  showCancelledPartsCheckbox: Locator;
  cancelledRows: Locator;
  receiptDateInput: Locator;
  searchedQuoteTabText: Locator;
  creditRequestButton: Locator;
  creditItemFrame: FrameLocator;
  creditRequestByDropdown: Locator;
  creditReasonSelect: Locator;
  creditItemOkButton: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.orders = this.page.locator("span.topTabText", {hasText: "All Orders"});
    this.allOrdersGrid = this.page.locator("#all");
    this.quoteText = this.page.locator("div.quoteText");
    this.documentsTab = this.page.locator("span.topTabText", {hasText: "Documents"});
    this.documentRows = this.page.locator(".show .docRow:not([style])");
    this.cancelItemsButton = this.page.locator("#cancelButton");
    this.itemSelectCheckboxes = this.page.locator(".itemSelectCheckbox");
    this.referenceInput = this.page.locator("#RIN");
    this.updatePurchaserOrderButton = this.page.locator("#updatePoPurchaser");
    this.cancelItemFrame = this.page.frameLocator("iframe.cboxIframe");
    this.cancelReasonSelect = this.cancelItemFrame.locator("#cancelItem");
    this.cancelItemOkButton = this.cancelItemFrame.locator(".iframeOKButton");
    this.showCancelledPartsCheckbox = this.page.locator("#removedPartsDiv");
    this.cancelledRows = this.page.locator(".canceldRow");
    this.receiptDateInput = this.page.locator("#RECEIPTDATE_DATE");
    this.searchedQuoteTabText = this.page.locator(".topTab.topTabSelected .topTabText");
    this.creditRequestButton = this.page.locator("#creditButton");
    this.creditItemFrame = this.page.frameLocator("iframe.cboxIframe");
    this.creditRequestByDropdown = this.creditItemFrame.locator("#CRL");
    this.creditReasonSelect = this.creditItemFrame.locator("#CRR");
    this.creditItemOkButton = this.creditItemFrame.locator(".iframeOKButton");
  }
  // Methods
  async clickAllOrders() {
    await step("Click on Orders Tab", async () => {
      await this.orders.click();
      await expect(this.page).toHaveURL(/orders\.php\?action=orders$/);
    });
  }

  orderRow(quoteNumber: string): Locator {
    return this.allOrdersGrid
      .locator(".gridrow.orderline", {
        has: this.page.getByText(quoteNumber, { exact: true }),
      })
      .first();
  }

  async getOrderNumber(quoteNumber: string): Promise<string> {
    return await step(
      `Get order number for quote '${quoteNumber}'`,
      async () => {
        const cellText = await this.orderRow(quoteNumber)
          .locator("> div")
          .nth(2)
          .innerText();
        return cellText.split("\n")[0].trim();
      },
    );
  }

  async openOrderByQuoteNumber(quoteNumber: string): Promise<void> {
    await step(
      `Open order for quote '${quoteNumber}' from All Orders`,
      async () => {
        await this.orderRow(quoteNumber).locator(".l_greenButton").click();
      },
    );
  }

  async verifyOrderNumber(orderNumber: string): Promise<void> {
    await step(`Verify order number '${orderNumber}' is visible`, async () => {
      await expect(this.quoteText).toHaveText(`ORDER: ${orderNumber}`);
    });
  }

  async clickDocuments(): Promise<void> {
    await step('Click "Documents" tab', async () => {
      await this.documentsTab.click();
      await expect(this.documentRows.first()).toBeVisible();
    });
  }

  async getDocumentFileNames(): Promise<string[]> {
    return await step("Get attached document file names", async () => {
      const rows = await this.documentRows.all();
      const names: string[] = [];
      for (const row of rows) {
        const text = await row.locator("> div").nth(1).innerText();
        names.push(text.trim());
      }
      return names;
    });
  }

  async verifyAttachments(expectedFileNames: string[]): Promise<void> {
    const actualFileNames = await this.getDocumentFileNames();
    const expectedSorted = [...expectedFileNames].sort();
    const actualSorted = [...actualFileNames].sort();

    await step(`Verify attached documents:\nExpected: [${expectedSorted.join(", ")}]\nReceived: [${actualSorted.join(", ")}]`, async () => {
        expect(actualSorted).toEqual(expectedSorted);
      },
    );
  }

  async clickCancelItems(): Promise<void> {
    await step("Click 'Cancel Items' button", async () => {
      await this.cancelItemsButton.click();
    });
  }

  private pickRandomIndices(count: number, total: number): number[] {
    const indices = Array.from({ length: total }, (_, i) => i);
    const picked: number[] = [];
    for (let i = 0; i < count && indices.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * indices.length);
      picked.push(indices.splice(randomIndex, 1)[0]);
    }
    return picked;
  }

  async selectItemsToCancel(count: number = 4): Promise<string[]> {
    const total = await this.itemSelectCheckboxes.count();
    const indices = this.pickRandomIndices(count, total);

    const selections: { checkboxId: string; description: string }[] = [];
    for (const index of indices) {
      const checkbox = this.itemSelectCheckboxes.nth(index);
      const checkboxId = await checkbox.getAttribute("id");
      const itemId = await checkbox.getAttribute("data-id");
      const description = (
        await this.page.locator(`#PO_ITEM_${itemId} .orderDes`).innerText()
      )
        .split("\n")[0]
        .trim();
      selections.push({ checkboxId: checkboxId!, description });
    }

    await step(
      `Select ${count} order items to cancel: [${selections.map((s) => s.description).join(", ")}]`,
      async () => {
        for (const { checkboxId } of selections) {
          await this.page.locator(`label[for="${checkboxId}"]`).click();
        }
      },
    );

    return selections.map((s) => s.description);
  }

  async fillCancelReferenceNumber(quoteNumber: string): Promise<string> {
    return await step("Fill cancel reference number in 'RIN' field", async () => {
        const reference = `CANCEL${quoteNumber}-${DataGenerators.randomString("", 5)}`;
        await this.referenceInput.fill(reference);
        return reference;
      },
    );
  }

  async clickUpdatePurchaserOrder(): Promise<void> {
    await step("Click 'update' to submit the cancel request", async () => {
      await this.updatePurchaserOrderButton.click();
    });
  }

  async selectCancelReasonAndConfirm(): Promise<string> {
    return await step("Select a random cancel reason and confirm in 'Cancel Item' dialog", async () => {
        await expect(this.cancelReasonSelect).toBeVisible();
        const reason = await DataGenerators.selectRandomOption(this.cancelReasonSelect);
        await this.cancelItemOkButton.click();
        return reason;
      },
    );
  }

  async verifyCancelledItemsVisible(cancelledItems: string[]): Promise<void> {
    await step("Show cancelled parts and verify cancelled items are visible", async () => {
        await this.page.locator('label[for="removedPartsDiv"]').click();
        await expect(this.cancelledRows.first()).toBeVisible();

        for (const item of cancelledItems) {
          await step(`Verify cancelled item '${item}' is visible`, async () => {
            await expect(this.cancelledRows.filter({ hasText: item }).first()).toBeVisible();
          });
        }
      },
    );
  }

  async selectAllItems(): Promise<{ itemId: string; description: string }[]> {
    const total = await this.itemSelectCheckboxes.count();

    const selections: { checkboxId: string; itemId: string; description: string }[] = [];
    for (let index = 0; index < total; index++) {
      const checkbox = this.itemSelectCheckboxes.nth(index);
      const checkboxId = await checkbox.getAttribute("id");
      const itemId = await checkbox.getAttribute("data-id");
      const description = (await this.page.locator(`#PO_ITEM_${itemId} .orderDes`).innerText()).split("\n")[0].trim();
      selections.push({ checkboxId: checkboxId!, itemId: itemId!, description });
    }

    await step(`Select all ${total} order items: [${selections.map((s) => s.description).join(", ")}]`, async () => {
        for (const { checkboxId } of selections) {
          await this.page.locator(`label[for="${checkboxId}"]`).click();
        }
      },
    );

    return selections.map(({ itemId, description }) => ({ itemId, description }));
  }

  async fillReceiptReferenceNumber(quoteNumber: string): Promise<string> {
    return await step("Fill receipt reference number in 'RIN' field", async () => {
        const reference = `RP-${quoteNumber}-${DataGenerators.randomString("", 5)}`;
        await this.referenceInput.fill(reference);
        return reference;
      },
    );
  }

  async getInvoiceDate(): Promise<string> {
    return await step("Get invoice/receipt date", async () => {
      return await this.receiptDateInput.inputValue();
    });
  }

  itemStatus(itemId: string): Locator {
    return this.page.locator(`#EXTRA_INFO_${itemId}`);
  }

  async verifyItemsReceivedOnDate( receivedItems: { itemId: string; description: string }[], expectedDate: string): Promise<void> {
    await step(`Verify all received items show status 'Received On ${expectedDate}'`, async () => {
        for (const { itemId, description } of receivedItems) {
          await step(`Verify item '${description}' status shows 'Received On ${expectedDate}'`, async () => {
              await expect(this.itemStatus(itemId)).toContainText("Received");
              await expect(this.itemStatus(itemId)).toContainText(expectedDate);
            },
          );
        }
      },
    );
  }

  async verifySearchedQuoteNumber(quoteNumber: string): Promise<void> {
    await step(`Verify searched quote number '${quoteNumber}' matches the search results tab`, async () => {
        await expect(this.searchedQuoteTabText).toHaveText(quoteNumber);
      },
    );
  }

  purchaserOrderRow(supplier: string): Locator {
    return this.page
      .locator(".sub_containter .sub")
      .filter({ has: this.page.locator('a[href*="orders-grid.php"]') })
      .filter({ has: this.page.locator(".info", { hasText: supplier }) })
      .first();
  }

  async openPurchaserOrderBySupplier(supplier: string): Promise<void> {
    await step(`Open purchaser order for supplier '${supplier}' from search results`, async () => {
        await this.purchaserOrderRow(supplier)
          .getByText("Open", { exact: true })
          .click();
      },
    );
  }

  async clickCreditRequest(): Promise<void> {
    await step("Click 'Credit Request' button", async () => {
      await this.creditRequestButton.click();
    });
  }

  async fillCreditReferenceNumber(quoteNumber: string): Promise<string> {
    return await step("Fill credit reference number in 'RIN' field", async () => {
        const reference = `CR-${quoteNumber}-${DataGenerators.randomString("", 5)}`;
        await this.referenceInput.fill(reference);
        return reference;
      },
    );
  }

  async selectCreditRequestDetailsAndConfirm(): Promise<{requestedBy: string; reason: string;}> {
    return await step("Select a random requester and reason, then confirm in 'Credit Item' dialog", async () => {
        await expect(this.creditRequestByDropdown).toBeVisible();
        const requestedBy = await DataGenerators.selectRandomOption(this.creditRequestByDropdown);
        const reason = await DataGenerators.selectRandomOption(this.creditReasonSelect);
        await this.creditItemOkButton.click();
        return { requestedBy, reason };
      },
    );
  }

  async verifyItemsCreditPending(creditedItems: { itemId: string; description: string }[]): Promise<void> {
    await step("Verify all credited items show 'Credit Pending' status", async () => {
        for (const { itemId, description } of creditedItems) {
          await step(`Verify item '${description}' status shows 'Credit Pending'`, async () => {
              const status = this.page.locator(`#PO_ITEM_${itemId} .orderStatus:visible`).first();
              await expect(status).toContainText("Credit Pending");
              await expect(status).toContainText("View Credit");
            },
          );
        }
      },
    );
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
}
//=============================REPAIRER ORDERS=======================//
export class RepairerOrders {
  readonly ordersTab: OrdersTab;
  readonly creditManagement: CreditManagementTab;

  constructor(page: Page) {
    this.ordersTab = new OrdersTab(page);
    this.creditManagement = new CreditManagementTab(page);
  }
}
