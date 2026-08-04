import { test } from "@playwright/test";
import path from "path";
import { SupplierNavBar } from "../../pages/Supplier/SupplierNavBar.js";
import { SupplierOrders } from "../../pages/Supplier/SupplierOrders.js";
import { SupplierQuotes } from "../../pages/Supplier/SupplierQuotes.js";
import { SuppliersCreditManagement } from "../../pages/Supplier/SupplierCreditManagement.js";
import { SupplierReportsAndTools } from "../../pages/Supplier/SupplierReportsAndTools.js";
import { epic } from "allure-js-commons";
import { addQuoteToPool, addToCompletedPool } from "../../helpers/quotePool.js";

const imageFiles = [
  path.join(__dirname, "../../helpers/Img01.jpg"),
  path.join(__dirname, "../../helpers/Img02.jpg"),
  path.join(__dirname, "../../helpers/Img03.jpg"),
];

test.describe("Submit Quote Flow", () => {
  let supplierNavBar: SupplierNavBar;
  let supplierOrders: SupplierOrders;
  let supplierQuotes: SupplierQuotes;
  let suppliersCreditManagement: SuppliersCreditManagement;
  let supplierReportsAndTools: SupplierReportsAndTools;

  test.beforeEach(async ({ page }) => {
    epic("Submit Quote Flow");

    supplierNavBar = new SupplierNavBar(page);
    supplierOrders = new SupplierOrders(page);
    supplierQuotes = new SupplierQuotes(page);
    suppliersCreditManagement = new SuppliersCreditManagement(page);
    supplierReportsAndTools = new SupplierReportsAndTools(page);

    await page.goto(process.env.SUPPLIER_LANDING_URL!);
  });

  test("Normal Quote Creation", async () => {
    test.setTimeout(150_000);

    await supplierQuotes.newQuotesRequestTab.clickNewQuoteRequest();
    await supplierNavBar.verifyPopupHeading("Incoming Quotes");
    await supplierNavBar.closePopup();

    await supplierQuotes.quotesInProgressTab.clickQuotesInProgress();
    await supplierNavBar.verifyPopupHeading("Incoming Quotes");
    await supplierNavBar.closePopup();

    await supplierOrders.allOrdersTab.clickAllOrders();
    await supplierOrders.allOrdersTab.verifyOrdersContainerVisible();

    await supplierOrders.etaRequestsTab.clickEtaRequests();
    await supplierOrders.etaRequestsTab.verifyEtaHeadingVisible();

    await supplierOrders.etaOverdueTab.clickEtaOverdue();
    await supplierOrders.etaOverdueTab.verifyEtaHeadingVisible();

    await suppliersCreditManagement.allCreditsRequestTab.clickAllCreditRequests();
    await suppliersCreditManagement.verifyCreditManagementHeading();

    await suppliersCreditManagement.creditsNotOpenedTab.clickCreditsNotOpened();
    await suppliersCreditManagement.verifyCreditManagementHeading();

    await suppliersCreditManagement.creditsOpenedTab.clickCreditsOpened();
    await suppliersCreditManagement.verifyCreditManagementHeading();

    await supplierReportsAndTools.contactUsTab.clickContactUs();
    await supplierReportsAndTools.contactUsTab.verifyFeedbackForm();
    await supplierNavBar.closePopup();

    await supplierReportsAndTools.newMessagesTab.clickNewMessages();
    await supplierReportsAndTools.newMessagesTab.verifyMessageTypesLabel();
    await supplierNavBar.closePopup();

    await supplierReportsAndTools.newFeedbackTab.clickNewFeedback();
    await supplierReportsAndTools.newFeedbackTab.verifyClientNameHeading();
    await supplierNavBar.closePopup();

    await supplierReportsAndTools.fillRateReportingTab.clickFillRateReporting();
    await supplierReportsAndTools.fillRateReportingTab.verifyGraphShouldIncludeText();
    await supplierNavBar.closePopup();
  });
});
