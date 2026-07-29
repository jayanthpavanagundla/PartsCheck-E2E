import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../../pages/Base/BasePage.js";
import { DataGenerators } from "../../helpers/DataGenerators";
import { step } from "allure-js-commons";
//=============================QUOTE PACKAGE TAB=============================//
export class QuotePackageTab {
  // Locators
  quotePackage: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.quotePackage = this.page.locator("span.topTabText", {
      hasText: "FROM QUOTE PACKAGE",
    });
  }
  // Methods
  async clickQuotePackage() {
    await step("Click on Quote Package Tab", async () => {
      await this.quotePackage.click();
      await expect(this.page).toHaveURL(/action=getPrice$/);
    });
  }
}
//=============================DRAFT QUOTE TAB=============================//
export class DraftQuoteTab {
  // Locators
  draftQuotes: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.draftQuotes = this.page.locator("span.topTabText", {
      hasText: "DRAFT QUOTES",
    });
  }
  // Methods
  async clickDraftQuotes() {
    await step("Click on Draft Quotes Tab", async () => {
      await this.draftQuotes.click();
      await expect(this.page).toHaveURL(/action=openSaveDrafts$/);
    });
  }
}
//=============================NEW QUOTE TAB=============================//
export interface QuoteInfoData {
  quoteType: "Normal" | "Direct";
  quoteNr: string;
  margin: string;
  estimator: string;
  claimNr: string;
  rego: string;
  vin: string;
  make: string;
  model: string;
  modelNumber: string;
  colour: string;
  transmission: string;
  series: string;
  bodyStyle: string;
  month: string;
  year: string;
  comments: string;
}

export class NewQuoteTab extends BasePage {
  newQuote: Locator;
  quoteInfo!: QuoteInfoData;
  // Quote Info locators
  quoteInfoTab: Locator;
  normalQuoteRadio: Locator;
  directPurchaseRadio: Locator;
  quoteRefInput: Locator;
  quoteDetailsHeading: Locator;
  marginDropdown: Locator;
  estimatorInput: Locator;
  claimNrInput: Locator;
  vehRegoInput: Locator;
  vinInput: Locator;
  makeDropdown: Locator;
  modelInput: Locator;
  modelNumberInput: Locator;
  vehColourInput: Locator;
  vehTransmissionInput: Locator;
  vehSeriesInput: Locator;
  bodyStyleDropdown: Locator;
  monthDropdown: Locator;
  yearDropdown: Locator;
  commentsTextarea: Locator;

  // Next - Previous Locators
  topNextButton: Locator;
  topPrevButton: Locator;

  // Images locators
  imagesTab: Locator;
  private readonly imageFrame;
  imgAddThumbnails: Locator;
  fileUploadInput: Locator;
  viewImageIcons: Locator;

  // Build Quote locators
  buildQuoteTab: Locator;
  private readonly buildFrame;
  listViewButton: Locator;
  categoryList: Locator;

  // Part Type Locators
  partTypeTab: Locator;
  private readonly partsFrame;
  selectAllPartTypes: Locator;
  itemTypeCheckboxes: Locator;

  // Supplier Locators
  supplierTab: Locator;
  unselectAllBtn: Locator;
  supplierRows: Locator;
  supplierCheckboxes: Locator;
  supplierNames: Locator;

  // Select Time
  selectDateReqDropdown: Locator;
  submitButton: Locator;
  alertModal: Locator;
  cancelButton: Locator;
  okButton: Locator;
  successMessage: Locator;
  calendarIcon: Locator;
  calendarPopup: Locator;
  poNoteSelect: Locator;

