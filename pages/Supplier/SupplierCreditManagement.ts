import { Locator, Page, FrameLocator, expect } from "@playwright/test";
import { step } from "allure-js-commons";
import { DataGenerators } from "../../helpers/DataGenerators.js";
import { CreditStatusSelection } from "../../helpers/creditStatusPool.js";

// Credit status radio "data-id" values on the Credit Details popup.
// "Viewed" (4) is the default state and must never be picked at random.
const VIEWED_STATUS_ID = "4";
const NON_VIEWED_STATUSES: { id: string; description: string }[] = [
  { id: "7", description: "Return Arranged" },
  { id: "5", description: "Pickup Required" },
  { id: "6", description: "Inspection Pending" },
  { id: "2", description: "Approved" },
  { id: "3", description: "Rejected" },
];
const APPROVED_STATUS_ID = "2";
const REJECTED_STATUS_ID = "3";

//=============================All Credits Request Tab=============================//
export class AllCreditsRequestTab {
  // Locators
  allCreditRequestsTab: Locator;
  allCreditsTable: Locator;
  // Credit Details Popup Locators
  popupFrame: FrameLocator;
  popupOrderNoLink: Locator;
  popupViewedRadios: Locator;
  popupSaveButton: Locator;
  popupApprovedCreditNoteInput: Locator;
  popupApprovedByDropdown: Locator;
  popupRejectedReasonDropdown: Locator;
  popupRejectedByDropdown: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.allCreditRequestsTab = page.locator(".toplist.anchorlink", {hasText: "All Credit Requests"});
    this.allCreditsTable = this.page.locator("td.moreInfoRow[data-id='1'] i.fa-chevron-down");

