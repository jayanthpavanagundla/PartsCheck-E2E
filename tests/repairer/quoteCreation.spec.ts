import { test } from "@playwright/test";
import path from "path";
import { RepairerNavBar } from "../../pages/Repairer/RepairerNavBar.js";
import { RepairerGetPrice } from "../../pages/Repairer/RepairerGetPrice.js";
import { epic, step } from "allure-js-commons";
import {addQuoteToNormalPool,addQuoteToDirectPool} from "../../helpers/pools/quotePool.js";
import { saveQuoteImages } from "../../helpers/pools/imagePool.js";
import { DataGenerators } from "../../helpers/DataGenerators.js";

const IMAGE_POOL = [
  path.join(__dirname, "../../helpers/images/Img01.jpg"),
  path.join(__dirname, "../../helpers/images/Img02.jpg"),
  path.join(__dirname, "../../helpers/images/Img03.jpg"),
  path.join(__dirname, "../../helpers/images/Img04.jpg"),
  path.join(__dirname, "../../helpers/images/Img05.jpg"),
  path.join(__dirname, "../../helpers/images/Img06.jpg"),
];

const IMAGES_TO_UPLOAD = 3;

test.describe("Repairer: Quote Creation Flow", () => {
  let repairerGetPricePage: RepairerGetPrice;
  let repairerNavBarPage: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Repairer: Quote Creation Flow");

    repairerGetPricePage = new RepairerGetPrice(page);
    repairerNavBarPage = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Normal Quote Creation", async () => {
    test.setTimeout(150_000);

    await repairerNavBarPage.clickGetPrice();
    await repairerGetPricePage.newQuote.clickNewQuote();

    // SECTION 01: Quote Info
    const quoteInfo = await repairerGetPricePage.newQuote.fillQuoteInfoTab("Normal");
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyQuoteInfoTabComplete();

    // SECTION 02: Images
    const imageFiles = DataGenerators.randomSampleFromArray(IMAGE_POOL, IMAGES_TO_UPLOAD);
    await repairerGetPricePage.newQuote.uploadImages(imageFiles);
    await repairerGetPricePage.newQuote.verifyImagesUploaded(imageFiles.length);
    const uploadedImages = await repairerGetPricePage.newQuote.getUploadedImageIdentifiers();
    saveQuoteImages(quoteInfo.quoteNr, uploadedImages);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyImagesTabComplete();

    // SECTION 03: Build Quote
    await repairerGetPricePage.newQuote.clickListView();
    await repairerGetPricePage.newQuote.addFirstPartForAllCategories(10);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyBuildQuoteTabComplete();

    // SECTION 04: Part Type
    await repairerGetPricePage.newQuote.clickSelectAll();
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyPartTypeTabComplete();

    // SECTION 05: Suppliers
    await repairerGetPricePage.newQuote.unselectAllSuppliers();
    await repairerGetPricePage.newQuote.selectPreferredSupplier("s1");
    await repairerGetPricePage.newQuote.selectPreferredSupplier("s3");
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifySuppliersTabComplete();

    // SECTION 06: Select Time
    await repairerGetPricePage.newQuote.selectDateTimeNormalQuote(1,"11:00 am");
    await repairerGetPricePage.newQuote.submitAndCancel();
    await repairerGetPricePage.newQuote.submitAndConfirm();
    await repairerGetPricePage.newQuote.expectQuoteSubmittedSuccessfully();

    // Add the quote number to the Normal Quote pool for later use in the Supplier test
    await step(`Add quote number '${quoteInfo.quoteNr}' to Normal Quote pool`,async () => {
      addQuoteToNormalPool(quoteInfo.quoteNr);
    });
  });

  test("Direct Purchase Quote Creation", async () => {
    test.setTimeout(150_000);

    await repairerNavBarPage.clickGetPrice();
    await repairerGetPricePage.newQuote.clickNewQuote();

    // SECTION 01: Quote Info
    const quoteInfo = await repairerGetPricePage.newQuote.fillQuoteInfoTab("Direct");
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyQuoteInfoTabComplete();

    // SECTION 02: Images
    const imageFiles = DataGenerators.randomSampleFromArray(IMAGE_POOL, IMAGES_TO_UPLOAD);
    await repairerGetPricePage.newQuote.uploadImages(imageFiles);
    await repairerGetPricePage.newQuote.verifyImagesUploaded(imageFiles.length);
    const uploadedImages = await repairerGetPricePage.newQuote.getUploadedImageIdentifiers();
    saveQuoteImages(quoteInfo.quoteNr, uploadedImages);
    await repairerGetPricePage.newQuote.clickNext();
    await repairerGetPricePage.newQuote.verifyImagesTabComplete();

    // SECTION 03: Build Quote
    await repairerGetPricePage.newQuote.clickListView();
    await repairerGetPricePage.newQuote.addFirstPartForAllCategories(10);
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

    // Add the quote number to the Direct Purchase Quote pool for later use in the Supplier test
    await step(`Add quote number '${quoteInfo.quoteNr}' to Direct Purchase Quote pool`,async () => {
      addQuoteToDirectPool(quoteInfo.quoteNr);
    });
  });
});