  constructor(page: Page) {
    super(page);

    this.newQuote = this.page.locator("span.topTabText", {
      hasText: "NEW QUOTE",
    });

    // Quote Info locators
    this.quoteInfoTab = this.page.locator('.l_tab[data-tabid="0"]');
    this.normalQuoteRadio = this.page.locator('label[for="NormalQuote"]');
    this.directPurchaseRadio = this.page.locator('label[for="DirectPurchase"]');
    this.quoteRefInput = this.page.locator("#quoteRef");
    this.quoteDetailsHeading = this.page.locator("#testData");
    this.marginDropdown = this.page.locator("#insurerId");
    this.estimatorInput = this.page.locator("#estimator");
    this.claimNrInput = this.page.locator("#claimNr");
    this.vehRegoInput = this.page.locator("#vehRego");
    this.vinInput = this.page.locator("#vininput");
    this.makeDropdown = this.page.locator("#vehMakeID_FK");
    this.modelInput = this.page.locator("#vehModel");
    this.modelNumberInput = this.page.locator("#vehModelNumber");
    this.vehColourInput = this.page.locator("#vehColour");
    this.vehTransmissionInput = this.page.locator("#vehTransmission");
    this.vehSeriesInput = this.page.locator("#vehSeries");
    this.bodyStyleDropdown = this.page.locator("#bodyStyleID_PK");
    this.monthDropdown = this.page.locator("#vehMonth");
    this.yearDropdown = this.page.locator("#vehYear");
    this.commentsTextarea = this.page.locator("#vehComments");

    // Next - Previous Locators
    this.topNextButton = this.page.locator(".tabbar_button_right .nextbutton");
    this.topPrevButton = this.page.locator(".tabbar_button_left .prevbutton");

    // Images Locators
    this.imagesTab = this.page.locator('.l_tab[data-tabid="1"]');
    this.imageFrame = this.page.frameLocator("#imageIframe");
    this.imgAddThumbnails = this.imageFrame.locator(".imgContainter .imgAdd");
    this.fileUploadInput = this.imageFrame.locator("#image_upload");
    this.viewImageIcons = this.imageFrame.locator(
      ".imageOuter.itemImage .view-img-icon",
    );

    // Build Quote Locators
    this.buildQuoteTab = this.page.locator('.l_tab[data-tabid="2"]');
    this.buildFrame = this.page.frameLocator("#buildIframe");
    this.listViewButton = this.buildFrame.locator(".viewCategorey.listView");
    this.categoryList = this.buildFrame.locator(
      ".tab-menu-content .myCategory.category-list",
    );

    // Part Type Locators
    this.partTypeTab = this.page.locator('.l_tab[data-tabid="3"]');
    this.partsFrame = this.page.frameLocator("#partsIframe");
    this.selectAllPartTypes = this.partsFrame.getByText("Select All", {
      exact: true,
    });
    this.itemTypeCheckboxes = this.partsFrame.locator(
      "input.selectAllCheckBox",
    );

    // Supplier Locators
    this.supplierTab = this.page.locator('.l_tab[data-tabid="4"]');
    this.unselectAllBtn = this.page.locator(
      'input.l_greyButton[value="UNSELECT ALL"]',
    );
    this.supplierRows = this.page.locator(".supplier-col .gridbody");
    this.supplierCheckboxes = this.supplierRows.locator(
      'input[name="supplierSelected[]"]',
    );
    this.supplierNames = this.supplierRows.locator(".supplierName");

    // Select Date
    this.selectDateReqDropdown = this.page.locator("#selectDateReq");
    this.submitButton = this.page.locator("#submit_draft");
    this.alertModal = this.page.locator("form.alertable");
    this.cancelButton = this.page.locator("button.alertable-cancel");
    this.okButton = this.page.locator("button.alertable-ok");
    this.successMessage = this.page.getByText(
      /Your quote has now been sent to your chosen suppliers/i,
    );
    this.calendarIcon = this.page.locator('img[title="Calendar"]');
    this.calendarPopup = this.page.locator("#bypass_prefsupply_ID");
    this.poNoteSelect = this.page.locator("#poNoteSelect");
  }

  // New Quote Tab

  async clickNewQuote() {
    await step("Click on New Quote Tab", async () => {
      await this.newQuote.click();
      await expect(this.page).toHaveURL(/action=getPriceManual$/);
    });
  }

  // Next - Previous Methods

  async clickNext() {
    await step("Click top Next button to advance tab", async () => {
      await this.topNextButton.click();
    });
  }

  async clickPrev() {
    await step("Click top Prev button to go back a tab", async () => {
      await this.topPrevButton.click();
    });
  }