    // Credit Details Popup Locators
    this.popupFrame = page.frameLocator("iframe.cboxIframe");
    this.popupOrderNoLink = this.popupFrame.locator("tr", { hasText: "Order No:" }).locator("a.link");
    // One "Viewed" radio per part row - used only to discover each row's recordId
    this.popupViewedRadios = this.popupFrame.locator(`input.creditStatus[data-id='${VIEWED_STATUS_ID}']`);
    this.popupSaveButton = this.popupFrame.locator(".saveButton");
    this.popupApprovedCreditNoteInput = this.popupFrame.locator("#approvedCreditNoteNr");
    this.popupApprovedByDropdown = this.popupFrame.locator("#approvedBy");
    this.popupRejectedReasonDropdown = this.popupFrame.locator("#rejectedReasonID");
    this.popupRejectedByDropdown = this.popupFrame.locator("#rejectedBy");
  }
  // Methods
  async clickAllCreditRequests(): Promise<void> {
    await step('Click "All Credit Requests" tab', async () => {
      await this.allCreditRequestsTab.click();
      await expect(this.page).toHaveURL(/credit-management\.php\?action=all$/);
    });
  }

  async clickAllCreditsTable() {
    await step('Expand All Credits Table', async () => {
      await this.allCreditsTable.click();
    });
  }

  // Row for a given Order No within the expanded credit request line items
  creditRequestRow(orderNumber: string): Locator {
    return this.page.locator("tr.invoiceItemsRow").filter({
      has: this.page.locator("td.invoiceRow table tbody tr td:nth-child(2)", {
        hasText: new RegExp(`^${orderNumber}$`),
      }),
    });
  }

  viewCreditDetailsIcon(orderNumber: string): Locator {
    return this.creditRequestRow(orderNumber).locator("img[src*='icon-link']");
  }

  async clickViewCreditDetails(orderNumber: string): Promise<void> {
    await step(`Click view credit details icon for Order No '${orderNumber}'`, async () => {
      await this.viewCreditDetailsIcon(orderNumber).click();
    });
  }

  async verifyPopupOrderNumber(orderNumber: string): Promise<void> {
    await step(`Verify Order No '${orderNumber}' matches in Credit Details popup`, async () => {
      await expect(this.popupOrderNoLink).toHaveText(orderNumber);
    });
  }

  // Radio locator for one part row's given status ("Viewed" excluded by NON_VIEWED_STATUSES)
  private creditStatusRadio(recordId: string, statusId: string): Locator {
    return this.popupFrame.locator(
      `input.creditStatus[data-recordid='${recordId}'][data-id='${statusId}']`,
    );
  }

  async selectRandomCreditStatuses(): Promise<CreditStatusSelection[]> {
    return step("Randomly select a credit status (never 'Viewed') for every part row", async () => {
        const recordIds = await step("Discover part row record IDs from the popup", async () => {
            const attrs = await this.popupViewedRadios.evaluateAll((inputs) =>
              inputs.map((el) => el.getAttribute("data-recordid")),
            );
            return attrs.filter((id): id is string => !!id);
          },
        );

        const selections: CreditStatusSelection[] = [];
        for (const recordId of recordIds) {
          const status = DataGenerators.randomFromArray(NON_VIEWED_STATUSES);
          await step(`Select '${status.description}' status for record '${recordId}'`, async () => {
              await this.creditStatusRadio(recordId, status.id).check();
            },
          );
          selections.push({
            recordId,
            statusId: status.id,
            statusDescription: status.description,
          });
        }
        return selections;
      },
    );
  }

  async fillApprovedCreditNote(): Promise<string> {
    const creditNoteNo = DataGenerators.randomString("CN", 6);
    await step(`Fill Credit Note Number with '${creditNoteNo}'`, async () => {
      await this.popupApprovedCreditNoteInput.fill(creditNoteNo);
    });
    return creditNoteNo;
  }

  async selectApprovedBy(): Promise<string> {
    const values = await DataGenerators.getSelectableValues(this.popupApprovedByDropdown);
    const value = DataGenerators.randomFromArray(values);
    await step(`Select Approved 'Authorised By' option '${value}'`, async () => {
      await this.popupApprovedByDropdown.selectOption(value);
    });
    return value;
  }

  async selectRejectedReason(): Promise<string> {
    const values = await DataGenerators.getSelectableValues(this.popupRejectedReasonDropdown);
    const value = DataGenerators.randomFromArray(values);
    await step(`Select Rejected Reason option '${value}'`, async () => {
      await this.popupRejectedReasonDropdown.selectOption(value);
    });
    return value;
  }

  async selectRejectedBy(): Promise<string> {
    const values = await DataGenerators.getSelectableValues(this.popupRejectedByDropdown);
    const value = DataGenerators.randomFromArray(values);
    await step(`Select Rejected 'Authorised By' option '${value}'`, async () => {
      await this.popupRejectedByDropdown.selectOption(value);
    });
    return value;
  }

  async clickSaveChanges(): Promise<void> {
    await step("Click 'Save Changes' button", async () => {
      await this.popupSaveButton.click();
    });
  }

  async submitRandomCreditStatuses(orderNumber: string): Promise<CreditStatusSelection[]> {
    return step(`Submit random credit statuses for Order No '${orderNumber}'`, async () => {
        const selections = await this.selectRandomCreditStatuses();

        const hasApproved = selections.some((s) => s.statusId === APPROVED_STATUS_ID);
        const hasRejected = selections.some((s) => s.statusId === REJECTED_STATUS_ID);

        let creditNoteNo: string | undefined;
        let rejectedReasonId: string | undefined;

        if (hasApproved) {
          creditNoteNo = await this.fillApprovedCreditNote();
          await this.selectApprovedBy();
        }

        if (hasRejected) {
          rejectedReasonId = await this.selectRejectedReason();
          await this.selectRejectedBy();
        }

        await this.clickSaveChanges();

        return selections.map((s) => {
          if (s.statusId === APPROVED_STATUS_ID) return { ...s, creditNoteNo };
          if (s.statusId === REJECTED_STATUS_ID) return { ...s, rejectedReasonId };
          return s;
        });
      },
    );
  }
}
//=============================Credits Not Opened Tab=============================//
export class CreditsNotOpenedTab {
  // Locators
  creditsNotOpenedTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.creditsNotOpenedTab = page.locator(".toplist.anchorlink", {
      hasText: "Credits Not Opened",
    });
  }
  // Methods
  async clickCreditsNotOpened(): Promise<void> {
    await step('Click "Credits Not Opened" tab', async () => {
      await this.creditsNotOpenedTab.click();
      await expect(this.page).toHaveURL(
        /credit-management\.php\?action=notOpened$/,
      );
    });
  }
}
//============================Credits Opened Tab=============================//
export class CreditsOpenedTab {
  // Locators
  creditsOpenedTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.creditsOpenedTab = page.locator(".toplist.anchorlink", {
      hasText: "Credits Opened",
    });
  }
  // Methods
  async clickCreditsOpened(): Promise<void> {
    await step('Click "Credits Opened" tab', async () => {
      await this.creditsOpenedTab.click();
      await expect(this.page).toHaveURL(
        /credit-management\.php\?action=opened$/,
      );
    });
  }
}
//=============================Suppliers Credit Management=======================//
export class SuppliersCreditManagement {
  readonly allCreditsRequestTab: AllCreditsRequestTab;
  readonly creditsNotOpenedTab: CreditsNotOpenedTab;
  readonly creditsOpenedTab: CreditsOpenedTab;

  creditManagementHeading: Locator;

  constructor(page: Page) {
    this.allCreditsRequestTab = new AllCreditsRequestTab(page);
    this.creditsNotOpenedTab = new CreditsNotOpenedTab(page);
    this.creditsOpenedTab = new CreditsOpenedTab(page);

    this.creditManagementHeading = page.getByRole("heading", {
      name: "Credit Management",
      level: 2,
      exact: true,
    });
  }

  async verifyCreditManagementHeading(): Promise<void> {
    await step('Verify "Credit Management" heading', async () => {
      await expect(this.creditManagementHeading).toBeVisible();
    });
  }
}
