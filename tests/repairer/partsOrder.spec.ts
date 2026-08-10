import { test } from "@playwright/test";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerOrders } from "../../pages/Repairer/RepairerOrders.js";
import { epic } from "allure-js-commons";
import { loadCompletedNormalQuotePool } from "../../helpers/quotePool.js";
import { loadQuoteAttachments } from "../../helpers/attachmentPool.js";

test.describe("Quoting Parts Orders", () => {
  const [quoteNumber] = loadCompletedNormalQuotePool();

  let repairerOrdersPage: RepairerOrders;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Quoting Parts Orders");

    repairerOrdersPage = new RepairerOrders(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Supplier Documents Verification", async () => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(quoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(quoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    // Verify the attachments visible here match what the Supplier uploaded
    const expectedAttachments = loadQuoteAttachments(quoteNumber);
    await repairerOrdersPage.ordersTab.clickDocuments();
    await repairerOrdersPage.ordersTab.verifyAttachments(expectedAttachments);
  })

});