  // SECTION 01 : Quote Info

  async selectQuoteType(type: "Normal" | "Direct") {
    await step(`Select Quote Type: ${type}`, async () => {
      if (type === "Normal") {
        await this.normalQuoteRadio.click();
        await expect(this.page.locator("#NormalQuote")).toBeChecked();
      } else {
        await this.directPurchaseRadio.click();
        await expect(this.page.locator("#DirectPurchase")).toBeChecked();
      }
    });
  }

  async fillQuoteNumber(): Promise<string> {
    const quoteNr = DataGenerators.randomNumber(6);
    await step(`Fill Quote Number: ${quoteNr}`, async () => {
      await this.quoteRefInput.clear();
      await this.quoteRefInput.fill(quoteNr);
    });
    return quoteNr;
  }

  async selectMargin(): Promise<string> {
    const margin = await DataGenerators.selectRandomOption(
      this.marginDropdown,
    );
    await step(`Select Margin: ${margin}`, async () => {});
    return margin;
  }

  async fillEstimator(): Promise<string> {
    const estimator = DataGenerators.randomString("Estimator-", 3);
    await step(`Fill Estimator: ${estimator}`, async () => {
      await this.estimatorInput.clear();
      await this.estimatorInput.fill(estimator);
    });
    return estimator;
  }

  async fillClaimNumber(): Promise<string> {
    const claimNr = DataGenerators.randomString("CL", 6);
    await step(`Fill Claim Number: ${claimNr}`, async () => {
      await this.claimNrInput.clear();
      await this.claimNrInput.fill(claimNr);
    });
    return claimNr;
  }

  async fillRegistration(): Promise<string> {
    const rego = DataGenerators.randomString("RN", 6);
    await step(`Fill Registration: ${rego}`, async () => {
      await this.vehRegoInput.clear();
      await this.vehRegoInput.fill(rego);
    });
    return rego;
  }

  async fillVIN(): Promise<string> {
    const vin = DataGenerators.randomString("VIN", 14);
    await step(`Fill VIN: ${vin}`, async () => {
      await this.vinInput.clear();
      await this.vinInput.fill(vin);
    });
    return vin;
  }

  async selectMake(): Promise<string> {
    await step("Select Make: Toyota", async () => {
      await this.makeDropdown.selectOption({ label: "Toyota" });
    });
    return "Toyota";
  }

  async fillModel(): Promise<string> {
    const model = DataGenerators.randomString("MOD", 6);
    await step(`Fill Model: ${model}`, async () => {
      await this.modelInput.clear();
      await this.modelInput.fill(model);
    });
    return model;
  }

  async fillModelNumber(): Promise<string> {
    const modelNumber = DataGenerators.randomNumber(9);
    await step(`Fill Model Number: ${modelNumber}`, async () => {
      await this.modelNumberInput.clear();
      await this.modelNumberInput.fill(modelNumber);
    });
    return modelNumber;
  }

  async fillColour(): Promise<string> {
    const colour = DataGenerators.randomColor();
    await step(`Fill Colour: ${colour}`, async () => {
      await this.vehColourInput.clear();
      await this.vehColourInput.fill(colour);
    });
    return colour;
  }

  async fillTransmission(): Promise<string> {
    const options = ["Manual", "Automatic", "Hybrid"];
    const transmission = DataGenerators.randomFromArray(options);
    await step(`Fill Transmission: ${transmission}`, async () => {
      await this.vehTransmissionInput.clear();
      await this.vehTransmissionInput.fill(transmission);
    });
    return transmission;
  }

  async fillSeries(): Promise<string> {
    const options = ["v1", "v2", "v3", "v4", "v5"];
    const series = DataGenerators.randomFromArray(options);
    await step(`Fill Series: ${series}`, async () => {
      await this.vehSeriesInput.clear();
      await this.vehSeriesInput.fill(series);
    });
    return series;
  }

  async selectRandomBodyStyle(): Promise<string> {
    const bodyStyle = await DataGenerators.selectRandomOption(
      this.bodyStyleDropdown,
    );
    await step(`Select Body Style: ${bodyStyle}`, async () => {});
    return bodyStyle;
  }

