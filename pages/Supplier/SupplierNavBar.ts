import { Page, Locator, FrameLocator, expect } from "@playwright/test";
import { step } from "allure-js-commons";
import { BasePage } from "../Base/BasePage";

export class SupplierNavBar extends BasePage {
  page: Page;

  // Nav Bar Locators
  dashboardLink: Locator;
  teamViewerLink: Locator;
  reportsLink: Locator;
  settingsLink: Locator;
  logoutLink: Locator;

  // Common PopUp Locators
  popupFrame: FrameLocator;
  popupHeading: Locator;
  popupCloseButton: Locator;

  constructor(page: Page) {
    super(page);

    this.page = page;

    // Nav Bar Locators
    this.dashboardLink = page.getByRole("link", {
      name: "Dashboard",
      exact: true,
    });
    this.teamViewerLink = page.getByRole("link", {
      name: "TeamViewer",
      exact: true,
    });
    this.reportsLink = page.getByRole("link", { name: "Reports", exact: true });
    this.settingsLink = page.getByRole("link", {
      name: "Settings",
      exact: true,
    });
    this.logoutLink = page.getByRole("link", { name: "Logout", exact: true });

    // Common PopUp Locators
    this.popupFrame = page.frameLocator("iframe.cboxIframe");
    this.popupHeading = this.popupFrame.locator('td[colspan="8"] > b');
    this.popupCloseButton = page.locator("#cboxClose");
  }

  // Nav Bar Methods

  async clickDashboardNav(): Promise<void> {
    await step('Click "Dashboard" nav link', async () => {
      await this.dashboardLink.click();
    });
  }

  async clickTeamViewerNav(): Promise<void> {
    await step('Click "TeamViewer" nav link', async () => {
      await this.teamViewerLink.click();
    });
  }

  async clickReportsNav(): Promise<void> {
    await step('Click "Reports" nav link', async () => {
      await this.reportsLink.click();
    });
  }

  async clickSettingsNav(): Promise<void> {
    await step('Click "Settings" nav link', async () => {
      await this.settingsLink.click();
    });
  }

  async clickLogoutNav(): Promise<void> {
    await step('Click "Logout" nav link', async () => {
      await this.logoutLink.click();
    });
  }

  // Common PopUp Methods

  async verifyPopupHeading(expectedHeading: string) {
    await step(`Verify popup heading is '${expectedHeading}'`, async () => {
      await expect(this.popupHeading).toHaveText(expectedHeading);
    });
  }

  async closePopup() {
    await step("Close popup", async () => {
      await this.popupCloseButton.click();
      await expect(this.popupCloseButton).toBeHidden();
    });
  }
}
