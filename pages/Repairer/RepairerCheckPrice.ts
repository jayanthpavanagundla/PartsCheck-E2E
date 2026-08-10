import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";
//=============================ACTIVE QUOTES TAB=============================//
export class ActiveQuotesTab {
  // Locators
  activeQuotes: Locator;
  supplierButtons: Locator;
  supplierTotalValues: Locator;
  repairerCostPrice: Locator;
  repairerCostVsListPrice: Locator;
  selectedItemCount: Locator;
  totalItemCount: Locator;
  saveSelectionButton: Locator;
  saveSelectionsWarningDialog: Locator;
  saveSelectionsWarningSaveButton: Locator;
  confirmPartsDialog: Locator;
  confirmPartsConfirmButton: Locator;
  partsSelectedForPurchaseHeader: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.activeQuotes = this.page.locator("span.topTabText", {
      hasText: "Active Quotes",
    });
    this.supplierButtons = this.page.locator(".supplierButton");
    this.supplierTotalValues = this.page.locator(".supplierTotalValue");
    this.repairerCostPrice = this.page.locator("#repairerCostPrice");
    this.repairerCostVsListPrice = this.page.locator(
      "#repairerCostVsListPrice",
    );
    this.selectedItemCount = this.page.locator(".gridSelectedItemCount");
    this.totalItemCount = this.page.locator(".gridTotalItems");
    this.saveSelectionButton = this.page.locator("#saveSelection");
    this.saveSelectionsWarningDialog = this.page.locator(
      "div.ui-dialog[aria-describedby='showNonSelectPartBox']",
    );
    this.saveSelectionsWarningSaveButton =
      this.saveSelectionsWarningDialog.locator("button.ok-button");
    this.confirmPartsDialog = this.page.locator(
      "div.ui-dialog[aria-describedby='confirmParts']",
    );
    this.confirmPartsConfirmButton = this.confirmPartsDialog.locator(
      "button.ok-button",
    );
    this.partsSelectedForPurchaseHeader = this.page.locator(
      "p.collpaseTitle",
      { hasText: "Parts Selected for Purchase" },
    );
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

  quoteRow(quoteNumber: string): Locator {
    return this.page.locator("tr", {
      has: this.page.getByText(quoteNumber, { exact: true }),
    });
  }

  async openQuoteByNumber(quoteNumber: string): Promise<void> {
    await step(`Open quote '${quoteNumber}' from Active Quotes`, async () => {
      await this.quoteRow(quoteNumber).locator(".l_greenButton").click();
    });
  }

  async verifyQuoteNumberVisible(quoteNumber: string): Promise<void> {
    await step(
      `Verify quote number '${quoteNumber}' is visible on price grid`,
      async () => {
        await expect(
          this.page
            .locator(
              "div.tw\\:font-bold.tw\\:leading-none span.tw\\:text-success",
            )
            .first(),
        ).toHaveText(quoteNumber);
      },
    );
  }

  private parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
  }

  // Suppliers and their totals render in the same column order, so the
  // matching supplier button's index locates its total in the totals row.
  private async getSupplierIndex(supplierName: string): Promise<number> {
    const names = await this.supplierButtons
      .locator(".supplierNameText")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-name")?.trim() ?? ""),
      );
    const index = names.findIndex(
      (name) => name.toLowerCase() === supplierName.trim().toLowerCase(),
    );
    if (index === -1) {
      throw new Error(
        `Supplier '${supplierName}' not found. Available suppliers: ${names.join(", ")}`,
      );
    }
    return index;
  }

  async getSupplierTotalAmount(supplierName: string): Promise<string> {
    return await step(
      `Extract Supplier Total Amount for '${supplierName}'`,
      async () => {
        const index = await this.getSupplierIndex(supplierName);
        return (await this.supplierTotalValues.nth(index).innerText()).trim();
      },
    );
  }

  async selectSupplier(supplierName: string) {
    await step(`Select Supplier: '${supplierName}'`, async () => {
      const index = await this.getSupplierIndex(supplierName);
      await this.supplierButtons.nth(index).click();
    });
  }

  async verifyYourCostMatchesSupplierTotal(
    supplierName: string,
  ): Promise<void> {
    const expectedAmountText = await this.getSupplierTotalAmount(supplierName);
    const expectedAmount = this.parseCurrency(expectedAmountText);

    await step(
      `Wait for 'YOUR COST' to update to '${supplierName}' supplier total`,
      async () => {
        await expect(async () => {
          const actualAmount = this.parseCurrency(
            await this.repairerCostPrice.innerText(),
          );
          expect(actualAmount).toBe(expectedAmount);
        }).toPass();
      },
    );

    const actualAmountText = (await this.repairerCostPrice.innerText()).trim();
    await step(
      `Verify 'YOUR COST' (${actualAmountText}) matches '${supplierName}' supplier total (${expectedAmountText})`,
      async () => {
        expect(this.parseCurrency(actualAmountText)).toBe(expectedAmount);
      },
    );
  }

  async clickSaveSelection(): Promise<void> {
    await step("Click 'Save' to save the selected parts", async () => {
      await this.saveSelectionButton.click();
    });
  }

  async confirmPartsDialogAndSave(): Promise<void> {
    await step("Handle 'Save Selections' warning dialog (if shown)", async () => {
      if (await this.saveSelectionsWarningDialog.isVisible()) {
        await this.saveSelectionsWarningSaveButton.click();
        await expect(this.saveSelectionsWarningDialog).toBeHidden();
      }
    });

    await step("Confirm 'Confirm Parts' dialog", async () => {
      await expect(this.confirmPartsDialog).toBeVisible();
      await this.confirmPartsConfirmButton.click();
      await expect(this.confirmPartsDialog).toBeHidden();
    });
  }

  async verifyPartsSelectedForPurchaseVisible(): Promise<void> {
    await step(
      "Verify 'Parts Selected for Purchase' section is visible",
      async () => {
        await expect(this.partsSelectedForPurchaseHeader).toBeVisible();
      },
    );
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