  async selectRandomMonth(): Promise<string> {
    const month = await DataGenerators.selectRandomOption(this.monthDropdown);
    await step(`Select Month: ${month}`, async () => {});
    return month;
  }

  async selectRandomYear(): Promise<string> {
    const year = await DataGenerators.selectRandomOption(this.yearDropdown);
    await step(`Select Year: ${year}`, async () => {});
    return year;
  }

  async fillComments(): Promise<string> {
    const comments = DataGenerators.randomString("Comments:", 20);
    await step(`Fill Comments: ${comments}`, async () => {
      await this.commentsTextarea.clear();
      await this.commentsTextarea.fill(comments);
    });
    return comments;
  }

  async fillQuoteInfoTab(
    quoteType: "Normal" | "Direct" = "Normal",
  ): Promise<QuoteInfoData> {
    await this.selectQuoteType(quoteType);
    const quoteNr = await this.fillQuoteNumber();
    const margin = await this.selectMargin();
    const estimator = await this.fillEstimator();
    const claimNr = await this.fillClaimNumber();
    const rego = await this.fillRegistration();
    const vin = await this.fillVIN();
    const make = await this.selectMake();
    const model = await this.fillModel();
    const modelNumber = await this.fillModelNumber();
    const colour = await this.fillColour();
    const transmission = await this.fillTransmission();
    const series = await this.fillSeries();
    const bodyStyle = await this.selectRandomBodyStyle();
    const month = await this.selectRandomMonth();
    const year = await this.selectRandomYear();
    const comments = await this.fillComments();
    this.quoteInfo = {
      quoteType,
      quoteNr,
      margin,
      estimator,
      claimNr,
      rego,
      vin,
      make,
      model,
      modelNumber,
      colour,
      transmission,
      series,
      bodyStyle,
      month,
      year,
      comments,
    };
    return this.quoteInfo;
  }

  async verifyQuoteInfoTabComplete() {
    await step("Verify Quote Info tab is marked complete", async () => {
      await expect(this.quoteInfoTab).toHaveClass(/complete/);
    });
  }

  // SECTION 02 : Images Methods

  async uploadImages(filePaths: string[]) {
    await step(`Upload ${filePaths.length} images`, async () => {
      await this.fileUploadInput.setInputFiles(filePaths);
    });
  }

  async verifyImagesUploaded(count: number) {
    await step(`Verify ${count} images uploaded successfully`, async () => {
      await expect(this.viewImageIcons).toHaveCount(count);
    });
  }

  async verifyImagesTabComplete() {
    await step("Verify Images tab is marked complete", async () => {
      await expect(this.imagesTab).toHaveClass(/complete/);
    });
  }

  // SECTION 03 : Build Quote Methods

  async clickListView() {
    await step("Click List View button", async () => {
      await this.listViewButton.click();
    });
  }

  private async waitForCategoriesLoaded() {
    await step("Wait for category list to load", async () => {
      try {
        await this.categoryList.first().waitFor({ state: "attached" });
      } catch {
        const html = await this.buildFrame
          .locator(".tab-menu-content")
          .innerHTML()
          .catch(() => "<could not read .tab-menu-content>");
        throw new Error(
          `Category list never loaded.\nCurrent .tab-menu-content markup:\n${html}`,
        );
      }
    });
  }

  async addFirstPartFromCategory(index: number) {
    await step(`Select category ${index} and add a random part`, async () => {
      await this.waitForCategoriesLoaded();
      const category = this.categoryList.nth(index);
      await category.scrollIntoViewIfNeeded();
      await category.click();

      const selectorActions = this.buildFrame.locator(
        ".build-content .lineItem.itemTypeRow1 .selector-action:visible",
      );
      const partCount = await selectorActions.count();
      const randomIndex = Math.floor(Math.random() * partCount);
      const selectorAction = selectorActions.nth(randomIndex);
      const itemId = await selectorAction
        .locator('input[name="itemID"]')
        .getAttribute("value");

      await selectorAction.locator(".add-action").click();

      await expect(
        this.buildFrame.locator(
          `.build-right-content .selection-content[data-itemid="${itemId}"] .childEditText`,
        ),
      ).toBeVisible();
    });
  }

