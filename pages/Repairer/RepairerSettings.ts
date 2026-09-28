import { Locator, Page, expect } from "@playwright/test";
import { BasePage } from "../../pages/Base/BasePage.js";
import { DataGenerators } from "../../helpers/DataGenerators";
import { step } from "allure-js-commons";
//=============================GENERAL SETTINGS TAB=============================//
export class GeneralSettingsTab {
  // Locators
  generalSettingsTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.generalSettingsTab = page.locator('a[href="general-settings.php"]');
  }
  // Methods
  async clickGeneralSettings() {
    await step("Click on General Settings Tab", async () => {
      await this.generalSettingsTab.click();
      await expect(this.page).toHaveURL(/general-settings\.php/);
      await expect(this.generalSettingsTab).toHaveClass(/\bactive\b/);
    });
  }
}
//=============================ACCOUNT SETTINGS TAB=============================//
export class AccountSettingsTab {
  // Locators
  accountSettingsTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.accountSettingsTab = page.locator('a[href="account-settings.php"]');
  }
  // Methods
  async clickAccountSettings() {
    await step("Click on Account Settings Tab", async () => {
      await this.accountSettingsTab.click();
      await expect(this.page).toHaveURL(/account-settings\.php/);
      await expect(this.accountSettingsTab).toHaveClass(/\bactive\b/);
    });
  }
}
//=============================MARGIN SETTINGS TAB=============================//
export interface PricingRuleRow {
  partType: string;
  accepted: boolean;
  pricingMethod: string;
  value: string;
  partNumberDisplay: string;
}

