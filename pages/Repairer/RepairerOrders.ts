import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================ORDERS TAB=============================//
export class OrdersTab {
  // Locators
  orders: Locator;
  allOrdersGrid: Locator;
  quoteText: Locator;
  documentsTab: Locator;
  documentRows: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.orders = this.page.locator("span.topTabText", {
      hasText: "All Orders",
    });
    this.allOrdersGrid = this.page.locator("#all");
    this.quoteText = this.page.locator("div.quoteText");
    this.documentsTab = this.page.locator("span.topTabText", {
      hasText: "Documents",
    });
    this.documentRows = this.page.locator(".show .docRow:not([style])");
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

    await step(
      `Verify attached documents:\nExpected: [${expectedSorted.join(", ")}]\nReceived: [${actualSorted.join(", ")}]`,
      async () => {
        expect(actualSorted).toEqual(expectedSorted);
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
