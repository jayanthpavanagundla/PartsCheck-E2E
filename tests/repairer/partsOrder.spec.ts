import { test } from "@playwright/test";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerOrders } from "../../pages/Repairer/RepairerOrders.js";
import { epic } from "allure-js-commons";
import { loadCompletedNormalQuotePool, loadCompletedDirectQuotePool } from "../../helpers/quotePool.js";
import { loadQuoteAttachments } from "../../helpers/attachmentPool.js";

test.describe("Repairer: Quoting Parts Orders", () => {
  const [normalQuoteNumber] = loadCompletedNormalQuotePool();
  const [directQuoteNumber] = loadCompletedDirectQuotePool();

  let repairerOrdersPage: RepairerOrders;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Repairer: Quoting Parts Orders");

    repairerOrdersPage = new RepairerOrders(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Supplier Documents Verification - Normal Quote", async ({page}) => {
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

  test("Supplier Documents Verification - Direct Purchase Quote", async ({page}) => {
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

  test("Cancel Items - Normal Quote", async ({page}) => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    await repairerOrdersPage.ordersTab.clickCancelItems();
    const cancelledItems = await repairerOrdersPage.ordersTab.selectItemsToCancel(4);
    await repairerOrdersPage.ordersTab.fillCancelReferenceNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.selectCancelReasonAndConfirm();
    await repairerOrdersPage.ordersTab.verifyCancelledItemsVisible(cancelledItems);
  })

  test("Cancel Items - Direct Purchase Quote", async ({page}) => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    await repairerOrdersPage.ordersTab.clickCancelItems();
    const cancelledItems = await repairerOrdersPage.ordersTab.selectItemsToCancel(4);
    await repairerOrdersPage.ordersTab.fillCancelReferenceNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.selectCancelReasonAndConfirm();
    await repairerOrdersPage.ordersTab.verifyCancelledItemsVisible(cancelledItems);
  })

  test("Receive Items - Normal Quote", async ({page}) => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    const receivedItems = await repairerOrdersPage.ordersTab.selectAllItems();
    await repairerOrdersPage.ordersTab.fillReceiptReferenceNumber(normalQuoteNumber);
    const invoiceDate = await repairerOrdersPage.ordersTab.getInvoiceDate();
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.verifyItemsReceivedOnDate(receivedItems, invoiceDate);
  })

  test("Receive Items - Direct Purchase Quote", async ({page}) => {
    await repairerNavBarPage.clickOrders();
    await repairerOrdersPage.ordersTab.clickAllOrders();

    const orderNumber = await repairerOrdersPage.ordersTab.getOrderNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.openOrderByQuoteNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.verifyOrderNumber(orderNumber);

    const receivedItems = await repairerOrdersPage.ordersTab.selectAllItems();
    await repairerOrdersPage.ordersTab.fillReceiptReferenceNumber(directQuoteNumber);
    const invoiceDate = await repairerOrdersPage.ordersTab.getInvoiceDate();
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.verifyItemsReceivedOnDate(receivedItems, invoiceDate);
  })

  test("Items Credit Request - Normal Quote", async ({page}) => {
    const supplier = "s1";

    await repairerNavBarPage.searchForResult(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.verifySearchedQuoteNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.openPurchaserOrderBySupplier(supplier);

    await repairerOrdersPage.ordersTab.clickCreditRequest();
    const creditedItems = await repairerOrdersPage.ordersTab.selectAllItems();
    await repairerOrdersPage.ordersTab.fillCreditReferenceNumber(normalQuoteNumber);
    await repairerOrdersPage.ordersTab.getInvoiceDate();
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.selectCreditRequestDetailsAndConfirm();
    await repairerOrdersPage.ordersTab.verifyItemsCreditPending(creditedItems);
  })

  test("Items Credit Request - Direct Purchase Quote", async ({page}) => {
    const supplier = "s1";

    await repairerNavBarPage.searchForResult(directQuoteNumber);
    await repairerOrdersPage.ordersTab.verifySearchedQuoteNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.openPurchaserOrderBySupplier(supplier);

    await repairerOrdersPage.ordersTab.clickCreditRequest();
    const creditedItems = await repairerOrdersPage.ordersTab.selectAllItems();
    await repairerOrdersPage.ordersTab.fillCreditReferenceNumber(directQuoteNumber);
    await repairerOrdersPage.ordersTab.getInvoiceDate();
    await repairerOrdersPage.ordersTab.clickUpdatePurchaserOrder();
    await repairerOrdersPage.ordersTab.selectCreditRequestDetailsAndConfirm();
    await repairerOrdersPage.ordersTab.verifyItemsCreditPending(creditedItems);
  })
});
