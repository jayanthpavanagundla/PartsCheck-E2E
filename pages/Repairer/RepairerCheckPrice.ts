import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================ACTIVE QUOTES TAB=============================//
export class ActiveQuotesTab {
  // Locators
  activeQuotes: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.activeQuotes = this.page.locator("span.topTabText", {
      hasText: "Active Quotes",
    });
  }
  // Methods
  async clickActiveQuotes() {
    await step("Click on Active Quotes Tab", async () => {
      await this.activeQuotes.click();
      await expect(this.page).toHaveURL(
        /check-price\.php\?action=checkPriceList$/,
      );
    });
  }
}
//=============================SAVED QUOTE TAB=============================//
export class SavedQuotesTab {
  // Locators
  savedQuotes: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.savedQuotes = this.page.locator("span.topTabText", {
      hasText: "Saved Quotes",
    });
  }
  // Methods
  async clickSavedQuotes() {
    await step("Click on Saved Quotes Tab", async () => {
      await this.savedQuotes.click();
      await expect(this.page).toHaveURL(
        /check-price\.php\?action=checkPriceListSaved$/,
      );
    });
  }
}
//=============================TRANSFER QUOTE TAB=============================//
export class TransferQuotesTab {
  // Locators
  transferQuotes: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.transferQuotes = this.page.locator("span.topTabText", {
      hasText: "Transfer Quotes",
    });
  }
  // Methods
  async clickTransferQuotes() {
    await step("Click on Transfer Quotes Tab", async () => {
      await this.transferQuotes.click();
    });
  }
}
//=============================REPAIRER CHECK PRICE=======================//
export class RepairerCheckPrice {
  readonly activeQuotes: ActiveQuotesTab;
  readonly savedQuotes: SavedQuotesTab;
  readonly transferQuotes: TransferQuotesTab;

  // Common popup locators
  popupFrame: FrameLocator;
  popupHeading: Locator;
  popupCloseButton: Locator;

  constructor(page: Page) {
    this.activeQuotes = new ActiveQuotesTab(page);
    this.savedQuotes = new SavedQuotesTab(page);
    this.transferQuotes = new TransferQuotesTab(page);

    // Locators
    this.popupFrame = page.frameLocator("iframe.cboxIframe");
    this.popupHeading = this.popupFrame.locator("#iframeHeading");
    this.popupCloseButton = page.locator("#cboxClose");
  }

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
