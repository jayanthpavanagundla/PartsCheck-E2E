import { test } from "@playwright/test";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerOrders } from "../../pages/Repairer/RepairerOrders.js";
import { epic } from "allure-js-commons";
import { loadCompletedNormalQuotePool, loadCompletedDirectQuotePool } from "../../helpers/quotePool.js";
import { loadQuoteAttachments } from "../../helpers/attachmentPool.js";

test.describe("Quoting Parts Orders", () => {
  const [normalQuoteNumber] = loadCompletedNormalQuotePool();
  const [directQuoteNumber] = loadCompletedDirectQuotePool();

  let repairerOrdersPage: RepairerOrders;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Quoting Parts Orders");

    repairerOrdersPage = new RepairerOrders(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Supplier Documents Verification - Normal Quote", async () => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    // Verify the attachments visible here match what the Supplier uploaded
    const expectedAttachments = loadQuoteAttachments(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.clickDocuments();
    await repairerOrdersPage.ordersTab.verifyAttachments(expectedAttachments);
  })

  test("Supplier Documents Verification - Direct Purchase Quote", async () => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    // Verify the attachments visible here match what the Supplier uploaded
    const expectedAttachments = loadQuoteAttachments(directQuoteNumber);
    await repairerOrdersPage.ordersTab.clickDocuments();
    await repairerOrdersPage.ordersTab.verifyAttachments(expectedAttachments);
  })

});
