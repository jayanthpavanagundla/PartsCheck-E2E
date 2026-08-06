import { test } from "@playwright/test";
import path from "path";
import { SupplierNavBar } from "../../pages/Supplier/SupplierNavBar.js";
import { SupplierOrders } from "../../pages/Supplier/SupplierOrders.js";
import { SupplierQuotes } from "../../pages/Supplier/SupplierQuotes.js";
import { SuppliersCreditManagement } from "../../pages/Supplier/SupplierCreditManagement.js";
import { SupplierReportsAndTools } from "../../pages/Supplier/SupplierReportsAndTools.js";
import { epic } from "allure-js-commons";
import {
  addQuoteToPool,
  addToCompletedPool,
  loadQuotePool,
} from "../../helpers/quotePool.js";

test.describe("Submit Quote Flow", () => {
  let supplierNavBar: SupplierNavBar;
  let supplierOrders: SupplierOrders;
  let supplierQuotes: SupplierQuotes;
  let suppliersCreditManagement: SuppliersCreditManagement;
  let supplierReportsAndTools: SupplierReportsAndTools;

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
    // Filling Buy Price and List Price for all line items, then saving and verifying the saved values
    await supplierQuotes.newQuotesRequestTab.fillSupplierQuoteNr(quoteNumber);
    const filledItems =
      await supplierQuotes.newQuotesRequestTab.fillAllLineItems();
    await supplierQuotes.newQuotesRequestTab.clickSavePrices();
    await supplierQuotes.newQuotesRequestTab.verifyLineItemsSaved(filledItems);
    await supplierQuotes.newQuotesRequestTab.clickSubmitQuote();
  });
});