export class MarginSettingsTab {
  // Locators
  marginSettingsTab: Locator;
  addRuleButton: Locator;
  addRuleHeading: Locator;
  ruleNameInput: Locator;
  ruleNameError: Locator;
  pricingRows: Locator;
  saveButton: Locator;
  // Stored data
  ruleName = "";
  pricingRules: PricingRuleRow[] = [];
  // Constructor
  constructor(protected readonly page: Page) {
    this.marginSettingsTab = page.locator('a[href="margin-settings.php"]');
    this.addRuleButton = page.locator('a[href="margin-settings.php?action=marginSettingsAddRule"]');
    this.addRuleHeading = page.getByText('Add Rule', { exact: true });
    this.ruleNameInput = page.locator("#mrRuleName");
    this.ruleNameError = page.locator("#mrNameError");
    this.pricingRows = page.locator("#marginRuleForm tbody tr[data-part]");
    this.saveButton = page.locator("#mrSaveBtn");
  }
  // Methods
  async clickMarginSettings() {
    await step("Click on Margin Settings Tab", async () => {
      await this.marginSettingsTab.click();
      await expect(this.page).toHaveURL(/margin-settings\.php/);
      await expect(this.marginSettingsTab).toHaveClass(/\bactive\b/);
    });
  }
  async clickAddRule() {
    await step("Click on Add Rule", async () => {
      await this.addRuleButton.click();
      await expect(this.page).toHaveURL(/action=marginSettingsAddRule/);
      await expect(this.addRuleHeading).toBeVisible();
    });
  }
  /** Enters a random rule name, retrying with a new name (max 3 attempts) if it already exists */
  async enterRuleName(maxAttempts = 3): Promise<string> {
    return await step("Enter unique Rule Name", async () => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const name = DataGenerators.randomString("Auto Rule ", 6);
        await this.ruleNameInput.fill(name);
        await this.ruleNameInput.blur();

        // Duplicate-name validation is client side; give it a moment to show the error
        const isDuplicate = await this.ruleNameError
          .waitFor({ state: "visible", timeout: 1500 })
          .then(() => true)
          .catch(() => false);

        if (!isDuplicate) {
          this.ruleName = name;
          return name;
        }
        const message = await this.ruleNameError.textContent();
        console.log(`Attempt ${attempt}: "${name}" rejected - ${message?.trim()}`);
      }
      throw new Error(`Could not enter a unique rule name after ${maxAttempts} attempts`);
    });
  }
  /** Sets Accepted = Yes/No randomly for every part type row, fills the row and stores its values */
  async fillPricingRules(): Promise<PricingRuleRow[]> {
    return await step("Fill Pricing Rules table", async () => {
      this.pricingRules = [];
      const rowCount = await this.pricingRows.count();

      for (let i = 0; i < rowCount; i++) {
        const row = this.pricingRows.nth(i);
        const partType = (await row.getAttribute("data-part"))!;
        const accepted = Math.random() < 0.5;
        const methodSelect = row.locator("select.mr-method");
        const valueInput = row.locator("input.mr-value");
        const partNoSelect = row.locator("td").last().locator("select");

        const rowData = await step(`${partType}: Accepted = ${accepted ? "Yes" : "No"}`, async () => {
          await row.locator(`input.mr-accepted[value="${accepted ? "1" : "0"}"]`).check();

          let pricingMethod: string;
          let value: string;
          if (accepted) {
            pricingMethod = await step("Select Pricing Method", async (ctx) => {
              await DataGenerators.selectRandomOption(methodSelect);
              const text = await this.selectedOptionText(methodSelect);
              await ctx.displayName(`Select Pricing Method: ${text}`);
              return text;
            });
            value = String(DataGenerators.randomPrice(1, 100));
            await step(`Enter Value: ${value}%`, async () => {
              await valueInput.fill(value);
            });
          } else {
            // Not accepted: method locked to Markup on Cost, value defaults to 20 but stays editable
            pricingMethod = await step("Pricing Method locked: Markup on Cost", async () => {
              await expect(methodSelect).toHaveClass(/mr-method-locked/);
              await expect(methodSelect).toHaveValue("2");
              return await this.selectedOptionText(methodSelect);
            });
            value = await step("Value defaults to 20% and is editable", async () => {
              await expect(valueInput).toHaveValue("20");
              await expect(valueInput).toBeEditable();
              return await valueInput.inputValue();
            });
          }
          const partNumberDisplay = await step("Select Part Number Display", async (ctx) => {
            await DataGenerators.selectRandomOption(partNoSelect);
            const text = await this.selectedOptionText(partNoSelect);
            await ctx.displayName(`Select Part Number Display: ${text}`);
            return text;
          });
          return { pricingMethod, value, partNumberDisplay };
        });

        this.pricingRules.push({ partType, accepted, ...rowData });
      }
      return this.pricingRules;
    });
  }
  async clickSaveChanges() {
    await step("Click on Save Changes", async () => {
      await expect(this.saveButton).toBeEnabled();
      await this.saveButton.click();
      await expect(this.page).not.toHaveURL(/action=marginSettingsAddRule/);
    });
  }
  /** Verifies the saved rule's row in "Your Rules" shows the pricing stored by fillPricingRules() */
  async verifySavedRule() {
    await step(`Verify saved rule "${this.ruleName}" in Your Rules`, async () => {
      // Your Rules columns after Rule Name + Applies To: OEM, AFTM, RECO, Parallel, Recycled
      const columnIndex: Record<string, number> = {
        OEM: 2,
        Aftermarket: 3,
        Reconditioned: 4,
        Parallel: 5,
        Recycled: 6,
      };
      const ruleRow = this.page
        .locator("tr.mrDisplayRow")
        .filter({ has: this.page.locator(`[data-rule="${this.ruleName}"]`) });
      await expect(ruleRow).toHaveCount(1);

      for (const rule of this.pricingRules) {
        // "Charge of List" displays as "% of List"; Markup/Show Markup on Cost (and not accepted) as "% Markup of Cost"
        const expected =
          rule.pricingMethod === "Charge of List"
            ? `${rule.value}% of List`
            : `${rule.value}% Markup of Cost`;
        await step(`${rule.partType}: ${expected}`, async () => {
          await expect(ruleRow.locator("td").nth(columnIndex[rule.partType])).toHaveText(expected);
        });
      }
    });
  }
  private async selectedOptionText(select: Locator): Promise<string> {
    return (await select.locator("option:checked").textContent())?.trim() ?? "";
  }
}
//=============================DATA SETTINGS TAB=============================//
export class DataSettingsTab {
  // Locators
  dataSettingsTab: Locator;
  // Constructor
  constructor(protected readonly page: Page) {
    this.dataSettingsTab = page.locator('a[href="data-settings.php"]');
  }
  // Methods
  async clickDataSettings() {
    await step("Click on Data Settings Tab", async () => {
      await this.dataSettingsTab.click();
      await expect(this.page).toHaveURL(/data-settings\.php/);
      await expect(this.dataSettingsTab).toHaveClass(/\bactive\b/);
    });
  }
}
//=============================REPAIRER SETTINGS=======================//
export class RepairerSettings {
  readonly generalSettingsTab: GeneralSettingsTab;
  readonly accountSettingsTab: AccountSettingsTab;
  readonly marginSettingsTab: MarginSettingsTab;
  readonly dataSettingsTab: DataSettingsTab;

  constructor(page: Page) {
    this.generalSettingsTab = new GeneralSettingsTab(page);
    this.accountSettingsTab = new AccountSettingsTab(page);
    this.marginSettingsTab = new MarginSettingsTab(page);
    this.dataSettingsTab = new DataSettingsTab(page);
  }
}
