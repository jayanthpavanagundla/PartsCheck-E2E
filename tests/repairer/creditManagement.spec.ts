import { test } from "@playwright/test";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerCredits } from "../../pages/Repairer/RepairerCredits.js";
import { epic, step } from "allure-js-commons";
import { loadCompletedNormalQuotePool, loadCompletedDirectQuotePool, removeQuoteFromCompletedNormalPool, removeQuoteFromCompletedDirectPool } from "../../helpers/quotePool.js";
import { loadCreditStatusSelections, removeCreditStatusSelections } from "../../helpers/creditStatusPool.js";

test.describe("Repairer: Credit Management Flow", () => {
  let repairerNavBarPage: RepairerNavBar;
  let reparierCreditsPage: RepairerCredits;

  test.beforeEach(async ({ page }) => {
    epic("Repairer: Credit Management Flow");

    repairerNavBarPage = new RepairerNavBar(page);
    reparierCreditsPage = new RepairerCredits(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Credit Request Verification - Normal Quote", async () => {
    await repairerNavBarPage.clickCredits();
    await reparierCreditsPage.creditManagement.clickCreditManagement();

    // Order No the Supplier submitted credit statuses against
    const [orderNumber] = await step("Load quote number from completed Normal Quote pool", async () => loadCompletedNormalQuotePool());

    const selections = await step(`Load saved credit status selections for Order No '${orderNumber}'`, async () => loadCreditStatusSelections(orderNumber));

    const supplierName = "s1";
    await reparierCreditsPage.creditManagement.clickSupplierPreview(supplierName);
    await reparierCreditsPage.creditManagement.verifySupplierPreviewExpanded(supplierName);

    await reparierCreditsPage.creditManagement.verifyCreditStatusSelections(selections);

    await step(`Remove Order No '${orderNumber}' from credit status pool after verification`, async () => {
      removeCreditStatusSelections(orderNumber);
    });

    await step(`Remove quote number '${orderNumber}' from completed Normal Quote pool`, async () => {
      removeQuoteFromCompletedNormalPool(orderNumber);
    });
  });

  test("Credit Request Verification - Direct Purchase Quote", async () => {
    await repairerNavBarPage.clickCredits();
    await reparierCreditsPage.creditManagement.clickCreditManagement();

    // Order No the Supplier submitted credit statuses against
    const [orderNumber] = await step("Load quote number from completed Direct Quote pool", async () => loadCompletedDirectQuotePool());

    const selections = await step(`Load saved credit status selections for Order No '${orderNumber}'`, async () => loadCreditStatusSelections(orderNumber));

    const supplierName = "s1";
    await reparierCreditsPage.creditManagement.clickSupplierPreview(supplierName);
    await reparierCreditsPage.creditManagement.verifySupplierPreviewExpanded(supplierName);

    await reparierCreditsPage.creditManagement.verifyCreditStatusSelections(selections);

    await step(`Remove Order No '${orderNumber}' from credit status pool after verification`, async () => {
      removeCreditStatusSelections(orderNumber);
    });

    await step(`Remove quote number '${orderNumber}' from completed Direct Purchase Quote pool`, async () => {
      removeQuoteFromCompletedDirectPool(orderNumber);
    });
  });
});
