import { test } from "@playwright/test";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerCheckPrice } from "../../pages/Repairer/RepairerCheckPrice.js";
import { epic, step } from "allure-js-commons";
import { loadCompletedNormalQuotePool } from "../../helpers/quotePool.js";

test.describe("Check Price for Submit Quote", () => {
  let repairerCheckPricePage: RepairerCheckPrice;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Check Price for Submit Quote");

    repairerCheckPricePage = new RepairerCheckPrice(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Price Check for Submit Quote - Normal Quote", async ({page}) => {
    await repairerNavBarPage.clickCheckPrice();
    await repairerCheckPricePage.activeQuotes.clickActiveQuotes();

    // Load a quote number the Supplier has already submitted and open it
    const [quoteNumber] = await step(
      "Load quote number from completed Normal Quote pool",
      async () => loadCompletedNormalQuotePool(),
    );
    await repairerCheckPricePage.activeQuotes.openQuoteByNumber(quoteNumber);
    await repairerCheckPricePage.activeQuotes.verifyQuoteNumberVisible(quoteNumber);

    // Change to select a different preferred supplier (e.g. "s2")
    const preferredSupplier = "s1";
    await repairerCheckPricePage.activeQuotes.getSupplierTotalAmount(preferredSupplier);
    await repairerCheckPricePage.activeQuotes.selectSupplier(preferredSupplier);
    await repairerCheckPricePage.activeQuotes.verifyYourCostMatchesSupplierTotal(preferredSupplier);
    await repairerCheckPricePage.activeQuotes.clickSaveSelection();
    await repairerCheckPricePage.activeQuotes.confirmPartsDialogAndSave();
    await repairerCheckPricePage.activeQuotes.verifyPartsSelectedForPurchaseVisible();
    await repairerCheckPricePage.activeQuotes.fillPreferredDeliveryDate();
    await repairerCheckPricePage.activeQuotes.selectSupplyNote();
    await repairerCheckPricePage.activeQuotes.selectFromName();
    await repairerCheckPricePage.activeQuotes.clickPurchase();
    await repairerCheckPricePage.activeQuotes.confirmPurchase();
    await repairerCheckPricePage.activeQuotes.verifyPurchaseOrdersSubmitted();
  });
});
