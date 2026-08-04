import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================All Orders Tab=============================//
export class AllOrdersTab {
  // Locators
  allOrdersTab: Locator;
  ordersContainer: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.allOrdersTab = page.locator(".toplist.anchorlink", {
      hasText: "All Orders",
    });
    this.ordersContainer = page.locator("#ordersContainer");
  }
  // Methods
  async clickAllOrders(): Promise<void> {
    await step('Click "All Orders" tab', async () => {
      await this.allOrdersTab.click();
    });
  }

  async verifyOrdersContainerVisible(): Promise<void> {
    await step('Verify "Orders" table is visible', async () => {
      await expect(this.ordersContainer).toBeVisible();
    });
  }
}
//=============================ETA Requests Tab=============================//
export class ETARequestsTab {
  // Locators
  etaRequestsTab: Locator;
  etaHeading: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.etaRequestsTab = page.locator(".toplist.anchorlink", {
      hasText: "ETA Requests",
    });
    this.etaHeading = this.page.getByRole("heading", {
      name: "Authority and ETA Management",
      exact: true,
    });
  }
  // Methods
  async clickEtaRequests(): Promise<void> {
    await step('Click "ETA Requests" tab', async () => {
      await this.etaRequestsTab.click();
    });
  }

  async verifyEtaHeadingVisible(): Promise<void> {
    await step('Verify "Authority and ETA Management" heading', async () => {
      await expect(this.etaHeading).toBeVisible();
    }); 
  }
}
//============================ETA Overdue Tab=============================//
export class ETAOverdueTab {
  // Locators
  etaOverdueTab: Locator;
  etaHeading: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.etaOverdueTab = page.locator(".toplist.anchorlink", {
      hasText: "ETA Overdue",
    });
    this.etaHeading = this.page.getByRole("heading", {
      name: "Authority and ETA Management",
      exact: true,
    });
  }
  // Methods
  async clickEtaOverdue(): Promise<void> {
    await step('Click "ETA Overdue" tab', async () => {
      await this.etaOverdueTab.click();
    });
  }

  async verifyEtaHeadingVisible(): Promise<void> {
    await step('Verify "Authority and ETA Management" heading', async () => {
      await expect(this.etaHeading).toBeVisible();
    });
  }
}
//=============================Suppliers Orders=======================//
export class SupplierOrders {
  readonly allOrdersTab: AllOrdersTab;
  readonly etaRequestsTab: ETARequestsTab;
  readonly etaOverdueTab: ETAOverdueTab;

  constructor(page: Page) {
    this.allOrdersTab = new AllOrdersTab(page);
    this.etaRequestsTab = new ETARequestsTab(page);
    this.etaOverdueTab = new ETAOverdueTab(page);
  }
}
