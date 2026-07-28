import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
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