import { Locator, Page, expect, FrameLocator } from "@playwright/test";
import { step } from "allure-js-commons";
import { BasePage } from "../Base/BasePage";
//=============================Contact Us Tab=============================//
export class ContactUsTab extends BasePage {
  // Locators
  contactUsTab: Locator;
  contactUsFrame: FrameLocator;
  // Constructor
  constructor(page: Page) {
    super(page);

    this.contactUsTab = page.locator(".toplist.cboxlink", {
      hasText: "Contact Us",
    });

    this.contactUsFrame = page.frameLocator('iframe[src*="bookOnline"]');
  }

  // Methods

  async clickContactUs(): Promise<void> {
    await step('Click "Contact Us" tab', async () => {
      await this.contactUsTab.click();
    });
  }

  async verifyFeedbackForm(): Promise<void> {
    await step('Verify "frmFeedbackContact" form', async () => {
      await this.expectVisible(
        this.contactUsFrame.locator('form[name="frmFeedbackContact"]'),
      );
    });
  }
}
//=============================New Messages Tab=============================//
export class NewMessagesTab {
  // Locators
  messagesTab: Locator;
  messagesFrame: FrameLocator;
  messageTypesLabel: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.messagesTab = page.locator(".toplist.cboxlink", {
      hasText: "New Messages",
    });

    this.messagesFrame = page.frameLocator(
      'iframe[src*="supplierMessagesLookup"]',
    );

    this.messageTypesLabel = this.messagesFrame.getByText("Message Types", {
      exact: true,
    });
  }

  // Methods

  async clickNewMessages(): Promise<void> {
    await step('Click "New Messages" tab', async () => {
      await this.messagesTab.click();
    });
  }

  async verifyMessageTypesLabel(): Promise<void> {
    await step('Verify "Message Types" label is visible', async () => {
      await expect(this.messageTypesLabel).toBeVisible();
    });
  }
}
//============================New Feedback Tab=============================//
export class NewFeedbackTab {
  // Locators
  feedbackTab: Locator;
  feedbackFrame: FrameLocator;
  clientNameHeading: Locator;

  // Constructor
  constructor(protected readonly page: Page) {
    this.feedbackTab = page.locator(".toplist.cboxlink", {
      hasText: "New Feedback",
    });

    this.feedbackFrame = page.frameLocator(
      'iframe[src*="supplierFeedBackLookup"]',
    );

    this.clientNameHeading = this.feedbackFrame.getByText("Client Name", {
      exact: true,
    });
  }

  // Methods

  async clickNewFeedback(): Promise<void> {
    await step('Click "New Feedback" tab', async () => {
      await this.feedbackTab.click();
    });
  }

  async verifyClientNameHeading(): Promise<void> {
    await step('Verify "Client Name" heading is visible', async () => {
      await expect(this.clientNameHeading).toBeVisible();
    });
  }
}
//============================Fill Rate Reporting Tab=============================//
export class FillRateReportingTab {
  // Locators
  fillRateReportingTab: Locator;
  fillRateFrame: FrameLocator;
  graphShouldIncludeText: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.fillRateReportingTab = page.locator(".toplist.cboxlink", {
      hasText: "Fill Rate Reporting",
    });

    this.fillRateFrame = page.frameLocator('iframe[src*="reportsFillRate"]');

    this.graphShouldIncludeText = this.fillRateFrame.getByText(
      "Graph should include:",
      { exact: true },
    );
  }

  // Methods

  async clickFillRateReporting(): Promise<void> {
    await step('Click "Fill Rate Reporting" tab', async () => {
      await this.fillRateReportingTab.click();
    });
  }

  async verifyGraphShouldIncludeText(): Promise<void> {
    await step('Verify "Graph should include:" text is visible', async () => {
      await expect(this.graphShouldIncludeText).toBeVisible();
    });
  }
}
//=============================Supplier Reports And Tools=======================//
export class SupplierReportsAndTools {
  readonly contactUsTab: ContactUsTab;
  readonly newMessagesTab: NewMessagesTab;
  readonly newFeedbackTab: NewFeedbackTab;
  readonly fillRateReportingTab: FillRateReportingTab;

  constructor(page: Page) {
    this.contactUsTab = new ContactUsTab(page);
    this.newMessagesTab = new NewMessagesTab(page);
    this.newFeedbackTab = new NewFeedbackTab(page);
    this.fillRateReportingTab = new FillRateReportingTab(page);
  }
}
