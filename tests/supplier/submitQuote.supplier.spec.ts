import { test, expect } from "@playwright/test";
import { SupplierNavBar } from "../../pages/Supplier/SupplierNavBar.js";
import { SupplierQuotes } from "../../pages/Supplier/SupplierQuotes.js";
import { epic, step } from "allure-js-commons";
import { addToCompletedDirectPool, addToCompletedNormalPool,loadDirectQuotePool,loadNormalQuotePool } from "../../helpers/quotePool.js";
import { loadQuoteImages, removeQuoteImages } from "../../helpers/imagePool.js";
import { getRandomAttachmentFiles,saveQuoteAttachments } from "../../helpers/attachmentPool.js";

test.describe("Submit Quote Flow", () => {
  let supplierNavBar: SupplierNavBar;
  let supplierQuotes: SupplierQuotes;

  test.beforeEach(async ({ page }) => {
    epic("Submit Quote Flow");

    supplierNavBar = new SupplierNavBar(page);
    supplierQuotes = new SupplierQuotes(page);

    await page.goto(process.env.SUPPLIER_LANDING_URL!);
  });

  test("Normal Quote Submission", async () => {
    await supplierQuotes.quotesInProgressTab.clickQuotesInProgress();
    await supplierNavBar.verifyPopupHeading("Incoming Quotes");

    // Load a quote number from the Normal Quote pool and open it
    const [quoteNumber] = await step(
      "Load quote number from Normal Quote pool",
      async () => loadNormalQuotePool(),
    );
    await supplierQuotes.newQuotesRequestTab.openQuoteByNumber(quoteNumber);
    await supplierQuotes.newQuotesRequestTab.verifyReferenceMatchesQuoteNumber(
      quoteNumber,
    );
    await supplierQuotes.newQuotesRequestTab.fillSupplierQuoteNr(quoteNumber);

    // Verify the images the Repairer uploaded are visible to the Supplier
    const uploadedImages = loadQuoteImages(quoteNumber);
    await supplierQuotes.newQuotesRequestTab.verifyImagesCounter(
      uploadedImages.length,
    );
    await supplierQuotes.newQuotesRequestTab.clickImagesButton();
    const visibleImages =
      await supplierQuotes.newQuotesRequestTab.getVisibleImageIdentifiers();
    expect(visibleImages).toEqual(uploadedImages);
    await supplierNavBar.closePopup();
    removeQuoteImages(quoteNumber);

    // Attach 3 random PDF files and verify each uploads successfully
    const attachmentFiles = getRandomAttachmentFiles(3);
    const attachedNames: string[] = [];
    await supplierQuotes.newQuotesRequestTab.clickAttachFileButton();
    for (const filePath of attachmentFiles) {
      const fileName =
        await supplierQuotes.newQuotesRequestTab.attachFile(filePath);
      attachedNames.push(fileName);
    }
    saveQuoteAttachments(quoteNumber, attachedNames);
    await supplierNavBar.closePopup();
    await supplierQuotes.newQuotesRequestTab.verifyAttachmentsCounter(
      attachedNames.length,
    );

    // Filling Buy Price and List Price for all line items, then saving and verifying the saved values
    const filledItems =
      await supplierQuotes.newQuotesRequestTab.fillAllLineItems();
    await supplierQuotes.newQuotesRequestTab.clickSavePrices();
    await supplierQuotes.newQuotesRequestTab.verifyLineItemsSaved(filledItems);
    await supplierQuotes.newQuotesRequestTab.clickSubmitQuote();
    await step(
      `Move quote number '${quoteNumber}' to completed Normal Quote pool`,
      async () => {
        addToCompletedNormalPool(quoteNumber);
      },
    );
  });

  test("Direct Purchase Order Quote Submission", async () => {
    await supplierQuotes.quotesInProgressTab.clickQuotesInProgress();
    await supplierNavBar.verifyPopupHeading("Incoming Quotes");

    // Load a quote number from the Normal Quote pool and open it
    const [quoteNumber] = await step(
      "Load quote number from Direct Purchase Quote pool",
      async () => loadDirectQuotePool(),
    );
    await supplierQuotes.newQuotesRequestTab.openQuoteByNumber(quoteNumber);
    await supplierQuotes.newQuotesRequestTab.verifyReferenceMatchesQuoteNumber(
      quoteNumber,
    );
    await supplierQuotes.newQuotesRequestTab.fillSupplierQuoteNr(quoteNumber);

    // Verify the images the Repairer uploaded are visible to the Supplier
    const uploadedImages = loadQuoteImages(quoteNumber);
    await supplierQuotes.newQuotesRequestTab.verifyImagesCounter(
      uploadedImages.length,
    );
    await supplierQuotes.newQuotesRequestTab.clickImagesButton();
    const visibleImages =
      await supplierQuotes.newQuotesRequestTab.getVisibleImageIdentifiers();
    expect(visibleImages).toEqual(uploadedImages);
    await supplierNavBar.closePopup();
    removeQuoteImages(quoteNumber);

    // Attach 3 random PDF files and verify each uploads successfully
    const attachmentFiles = getRandomAttachmentFiles(3);
    const attachedNames: string[] = [];
    await supplierQuotes.newQuotesRequestTab.clickAttachFileButton();
    for (const filePath of attachmentFiles) {
      const fileName =
        await supplierQuotes.newQuotesRequestTab.attachFile(filePath);
      attachedNames.push(fileName);
    }
    saveQuoteAttachments(quoteNumber, attachedNames);
    await supplierNavBar.closePopup();
    await supplierQuotes.newQuotesRequestTab.verifyAttachmentsCounter(
      attachedNames.length,
    );
    
    // Filling Buy Price and List Price for all line items, then saving and verifying the saved values
    const filledItems =
      await supplierQuotes.newQuotesRequestTab.fillAllLineItems();
    await supplierQuotes.newQuotesRequestTab.clickSavePrices();
    await supplierQuotes.newQuotesRequestTab.verifyLineItemsSaved(filledItems);
    await supplierQuotes.newQuotesRequestTab.clickSubmitQuote();
    await step(
      `Move quote number '${quoteNumber}' to completed Direct Purchase Quote pool`,
      async () => {
        addToCompletedDirectPool(quoteNumber);
      },
    );
  });
});
