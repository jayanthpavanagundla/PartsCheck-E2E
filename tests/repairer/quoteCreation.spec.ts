import { test } from "@playwright/test";
import path from "path";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerGetPrice } from "../../pages/Repairer/RepairerGetPrice.js";
import { epic } from "allure-js-commons";
import { addQuoteToPool, addToCompletedPool } from "../../helpers/quotePool.js";
import { saveQuoteImages } from "../../helpers/imagePool.js";

const imageFiles = [
  path.join(__dirname, "../../helpers/Img01.jpg"),
  path.join(__dirname, "../../helpers/Img02.jpg"),
  path.join(__dirname, "../../helpers/Img03.jpg"),
];

test.describe("Quote Creation Flow", () => {
  let repairerGetPricePage: RepairerGetPrice;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Quote Creation Flow");

    repairerGetPricePage = new RepairerGetPrice(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Normal Quote Creation", async () => {
    test.setTimeout(150_000);

    await repairerNavBarPage.clickGetPrice();
    await repairerGetPricePage.newQuote.clickNewQuote();

    // SECTION 01: Quote Info
    const quoteInfo =
      await repairerGetPricePage.newQuote.fillQuoteInfoTab("Normal");
    // Add Quote Number Quote Pool
    addQuoteToPool(quoteInfo.quoteNr);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyQuoteInfoTabComplete();

    // SECTION 02: Images
    await repairerGetPricePage.newQuote.uploadImages(imageFiles);
    await repairerGetPricePage.newQuote.verifyImagesUploaded(imageFiles.length);
    const uploadedImages =
      await repairerGetPricePage.newQuote.getUploadedImageIdentifiers();
    saveQuoteImages(quoteInfo.quoteNr, uploadedImages);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyImagesTabComplete();

    // SECTION 03: Build Quote
    await repairerGetPricePage.newQuote.clickListView();
    await repairerGetPricePage.newQuote.addFirstPartForAllCategories(2);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyBuildQuoteTabComplete();

    // SECTION 04: Part Type
    await repairerGetPricePage.newQuote.clickSelectAll();
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyPartTypeTabComplete();

    // SECTION 05: Suppliers
    await repairerGetPricePage.newQuote.unselectAllSuppliers();
    await repairerGetPricePage.newQuote.selectPreferredSupplier("s1");
    await repairerGetPricePage.newQuote.selectPreferredSupplier("s2");
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifySuppliersTabComplete();

    // SECTION 06: Select Time
    await repairerGetPricePage.newQuote.selectDateTimeNormalQuote(
      1,
      "11:00 am",
    );
    await repairerGetPricePage.newQuote.submitAndCancel();
    await repairerGetPricePage.newQuote.submitAndConfirm();
    await repairerGetPricePage.newQuote.expectQuoteSubmittedSuccessfully();
  });

  test("Direct Purchase Quote Creation", async () => {
    test.setTimeout(150_000);

    await repairerNavBarPage.clickGetPrice();
    await repairerGetPricePage.newQuote.clickNewQuote();

    // SECTION 01: Quote Info
    const quoteInfo = await repairerGetPricePage.newQuote.fillQuoteInfoTab(
      "Direct",
    );
    // Add Quote Number Quote Pool
    addQuoteToPool(quoteInfo.quoteNr);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyQuoteInfoTabComplete();

    // SECTION 02: Images
    await repairerGetPricePage.newQuote.uploadImages(imageFiles);
    await repairerGetPricePage.newQuote.verifyImagesUploaded(imageFiles.length);
    const uploadedImages =
      await repairerGetPricePage.newQuote.getUploadedImageIdentifiers();
    saveQuoteImages(quoteInfo.quoteNr, uploadedImages);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyImagesTabComplete();

    // SECTION 03: Build Quote
    await repairerGetPricePage.newQuote.clickListView();
    await repairerGetPricePage.newQuote.addFirstPartForAllCategories(2);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyBuildQuoteTabComplete();

    // SECTION 04: Part Type
    await repairerGetPricePage.newQuote.clickSelectAll();
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyPartTypeTabComplete();

    // SECTION 05: Suppliers
    await repairerGetPricePage.newQuote.unselectAllSuppliers();
    await repairerGetPricePage.newQuote.selectPreferredSupplier("s1");
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifySuppliersTabComplete();

    // SECTION 06: Select Time
    await repairerGetPricePage.newQuote.selectDateTimeDirectPurchaseQuote(3);
    await repairerGetPricePage.newQuote.selectPONote("i enjoy stuff");
    await repairerGetPricePage.newQuote.submitAndCancel();
    await repairerGetPricePage.newQuote.submitAndConfirm();
    await repairerGetPricePage.newQuote.expectQuoteSubmittedSuccessfully();
  });
});
