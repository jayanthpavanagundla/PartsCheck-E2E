import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================New Quotes Request Tab=============================//
export class NewQuotesRequestTab {
  // Locators
  quoteRequestTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.quoteRequestTab = page.locator(".toplist.cboxlink", {
      hasText: "New Quote Request",
    });
  }
  // Methods
  async clickNewQuoteRequest(): Promise<void> {
    await step('Click "New Quote Request" tab', async () => {
      await this.quoteRequestTab.click();
    });
  }
}
//=============================Quotes In Progress Tab=============================//
export class QuotesInProgressTab {
  // Locators
  quotesInProgressTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.quotesInProgressTab = page.locator(".toplist.cboxlink", {
      hasText: "Quotes In Progress",
    });
  }
  // Methods
  async clickQuotesInProgress(): Promise<void> {
    await step('Click "Quotes In Progress" tab', async () => {
      await this.quotesInProgressTab.click();
    });
  }
}
//=============================Supplier Quotes=======================//
export class SupplierQuotes {
  readonly newQuotesRequestTab: NewQuotesRequestTab;
  readonly quotesInProgressTab: QuotesInProgressTab;

  constructor(page: Page) {
    this.newQuotesRequestTab = new NewQuotesRequestTab(page);
    this.quotesInProgressTab = new QuotesInProgressTab(page);
  }
}
