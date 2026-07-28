import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================DASHBOARD TAB=============================//
export class DashBoardTab {
  // Locators
  dashboard: Locator;
  dashboardDiv: Locator;
  sendQuotesBtn: Locator;
  checkQuotesBtn: Locator;
  orderPartsInput: Locator;
  orderPartsSearchBtn: Locator;
  receiptPartsInput: Locator;
  receiptPartsSearchBtn: Locator;
  raiseCreditReturnInput: Locator;
  raiseCreditReturnSearchBtn: Locator;
  orderSupplementaryPartsInput: Locator;
  orderSupplementaryPartsSearchBtn: Locator;
  backOrdersBtn: Locator;

  constructor(protected readonly page: Page) {
    this.dashboard = page.locator(".topTab", { hasText: "Dashboard" });
    this.dashboardDiv = page.locator(".welcomeMainArea");
    // Left Area Div
    this.sendQuotesBtn = this.page
      .locator(".row", { has: this.page.getByText("Send quotes to Suppliers") })
      .locator(".sl_subLinkButton");
    this.checkQuotesBtn = this.page
      .locator(".row", {
        has: this.page.getByText("Check quotes from Suppliers"),
      })
      .locator(".sl_subLinkButton");

    this.orderPartsInput = this.page
      .locator(".row", { has: this.page.getByText("Order Parts") })
      .locator('input[data-type="quote"]');

    this.orderPartsSearchBtn = this.page
      .locator(".row", { has: this.page.getByText("Order Parts") })
      .locator(".sl_subSearchButton");

    this.receiptPartsInput = this.page
      .locator(".row", { has: this.page.getByText("Receipt Parts") })
      .locator('input[data-type="order"]');

    this.receiptPartsSearchBtn = this.page
      .locator(".row", { has: this.page.getByText("Receipt Parts") })
      .locator(".sl_subSearchButton");

    this.raiseCreditReturnInput = this.page
      .locator(".row", { has: this.page.getByText("Raise a Credit Return") })
      .locator('input[data-type="order"]');

    this.raiseCreditReturnSearchBtn = this.page
      .locator(".row", { has: this.page.getByText("Raise a Credit Return") })
      .locator(".sl_subSearchButton");

    this.orderSupplementaryPartsInput = this.page
      .locator(".row", {
        has: this.page.getByText("Order Supplementary Parts"),
      })
      .locator('input[data-type="quote"]');

    this.orderSupplementaryPartsSearchBtn = this.page
      .locator(".row", {
        has: this.page.getByText("Order Supplementary Parts"),
      })
      .locator(".sl_subSearchButton");
    this.backOrdersBtn = this.page
      .locator(".row", {
        has: this.page.getByText("Manage Backorders and ETA's"),
      })
      .locator(".sl_subLinkButton");
  }
  // Dashboard Options
  async clickDashboard() {
    await step("Click on Dashboard Tab", async () => {
      await this.dashboard.click();
      await expect(this.dashboardDiv).toBeVisible();
    });
  }
  // Left Area Methods
  async clickSendQuotes() {
    await step("Click on Send Quotes", async () => {
      await this.sendQuotesBtn.click();
      // Add the expected page verification here
    });
  }
  async clickCheckQuotes() {
    await step("Click on Check Quotes", async () => {
      await this.checkQuotesBtn.click();
      // Add the expected page verification here
    });
  }
  async searchOrderParts(quoteNo: string) {
    await step("Search Order Parts", async () => {
      await this.orderPartsInput.fill(quoteNo);
      await this.orderPartsSearchBtn.click();
      // Add the expected page verification here
    });
  }
  async searchReceiptParts(orderNo: string) {
    await step("Search Receipt Parts", async () => {
      await this.receiptPartsInput.fill(orderNo);
      await this.receiptPartsSearchBtn.click();
      // Add the expected page verification here
    });
  }
  async searchRaiseCreditReturn(orderNo: string) {
    await step("Search Raise Credit Return", async () => {
      await this.raiseCreditReturnInput.fill(orderNo);
      await this.raiseCreditReturnSearchBtn.click();
      // Add the expected page verification here
    });
  }
  async searchOrderSupplementaryParts(quoteNo: string) {
    await step("Search Order Supplementary Parts", async () => {
      await this.orderSupplementaryPartsInput.fill(quoteNo);
      await this.orderSupplementaryPartsSearchBtn.click();
      // Add the expected page verification here
    });
  }
  async clickBackOrders() {
    await step("Click on Backorders", async () => {
      await this.backOrdersBtn.click();
      // Add the expected page verification here
    });
  }
}
//=============================REPORTING TAB=============================//
export class ReportingTab {
  // Locators
  reporting: Locator;
  reportingDiv: Locator;
  constructor(protected readonly page: Page) {
    this.reporting = page.locator(".topTab", { hasText: "Reporting" });
    this.reportingDiv = page.locator(".reportsMainArea");
  }
  // Methods
  async clickReporting() {
    await step("Click on Reporting Tab", async () => {
      await this.reporting.click();
      await expect(this.reportingDiv).toBeVisible();
    });
  }
}
//=============================KNOWLEDGE CENTRE TAB=====================//
export class KnowledgeTab {
  // Locators
  knowledgeCentre: Locator;
  knowledgeCentreDiv: Locator;
  constructor(protected readonly page: Page) {
    this.knowledgeCentre = page.locator(".topTab", {
      hasText: "Knowledge Centre",
    });
    this.knowledgeCentreDiv = this.page.locator(".collapseSection").filter({
      hasText: "Videos & Tutorials",
    });
  }
  // Methods
  async clickKnowledgeCentre() {
    await step("Click on Knowledge Centre Tab", async () => {
      await this.knowledgeCentre.click();
      await expect(this.knowledgeCentreDiv).toBeVisible();
    });
  }
}
//=============================REPAIRER DASHBOARD=======================//
export class RepairerDashboard {
  readonly dashboard: DashBoardTab;
  readonly reporting: ReportingTab;
  readonly knowledgeCentre: KnowledgeTab;

  constructor(page: Page) {
    this.dashboard = new DashBoardTab(page);
    this.reporting = new ReportingTab(page);
    this.knowledgeCentre = new KnowledgeTab(page);
  }
}
