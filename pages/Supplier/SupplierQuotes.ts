import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import * as path from "path";
import { step } from "allure-js-commons";
import { DataGenerators } from "../../helpers/DataGenerators";
//=============================New Quotes Request Tab=============================//
export interface FilledLineItem {
  draftItemId: string;
  partNumber: string;
  buyPrice: string;
  listPrice: string;
}

export class NewQuotesRequestTab {
  // Locators
  quoteRequestTab: Locator;
  popupFrame: FrameLocator;
  requestRows: Locator;
  // Submit Quote Tab Locators
  referenceValue: Locator;
  supplierRefNrInput: Locator;
  // Line Table Locators
  lineItemRows: Locator;
  savePricesButton: Locator;
  submitQuoteButton: Locator;
  submitVerifyText: Locator;
  // Images Popup Locators
  imagesButton: Locator;
  imagesCounter: Locator;
  popupImageThumbnails: Locator;
  // Attachments Popup Locators
  attachFileButton: Locator;
  attachFileCounter: Locator;
  attachFileInputs: Locator;
  attachSubmitButtons: Locator;
  attachedRows: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.quoteRequestTab = page.locator(".toplist.cboxlink", {
      hasText: "New Quote Request",
    });

    // Popup opened by clickNewQuoteRequest / clickImagesButton (colorbox reuses this iframe)
    this.popupFrame = page.frameLocator("iframe.cboxIframe");
    this.requestRows = this.popupFrame.locator("tr.requestRow");
    // Submit Quote Tab Locators
    this.referenceValue = this.page
      .locator(".quoteTitle", { hasText: /^Reference$/ })
      .locator(
        "xpath=following-sibling::div[contains(@class,'quoteTitleContent')]",
      );
    this.supplierRefNrInput = this.page.locator('input[name="supplierRefNr"]');
    // Line Table Locators
    this.lineItemRows = this.page.locator("tr.lineRow");
    this.savePricesButton = this.page.locator(".baseButton.savePricesButton");
    this.submitQuoteButton = this.page.locator(".baseButton.submitQuoteButton");
    this.submitVerifyText = this.page.locator('td[colspan="8"] > b');
    // Images Popup Locators
    this.imagesButton = this.page.locator("a.qtbtn.showPhotos");
    this.imagesCounter = this.imagesButton.locator(
      "xpath=preceding-sibling::span[contains(@class,'toplistcounter')]",
    );
    this.popupImageThumbnails = this.popupFrame.locator(".image-item img");
    // Attachments Popup Locators (colorbox reuses the same iframe as Images)
    this.attachFileButton = this.page.locator('div.qtbtn[data-url*="attachDoco"]');
    this.attachFileCounter = this.page.locator("#attachFileCount");
    this.attachFileInputs = this.popupFrame.locator(
      'input[name="attachFile[]"]',
    );
    this.attachSubmitButtons = this.popupFrame.locator(
      'input.baseButton[value="Attach"]',
    );
    this.attachedRows = this.popupFrame.locator(
      'tr:has(td:text-is("Attached:"))',
    );
  }
  // Methods
  async clickNewQuoteRequest(): Promise<void> {
    await step('Click "New Quote Request" tab', async () => {
      await this.quoteRequestTab.click();
    });
  }

  quoteNumberLink(quoteNumber: string): Locator {
    return this.requestRows.locator("a.ab").getByText(quoteNumber, {
      exact: true,
    });
  }

  async openQuoteByNumber(quoteNumber: string): Promise<void> {
    await step(`Open quote '${quoteNumber}' from Incoming Quotes`, async () => {
      await this.quoteNumberLink(quoteNumber).click();
    });
  }

  async verifyReferenceMatchesQuoteNumber(quoteNumber: string): Promise<void> {
    await step(
      `Reference Number: ${quoteNumber} == Quote Pool Number: ${quoteNumber}`,
      async () => {
        await expect(this.referenceValue).toHaveText(quoteNumber);
      },
    );
  }

  async fillSupplierQuoteNr(quoteNumber: string): Promise<void> {
    await step(`Fill Quote Nr with '${quoteNumber}'`, async () => {
      await this.supplierRefNrInput.fill(quoteNumber);
    });
  }

  async fillAllLineItems(): Promise<FilledLineItem[]> {
    const filledItems: FilledLineItem[] = [];

    await step(
      "Fill Part Number, Buy Price and List Price for every line item",
      async () => {
        const rowCount = await this.lineItemRows.count();

        for (let i = 0; i < rowCount; i++) {
          const row = this.lineItemRows.nth(i);
          const draftItemId =
            (await row.getAttribute("data-draft_item_id")) ?? "";

          const partNumber = DataGenerators.randomNumber(12);
          const buyPrice = DataGenerators.randomPrice(50, 150).toString();
          const listPrice = (parseFloat(buyPrice) * 1.5).toString();

          await row.locator("input.partNr").fill(partNumber);
          await row.locator("input.buyprice").fill(buyPrice);
          await row.locator("input.listprice").fill(listPrice);

          filledItems.push({ draftItemId, partNumber, buyPrice, listPrice });
        }
      },
    );
    return filledItems;
  }

  async clickSavePrices(): Promise<void> {
    await step('Click "Save Prices" button', async () => {
      await this.savePricesButton.click();
    });
  }

  async verifyLineItemsSaved(filledItems: FilledLineItem[]): Promise<void> {
    await step(
      "Verify Part Number, Buy Price and List Price were saved correctly",
      async () => {
        for (const item of filledItems) {
          const savedRow = this.page.locator(
            `tr.lineRow[data-draft_item_id="${item.draftItemId}"]`,
          );

          const savedPartNumber =
            (await savedRow.locator("td.wrapCell").nth(1).textContent()) ?? "";
          const savedBuyPrice = await savedRow.getAttribute("data-buyprice");
          const savedListPrice = await savedRow.getAttribute("data-listprice");

          await step(
            `Line ${item.draftItemId} - Filled [Part# ${item.partNumber}, Buy $${item.buyPrice}, List $${item.listPrice}] vs Saved [Part# ${savedPartNumber.trim()}, Buy $${savedBuyPrice}, List $${savedListPrice}]`,
            async () => {
              await expect(savedRow.locator("td.wrapCell").nth(1)).toHaveText(
                item.partNumber,
              );

              expect(parseFloat(savedBuyPrice ?? "0")).toBeCloseTo(
                parseFloat(item.buyPrice),
                2,
              );
              expect(parseFloat(savedListPrice ?? "0")).toBeCloseTo(
                parseFloat(item.listPrice),
                2,
              );
            },
          );
        }
      },
    );
  }

  async clickSubmitQuote(): Promise<void> {
    await step(
      'Click "Submit Quote" button, accept confirmation dialog, and verify "Incoming Quotes" is shown',
      async () => {
        this.page.once("dialog", (dialog) => dialog.accept());
        await this.submitQuoteButton.click();
        await expect(this.submitVerifyText).toHaveText("Incoming Quotes");
      },
    );
  }

  // Images 

  async verifyImagesCounter(count: number): Promise<void> {
    await step(`Verify images counter shows '${count}'`, async () => {
      await expect(this.imagesCounter).toHaveText(count.toString());
    });
  }

  async clickImagesButton(): Promise<void> {
    await step('Click "Images" button', async () => {
      await this.imagesButton.locator("img").click();
    });
  }

  async getVisibleImageIdentifiers(): Promise<string[]> {
    return await step("Read image identifiers visible in Images popup", async () => {
      await expect(this.popupImageThumbnails.first()).toBeVisible();
      const srcs = await this.popupImageThumbnails.evaluateAll(
        (imgs: HTMLImageElement[]) => imgs.map((img) => img.src),
      );
      return srcs
        .map((src) => {
          const fileName = new URL(src).searchParams.get("fileName") ?? src;
          return fileName.slice(10);
        })
        .sort();
    });
  }

  // Attachments

  async clickAttachFileButton(): Promise<void> {
    await step('Click "Attach File" button', async () => {
      await this.attachFileButton.locator("img").click();
    });
  }

  async attachFile(filePath: string): Promise<string> {
    const fileName = path.basename(filePath);
    await step(`Attach file '${fileName}'`, async () => {
      await this.attachFileInputs.first().setInputFiles(filePath);
      await this.attachSubmitButtons.first().click();
      await expect(
        this.attachedRows.filter({ hasText: fileName }),
      ).toBeVisible();
    });
    return fileName;
  }

  async verifyAttachmentsCounter(count: number): Promise<void> {
    await step(`Verify attachments counter shows '${count}'`, async () => {
      await expect(this.attachFileCounter).toHaveText(count.toString());
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