  async addFirstPartForAllCategories(maxCategories?: number) {
    await step("Add first part for every category", async () => {
      await this.waitForCategoriesLoaded();
      const categoryCount = await this.categoryList.count();
      const limit =
        maxCategories !== undefined
          ? Math.min(categoryCount, maxCategories)
          : categoryCount;
      for (let i = 0; i < limit; i++) {
        await this.addFirstPartFromCategory(i);
      }
    });
  }

  async verifyBuildQuoteTabComplete() {
    await step("Verify Build Quote tab is marked complete", async () => {
      await expect(this.buildQuoteTab).toHaveClass(/complete/);
    });
  }

  // SECTION 04 : Part Type

  async clickSelectAll() {
    await step("Click on 'Select All' link", async () => {
      await this.selectAllPartTypes.click();
    });
  }

  async verifyPartTypeTabComplete() {
    await step("Verify Part Type tab is marked complete", async () => {
      await expect(this.partTypeTab).toHaveClass(/complete/);
    });
  }

  // SECTION 05 : Suppliers

  async unselectAllSuppliers() {
    await step("Unselecting all Suppliers checkbox", async () => {
      await this.unselectAllBtn.click();
    });
  }

  async selectPreferredSupplier(supplierName: string) {
    const supplierRow = this.page
      .locator("#supplierBox .gridbody")
      .filter({
        has: this.page.locator("span.supplierName", {
          hasText: new RegExp(`^\\s*${supplierName}\\s*$`),
        }),
      })
      .first();
    await this.expectVisible(supplierRow);

    await supplierRow.locator(".saveRow label.toggleSelectALl").click();
    await expect(
      supplierRow.locator('input[name="supplierSelected[]"]'),
    ).toBeChecked();
  }

  async verifySuppliersTabComplete() {
    await step("Verify Suppliers tab is marked complete", async () => {
      await expect(this.supplierTab).toHaveClass(/complete/);
    });
  }

  // SECTION 06 : Select Time

  async selectDateTimeNormalQuote(optionIndex = 1, timeLabel = "3:30 am") {
    const dateValue = await this.selectDateReqDropdown
      .locator("option")
      .nth(optionIndex)
      .getAttribute("value");

    await this.selectDateReqDropdown.selectOption(dateValue);

    const targetSlot = this.page.locator(
      `.timeLiTxt.l_greyButton[data-timedate="${dateValue}"]`,
      { hasText: timeLabel },
    );

    await this.expectVisible(targetSlot);
    await targetSlot.click();
  }

  async selectDateTimeDirectPurchaseQuote(daysFromToday = 3) {
    await this.calendarIcon.click();

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromToday);
    const day = targetDate.getDate().toString();

    await this.expectVisible(this.calendarPopup);

    await this.calendarPopup
      .locator("#bypass_prefsupply_DayTable_ID td.calendarDateInput", {
        hasText: day,
      })
      .first()
      .click();
  }

  async selectPONote(label: string) {
    await this.poNoteSelect.selectOption({ label });
  }

  async submitAndCancel() {
    await this.submitButton.click();
    await this.expectVisible(this.alertModal);
    await this.cancelButton.click();
    await this.expectHidden(this.alertModal);
  }

  async submitAndConfirm() {
    await this.submitButton.click();
    await this.expectVisible(this.alertModal);
    await this.okButton.click();
  }

  async expectQuoteSubmittedSuccessfully() {
    await this.expectVisible(this.successMessage);
  }
}
//=============================REPAIRER GET PRICE=======================//
export class RepairerGetPrice {
  readonly quotePackage: QuotePackageTab;
  readonly draftQuote: DraftQuoteTab;
  readonly newQuote: NewQuoteTab;

  constructor(page: Page) {
    this.quotePackage = new QuotePackageTab(page);
    this.draftQuote = new DraftQuoteTab(page);
    this.newQuote = new NewQuoteTab(page);
  }
}
