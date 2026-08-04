import { Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================All Credits Request Tab=============================//
export class AllCreditsRequestTab {
  // Locators
  allCreditRequestsTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.allCreditRequestsTab = page.locator(".toplist.anchorlink", {
      hasText: "All Credit Requests",
    });
  }
  // Methods
  async clickAllCreditRequests(): Promise<void> {
    await step('Click "All Credit Requests" tab', async () => {
      await this.allCreditRequestsTab.click();
      await expect(this.page).toHaveURL(/credit-management\.php\?action=all$/);
    });
  }
}
//=============================Credits Not Opened Tab=============================//
export class CreditsNotOpenedTab {
  // Locators
  creditsNotOpenedTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.creditsNotOpenedTab = page.locator(".toplist.anchorlink", {
      hasText: "Credits Not Opened",
    });
  }
  // Methods
  async clickCreditsNotOpened(): Promise<void> {
    await step('Click "Credits Not Opened" tab', async () => {
      await this.creditsNotOpenedTab.click();
      await expect(this.page).toHaveURL(
        /credit-management\.php\?action=notOpened$/,
      );
    });
  }
}
//============================Credits Opened Tab=============================//
export class CreditsOpenedTab {
  // Locators
  creditsOpenedTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.creditsOpenedTab = page.locator(".toplist.anchorlink", {
      hasText: "Credits Opened",
    });
  }
  // Methods
  async clickCreditsOpened(): Promise<void> {
    await step('Click "Credits Opened" tab', async () => {
      await this.creditsOpenedTab.click();
      await expect(this.page).toHaveURL(
        /credit-management\.php\?action=opened$/,
      );
    });
  }
}
//=============================Suppliers Credit Management=======================//
export class SuppliersCreditManagement {
  readonly allCreditsRequestTab: AllCreditsRequestTab;
  readonly creditsNotOpenedTab: CreditsNotOpenedTab;
  readonly creditsOpenedTab: CreditsOpenedTab;

  creditManagementHeading: Locator;

  constructor(page: Page) {
    this.allCreditsRequestTab = new AllCreditsRequestTab(page);
    this.creditsNotOpenedTab = new CreditsNotOpenedTab(page);
    this.creditsOpenedTab = new CreditsOpenedTab(page);

    this.creditManagementHeading = page.getByRole("heading", {
      name: "Credit Management",
      level: 2,
      exact: true,
    });
  }

  async verifyCreditManagementHeading(): Promise<void> {
    await step('Verify "Credit Management" heading', async () => {
      await expect(this.creditManagementHeading).toBeVisible();
    });
  }
}
