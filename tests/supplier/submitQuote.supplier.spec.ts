import { test, expect } from "@playwright/test";
import path from "path";
import { SupplierNavBar } from "../../pages/Supplier/SupplierNavBar.js";
import { SupplierQuotes } from "../../pages/Supplier/SupplierQuotes.js";
import { epic } from "allure-js-commons";
import {
  addQuoteToPool,
  addToCompletedPool,
  loadQuotePool,
} from "../../helpers/quotePool.js";
import { loadQuoteImages, removeQuoteImages } from "../../helpers/imagePool.js";

test.describe("Submit Quote Flow", () => {
  let supplierNavBar: SupplierNavBar;
  let supplierQuotes: SupplierQuotes;

  test.beforeEach(async ({ page }) => {
    epic("Submit Quote Flow");

    supplierNavBar = new SupplierNavBar(page);
    supplierQuotes = new SupplierQuotes(page);

    await page.goto(process.env.SUPPLIER_LANDING_URL!);
  });

  test("Quote Submission", async () => {
    await supplierQuotes.quotesInProgressTab.clickQuotesInProgress();
    await supplierNavBar.verifyPopupHeading("Incoming Quotes");
    // Load a quote number from the pool and open it
    const [quoteNumber] = loadQuotePool();
    await supplierQuotes.newQuotesRequestTab.openQuoteByNumber(quoteNumber);
    await supplierQuotes.newQuotesRequestTab.verifyReferenceMatchesQuoteNumber(
      quoteNumber,
    );
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
    // Filling Buy Price and List Price for all line items, then saving and verifying the saved values
    await supplierQuotes.newQuotesRequestTab.fillSupplierQuoteNr(quoteNumber);
    const filledItems =
      await supplierQuotes.newQuotesRequestTab.fillAllLineItems();
    await supplierQuotes.newQuotesRequestTab.clickSavePrices();
    await supplierQuotes.newQuotesRequestTab.verifyLineItemsSaved(filledItems);
    await supplierQuotes.newQuotesRequestTab.clickSubmitQuote();
  });
});
