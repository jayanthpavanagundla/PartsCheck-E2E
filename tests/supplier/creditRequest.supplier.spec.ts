import { test, expect } from "@playwright/test";
import { SupplierNavBar } from "../../pages/Supplier/SupplierNavBar.js";
import { SuppliersCreditManagement } from "../../pages/Supplier/SupplierCreditManagement.js";
import { epic, step } from "allure-js-commons";
import { loadCompletedNormalQuotePool, loadCompletedDirectQuotePool } from "../../helpers/quotePool.js";
import { loadQuoteImages, removeQuoteImages } from "../../helpers/imagePool.js";
import { getRandomAttachmentFiles,saveQuoteAttachments } from "../../helpers/attachmentPool.js";
import { saveCreditStatusSelections } from "../../helpers/creditStatusPool.js";

test.describe("Supplier: Credit Request Flow", () => {
  let supplierNavBar: SupplierNavBar;
  let supplierCreditManagement: SuppliersCreditManagement;

    test.beforeEach(async ({ page }) => {
        epic("Supplier: Credit Request Flow");

        supplierNavBar = new SupplierNavBar(page);
        supplierCreditManagement = new SuppliersCreditManagement(page);

        await page.goto(process.env.SUPPLIER_LANDING_URL!);
    });

    test("Credit Request Submission - Normal Quote", async () => {
        await supplierCreditManagement.allCreditsRequestTab.clickAllCreditRequests();
        await supplierCreditManagement.allCreditsRequestTab.clickAllCreditsTable();

        // Order No on the credit request row must match a quote the Repairer has already completed
        const [orderNumber] = await step("Load quote number from completed Normal Quote pool", async () => loadCompletedNormalQuotePool());

        await supplierCreditManagement.allCreditsRequestTab.clickViewCreditDetails(orderNumber);
        await supplierCreditManagement.allCreditsRequestTab.verifyPopupOrderNumber(orderNumber);

        const selections = await supplierCreditManagement.allCreditsRequestTab.submitRandomCreditStatuses(orderNumber);

        // Persist the recordId/statusId/description
        await step(`Save credit status selections for Order No '${orderNumber}' to pool`, async () => {
          saveCreditStatusSelections(orderNumber, selections);
        });

        await supplierNavBar.closePopup();
    });

    test("Credit Request Submission - Direct Purchase Quote", async () => {
        await supplierCreditManagement.allCreditsRequestTab.clickAllCreditRequests();
        await supplierCreditManagement.allCreditsRequestTab.clickAllCreditsTable();

        // Order No on the credit request row must match a quote the Repairer has already completed
        const [orderNumber] = await step("Load quote number from completed Direct Purchase Quote pool", async () => loadCompletedDirectQuotePool());

        await supplierCreditManagement.allCreditsRequestTab.clickViewCreditDetails(orderNumber);
        await supplierCreditManagement.allCreditsRequestTab.verifyPopupOrderNumber(orderNumber);

        const selections = await supplierCreditManagement.allCreditsRequestTab.submitRandomCreditStatuses(orderNumber);

        // Persist the recordId/statusId/description
        await step(`Save credit status selections for Order No '${orderNumber}' to pool`, async () => {
          saveCreditStatusSelections(orderNumber, selections);
        });

        await supplierNavBar.closePopup();
    });
  
});
