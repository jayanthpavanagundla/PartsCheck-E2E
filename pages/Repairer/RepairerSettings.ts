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
  editRuleHeading: Locator;
  fullEditButtons: Locator;
  ruleNameInput: Locator;
  ruleNameError: Locator;
  pricingRows: Locator;
  saveButton: Locator;
  nonDefaultRuleButtons: Locator;
  // Stored data
  ruleName = "";
  defaultRuleName = "";
  previousDefaultRuleName = "";
  pinnedRuleName = "";
  secondPinnedRuleName = "";
  systemRuleName = "";
  systemRuleCopyHref = "";
  systemRulePricing: Record<string, string> = {};
  inlineEditRuleId = "";
  // System Rules / Your Rules columns after Rule Name + Applies To: OEM, AFTM, RECO, Parallel, Recycled
  private readonly partColumnIndex: Record<string, number> = {
    OEM: 2,
    Aftermarket: 3,
    Reconditioned: 4,
    Parallel: 5,
    Recycled: 6,
  };
  pricingRules: PricingRuleRow[] = [];
  // Constructor
  constructor(protected readonly page: Page) {
    this.marginSettingsTab = page.locator('a[href="margin-settings.php"]');
    this.addRuleButton = page.locator('a[href="margin-settings.php?action=marginSettingsAddRule"]');
    this.addRuleHeading = page.getByText('Add Rule', { exact: true });
    this.editRuleHeading = page.getByText('Edit Rule', { exact: true });
    this.fullEditButtons = page.locator('tr.mrDisplayRow button[data-action="full-edit"]');
    this.ruleNameInput = page.locator("#mrRuleName");
    this.ruleNameError = page.locator("#mrNameError");
    this.pricingRows = page.locator("#marginRuleForm tbody tr[data-part]");
    this.saveButton = page.locator("#mrSaveBtn");
    this.nonDefaultRuleButtons = page.locator('tr.mrDisplayRow button[data-action="set-default"][data-default="0"]');
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
  /** Picks a random rule from "Your Rules", clicks its Full Edit button and stores its name */
  async clickFullEditOnRandomRule(): Promise<string> {
    return await step("Click Full Edit on a random rule", async (ctx) => {
      const count = await this.fullEditButtons.count();
      expect(count, "Your Rules should have at least one rule").toBeGreaterThan(0);
      const editButton = this.fullEditButtons.nth(Math.floor(Math.random() * count));
      this.ruleName = (await editButton.getAttribute("data-rule"))!;
      await ctx.displayName(`Click Full Edit on rule: ${this.ruleName}`);

      await editButton.click();
      await expect(this.editRuleHeading).toBeVisible();
      await expect(this.ruleNameInput).toHaveValue(this.ruleName);
      return this.ruleName;
    });
  }
  /** Enters a random rule name, retrying with a new name (max 3 attempts) if it already exists */
  async enterRuleName(maxAttempts = 3): Promise<string> {
    return await step("Enter unique Rule Name", async (ctx) => {
      this.ruleName = await this.fillUniqueRuleName(this.ruleNameInput, this.ruleNameError, maxAttempts);
      await ctx.displayName(`Enter unique Rule Name: ${this.ruleName}`);
      return this.ruleName;
    });
  }
  /** Fills a random rule name, retrying with a new name if the duplicate-name error shows */
  private async fillUniqueRuleName(input: Locator, error: Locator, maxAttempts: number): Promise<string> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const name = DataGenerators.randomString("Auto Rule ", 6);
      await input.fill(name);
      await input.blur();

      // Duplicate-name validation is client side; give it a moment to show the error
      const isDuplicate = await error
        .waitFor({ state: "visible", timeout: 1500 })
        .then(() => true)
        .catch(() => false);

      if (!isDuplicate) {
        return name;
      }
      const message = await error.textContent();
      console.log(`Attempt ${attempt}: "${name}" rejected - ${message?.trim()}`);
    }
    throw new Error(`Could not enter a unique rule name after ${maxAttempts} attempts`);
  }
  /**
   * Fills every part type row and stores its values.
   * "allYes": every part type Accepted = Yes. "oneNo": one random part type Accepted = No, the rest Yes.
   */
  async fillPricingRules(acceptance: "allYes" | "oneNo" = "allYes"): Promise<PricingRuleRow[]> {
    return await step(`Fill Pricing Rules table (${acceptance})`, async () => {
      this.pricingRules = [];
      const rowCount = await this.pricingRows.count();
      const declinedIndex = acceptance === "oneNo" ? Math.floor(Math.random() * rowCount) : -1;

      for (let i = 0; i < rowCount; i++) {
        const row = this.pricingRows.nth(i);
        const partType = (await row.getAttribute("data-part"))!;
        const accepted = i !== declinedIndex;
        const methodSelect = row.locator("select.mr-method");
        const valueInput = row.locator("input.mr-value");
        const partNoSelect = row.locator("td").last().locator("select");

        const rowData = await step(`${partType}: Accepted = ${accepted ? "Yes" : "No"}`, async () => {
          if (!accepted) {
            // Toggle via Yes so an existing rule already set to No gets reset to the declined defaults
            await row.locator('input.mr-accepted[value="1"]').check();
          }
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
          await this.verifyExceptionAutoRow(partType, accepted);
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
  /** Not accepted: Exceptions shows a "Not accepted | <part> | From pricing rule" row for the part. Accepted: that row is hidden */
  private async verifyExceptionAutoRow(partType: string, accepted: boolean) {
    await step(`Verify Exceptions section for ${partType}`, async () => {
      const excBody = this.page.locator("#mrExcBody");
      if (!(await excBody.isVisible())) {
        await step("Expand Exceptions section", async () => {
          await this.page.locator("#mrExcToggle").click();
          await expect(excBody).toBeVisible();
        });
      }
      const autoRow = this.page.locator(`#mrExcAutoRows .mr-exc-auto-row[data-part="${partType}"]`);
      if (accepted) {
        await step(`Verify "Not accepted" exception row for ${partType} is not shown`, async () => {
          await expect(autoRow).toBeHidden();
        });
        return;
      }
      const cells = autoRow.locator("span");
      await step(`Verify "Not accepted" exception row for ${partType} is shown`, async () => {
        await expect(autoRow).toBeVisible();
      });
      await step('Verify badge text: "Not accepted"', async () => {
        await expect(cells.nth(0)).toHaveText("Not accepted");
      });
      await step(`Verify part type: "${partType}"`, async () => {
        await expect(cells.nth(1)).toHaveText(partType);
      });
      await step('Verify source: "From pricing rule"', async () => {
        await expect(cells.nth(2)).toHaveText("From pricing rule");
      });
    });
  }
  async clickSaveChanges() {
    await step("Click on Save Changes", async () => {
      await expect(this.saveButton).toBeEnabled();
      await this.saveButton.click();
      // Back on the rules list ("+ Add rule" only exists there), from both Add and Edit forms
      await expect(this.addRuleButton).toBeVisible();
    });
  }
  /** Verifies the saved rule's row in "Your Rules" shows the pricing stored by fillPricingRules() */
  async verifySavedRule() {
    await step(`Verify saved rule "${this.ruleName}" in Your Rules`, async () => {
      const columnIndex = this.partColumnIndex;
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
  /** Deletes the rule created by this test via the Delete popup, then verifies it is gone after refresh */
  async deleteSavedRule() {
    await step(`Delete rule "${this.ruleName}"`, async () => {
      const ruleRow = this.page
        .locator("tr.mrDisplayRow")
        .filter({ has: this.page.locator(`[data-rule="${this.ruleName}"]`) });
      const deleteModal = this.page.locator("#marginDeleteModal");

      await step("Click Delete icon on the rule row", async () => {
        await ruleRow.locator('button[data-action="delete"]').click();
        await expect(deleteModal).toBeVisible();
      });
      await step('Verify popup message "Are you sure you want to delete this rule?"', async () => {
        await expect(deleteModal).toContainText("Are you sure you want to delete this rule?");
      });
      await step("Click Delete Rule in popup", async () => {
        await deleteModal.locator("button.marginDeleteConfirm").click();
        await expect(deleteModal).toBeHidden();
        await expect(ruleRow).toHaveCount(0);
      });
      await step("Refresh and verify rule is not in Your Rules", async () => {
        await this.page.reload();
        await expect(this.addRuleButton).toBeVisible();
        await expect(ruleRow).toHaveCount(0);
      });
    });
  }
  /** Stores and logs the current default rule, which may be a System Rule or one of Your Rules */
  async capturePreviousDefaultRule(): Promise<string> {
    return await step("Capture previous default rule", async (ctx) => {
      const currentDefault = this.page.locator('button[data-action="set-default"][data-default="1"]');
      await expect(currentDefault, "Exactly one rule (System or Your Rules) must be the default").toHaveCount(1);
      this.previousDefaultRuleName = (await currentDefault.getAttribute("data-rule"))!;
      // Your Rules rows are tr.mrDisplayRow; System Rules rows are not
      const isYourRule = (await this.ruleRow(this.previousDefaultRuleName).count()) > 0;
      await ctx.displayName(
        `Previous default rule: ${this.previousDefaultRuleName} (${isYourRule ? "Your Rules" : "System Rules"})`
      );
      return this.previousDefaultRuleName;
    });
  }
  /** Picks a random non-default rule from "Your Rules", clicks its Set as default button and stores its name */
  async setRandomRuleAsDefault(): Promise<string> {
    await this.capturePreviousDefaultRule();
    return await step("Set a random rule from Your Rules as default", async (ctx) => {
      const count = await this.nonDefaultRuleButtons.count();
      expect(count, "Your Rules should have at least one non-default rule").toBeGreaterThan(0);
      const setDefaultButton = this.nonDefaultRuleButtons.nth(Math.floor(Math.random() * count));
      this.defaultRuleName = (await setDefaultButton.getAttribute("data-rule"))!;
      await ctx.displayName(
        `Set rule as default: ${this.defaultRuleName} (previous: ${this.previousDefaultRuleName})`
      );

      await setDefaultButton.click();
      await expect(this.ruleRow(this.defaultRuleName).locator('button[data-action="set-default"]'))
        .toHaveAttribute("data-default", "1");
      return this.defaultRuleName;
    });
  }
  /** Reloads after a short wait and verifies the rule set by setRandomRuleAsDefault() is the only one with the DEFAULT pill */
  async verifyDefaultRule() {
    await step(`Verify rule "${this.defaultRuleName}" is the default rule`, async () => {
      await step("Wait and reload Margin Settings", async () => {
        await this.page.waitForTimeout(2500);
        await this.page.reload();
        await expect(this.addRuleButton).toBeVisible();
      });
      const ruleRow = this.ruleRow(this.defaultRuleName);
      await step("Verify DEFAULT pill is shown on the rule", async () => {
        await expect(ruleRow.locator("td").first().getByText("DEFAULT", { exact: true })).toBeVisible();
      });
      await step("Verify Set as default button is marked current default", async () => {
        const setDefaultButton = ruleRow.locator('button[data-action="set-default"]');
        await expect(setDefaultButton).toHaveAttribute("data-default", "1");
        await expect(setDefaultButton).toBeDisabled();
      });
      await step(`Verify previous default "${this.previousDefaultRuleName}" is no longer default`, async () => {
        await expect(
          this.page.locator(
            `button[data-action="set-default"][data-rule="${this.previousDefaultRuleName}"][data-default="1"]`
          )
        ).toHaveCount(0);
      });
      await step("Verify no other rule (System or Your Rules) is default", async () => {
        await expect(this.page.locator('button[data-action="set-default"][data-default="1"]')).toHaveCount(1);
      });
    });
  }
  /** Uses the pinned rule in the first row of Your Rules; if nothing is pinned, pins a random rule. Verifies it is the first row */
  async ensurePinnedRule(): Promise<string> {
    return await step("Verify Your Rules has a pinned rule", async (ctx) => {
      const rules = await this.getYourRulesOrder();
      expect(rules.length, "Your Rules should have at least one rule").toBeGreaterThan(0);

      if (rules[0].pinned) {
        this.pinnedRuleName = rules[0].name;
        await ctx.displayName(`Pinned rule already present: ${this.pinnedRuleName}`);
      } else {
        this.pinnedRuleName = rules[Math.floor(Math.random() * rules.length)].name;
        await ctx.displayName(`No pinned rules - selected rule to pin: ${this.pinnedRuleName}`);
        await this.togglePin(this.pinnedRuleName, true);
        await this.reloadMarginSettings();
      }
      await this.verifyPinState(this.pinnedRuleName, true);
      await step(`Verify "${this.pinnedRuleName}" is the first row of Your Rules`, async () => {
        await expect(this.page.locator("tr.mrDisplayRow").first()).toHaveAttribute("data-rule-id",
          (await this.favouriteButton(this.pinnedRuleName).getAttribute("data-rule-id"))!);
      });
      return this.pinnedRuleName;
    });
  }
  /** Pins a random unpinned rule, reloads and verifies it is pinned and sits in the pinned block at the top */
  async pinAnotherRule(): Promise<string> {
    return await step("Pin another rule", async (ctx) => {
      const unpinned = (await this.getYourRulesOrder()).filter((r) => !r.pinned);
      expect(unpinned.length, "Your Rules should have at least one unpinned rule").toBeGreaterThan(0);
      this.secondPinnedRuleName = unpinned[Math.floor(Math.random() * unpinned.length)].name;
      await ctx.displayName(`Pin another rule: ${this.secondPinnedRuleName}`);

      await this.togglePin(this.secondPinnedRuleName, true);
      await this.reloadMarginSettings();
      await this.verifyPinState(this.secondPinnedRuleName, true);
      return this.secondPinnedRuleName;
    });
  }
  /** Unpins the rule pinned by pinAnotherRule(), reloads and verifies it is unpinned and below the pinned rules */
  async unpinSecondRule() {
    await step(`Unpin rule "${this.secondPinnedRuleName}"`, async () => {
      await this.togglePin(this.secondPinnedRuleName, false);
      await this.reloadMarginSettings();
      await this.verifyPinState(this.secondPinnedRuleName, false);
    });
  }
  /** Clicks the Pin/Unpin (favourite) button and waits for data-favourite to flip */
  private async togglePin(ruleName: string, pin: boolean) {
    await step(`Click ${pin ? "Pin to top" : "Unpin from top"} on "${ruleName}"`, async () => {
      const button = this.favouriteButton(ruleName);
      await expect(button).toHaveAttribute("data-favourite", pin ? "0" : "1");
      await button.click();
      await expect(this.favouriteButton(ruleName)).toHaveAttribute("data-favourite", pin ? "1" : "0");
    });
  }
  private async reloadMarginSettings() {
    await step("Wait and reload Margin Settings", async () => {
      await this.page.waitForTimeout(2500);
      await this.page.reload();
      await expect(this.addRuleButton).toBeVisible();
    });
  }
  /** Verifies pin attribute/icon and position: pinned rules sit above every unpinned rule */
  private async verifyPinState(ruleName: string, pinned: boolean) {
    await step(`Verify "${ruleName}" is ${pinned ? "pinned" : "unpinned"}`, async () => {
      const pinIcon = this.ruleRow(ruleName).locator("td").first().locator('span[title="Pinned to top"]');
      await expect(this.favouriteButton(ruleName)).toHaveAttribute("data-favourite", pinned ? "1" : "0");
      if (pinned) {
        await expect(pinIcon).toBeVisible();
      } else {
        await expect(pinIcon).toHaveCount(0);
      }

      const rules = await this.getYourRulesOrder();
      const pinnedCount = rules.filter((r) => r.pinned).length;
      const index = rules.findIndex((r) => r.name === ruleName);
      await step(`Row position: ${index + 1} of ${rules.length} (${pinnedCount} pinned)`, async () => {
        expect(
          rules.slice(0, pinnedCount).every((r) => r.pinned),
          "All pinned rules should be at the top of Your Rules"
        ).toBe(true);
        if (pinned) {
          expect(index, `"${ruleName}" should be in the pinned rows at the top`).toBeLessThan(pinnedCount);
        } else {
          expect(index, `"${ruleName}" should be below the pinned rows`).toBeGreaterThanOrEqual(pinnedCount);
          expect(index, `"${ruleName}" should not be the first row`).toBeGreaterThan(0);
        }
      });
    });
  }
  /** Your Rules in display order with each rule's pinned state */
  private async getYourRulesOrder(): Promise<{ name: string; pinned: boolean }[]> {
    return await this.page.locator('tr.mrDisplayRow button[data-action="favourite"]').evaluateAll((buttons) =>
      buttons.map((b) => ({
        name: b.getAttribute("data-rule") ?? "",
        pinned: b.getAttribute("data-favourite") === "1",
      }))
    );
  }
  /** Picks a random System Rule and captures its pricing (e.g. "100% of List") per part type */
  async selectRandomSystemRule(): Promise<string> {
    return await step("Select a random System Rule", async (ctx) => {
      const copyLinks = this.page.locator('a[href*="action=marginSettingsCopyTemplate"]');
      const count = await copyLinks.count();
      expect(count, "System Rules should have at least one rule").toBeGreaterThan(0);
      const copyLink = copyLinks.nth(Math.floor(Math.random() * count));
      this.systemRuleCopyHref = (await copyLink.getAttribute("href"))!;

      const row = copyLink.locator("xpath=ancestor::tr[1]");
      this.systemRuleName = (await row.locator("td").first().locator("div").first().textContent())!.trim();
      await ctx.displayName(`Select System Rule: ${this.systemRuleName}`);

      this.systemRulePricing = {};
      for (const [partType, index] of Object.entries(this.partColumnIndex)) {
        const text = (await row.locator("td").nth(index).textContent())!.trim();
        this.systemRulePricing[partType] = text;
        await step(`Captured ${partType}: ${text}`, async () => {});
      }
      return this.systemRuleName;
    });
  }
  async clickCopyAndCustomise() {
    await step(`Click Copy & customise on "${this.systemRuleName}"`, async () => {
      await this.page.locator(`a[href="${this.systemRuleCopyHref}"]`).click();
      await expect(this.page).toHaveURL(/action=marginSettingsCopyTemplate/);
      await expect(this.page.getByText("Copy & Customise", { exact: true })).toBeVisible();
      await expect(this.ruleNameInput).toHaveValue(`Copy of ${this.systemRuleName}`);
    });
  }
  /** Verifies the prefilled Pricing Rules match the captured System Rule and stores them for verifySavedRule() */
  async verifyCopiedPricingRules(): Promise<PricingRuleRow[]> {
    return await step(`Verify Pricing Rules are prefilled from "${this.systemRuleName}"`, async () => {
      this.pricingRules = [];
      const rowCount = await this.pricingRows.count();
      expect(rowCount).toBe(Object.keys(this.systemRulePricing).length);

      for (let i = 0; i < rowCount; i++) {
        const row = this.pricingRows.nth(i);
        const partType = (await row.getAttribute("data-part"))!;
        const accepted = (await row.locator("input.mr-accepted:checked").getAttribute("value")) === "1";
        const pricingMethod = await this.selectedOptionText(row.locator("select.mr-method"));
        // Form shows "100.00"; the rules table shows "100%"
        const value = String(Number(await row.locator("input.mr-value").inputValue()));
        const partNumberDisplay = await this.selectedOptionText(row.locator("td").last().locator("select"));
        const actual =
          pricingMethod === "Charge of List" ? `${value}% of List` : `${value}% Markup of Cost`;

        await step(`${partType}: ${pricingMethod} ${value}% (expected ${this.systemRulePricing[partType]})`, async () => {
          expect(actual, `${partType} pricing should match the System Rule`).toBe(this.systemRulePricing[partType]);
        });
        this.pricingRules.push({ partType, accepted, pricingMethod, value, partNumberDisplay });
      }
      return this.pricingRules;
    });
  }
  /** Picks a random rule from "Your Rules", clicks its Quick edit (inline) button and stores its id */
  async clickQuickEditOnRandomRule(): Promise<string> {
    return await step("Click Quick edit on a random rule", async (ctx) => {
      const quickEditButtons = this.page.locator('tr.mrDisplayRow button[data-action="quick-edit"]');
      const count = await quickEditButtons.count();
      expect(count, "Your Rules should have at least one rule").toBeGreaterThan(0);
      const quickEditButton = quickEditButtons.nth(Math.floor(Math.random() * count));
      this.ruleName = (await quickEditButton.getAttribute("data-rule"))!;
      this.inlineEditRuleId = (await quickEditButton.getAttribute("data-rule-id"))!;
      await ctx.displayName(`Click Quick edit on rule: ${this.ruleName}`);

      await quickEditButton.click();
      await step(`Verify inline edit row is shown with Rule Name: ${this.ruleName}`, async () => {
        await expect(this.inlineEditRow).toBeVisible();
        await expect(this.inlineEditRow.locator("input.mrInlineName")).toHaveValue(this.ruleName);
      });
      return this.ruleName;
    });
  }
  /** Inline edit: enters a new unique Rule Name and a random Pricing Method + Value per part type, storing them */
  async editInlineRule(maxAttempts = 3): Promise<PricingRuleRow[]> {
    return await step(`Edit rule "${this.ruleName}" inline`, async () => {
      const editRow = this.inlineEditRow;
      const previousName = this.ruleName;

      await step("Enter new Rule Name", async (ctx) => {
        this.ruleName = await this.fillUniqueRuleName(
          editRow.locator("input.mrInlineName"),
          editRow.locator("p.mrInlineError"),
          maxAttempts
        );
        await ctx.displayName(`Enter new Rule Name: ${previousName} -> ${this.ruleName}`);
      });

      this.pricingRules = [];
      for (const [partType, index] of Object.entries(this.partColumnIndex)) {
        const cell = editRow.locator("td").nth(index);
        const methodSelect = cell.locator("select.mrInlineMethod");
        const valueInput = cell.locator("input.mrInlineValue");
        // Not accepted part types render a disabled "Markup on Cost" select without the mrInlineMethod class
        const accepted = (await methodSelect.count()) > 0;
        const value = String(DataGenerators.randomPrice(1, 100));

        const pricingMethod = await step(`${partType}`, async (partCtx) => {
          let method: string;
          if (accepted) {
            method = await step("Select Pricing Method", async (ctx) => {
              await DataGenerators.selectRandomOption(methodSelect);
              const text = await this.selectedOptionText(methodSelect);
              await ctx.displayName(`Select Pricing Method: ${text}`);
              return text;
            });
          } else {
            method = await step("Pricing Method locked: Markup on Cost", async () => {
              const lockedSelect = cell.locator("select[disabled]");
              await expect(lockedSelect).toBeDisabled();
              return await this.selectedOptionText(lockedSelect);
            });
          }
          await step(`Enter Value: ${value}%`, async () => {
            await valueInput.fill(value);
          });
          await partCtx.displayName(
            `${partType}${accepted ? "" : " (Not accepted)"}: ${method} ${value}%`
          );
          return method;
        });
        this.pricingRules.push({ partType, accepted, pricingMethod, value, partNumberDisplay: "" });
      }
      return this.pricingRules;
    });
  }
  /** Clicks Save on the inline edit row and waits for the rule to show its new name */
  async clickInlineSave() {
    await step("Click Save on inline edit row", async () => {
      await step("Click Save", async () => {
        await this.inlineEditRow.locator("button.mrInlineSave").click();
      });
      await step(`Verify rule "${this.ruleName}" is shown in Your Rules`, async () => {
        await expect(this.ruleRow(this.ruleName)).toBeVisible();
      });
      await step("Verify inline edit row is closed", async () => {
        await expect(this.inlineEditRow).toBeHidden();
      });
    });
  }
  /** Reloads, then opens the rule in Full Edit and verifies Rule Name, Accepted, Pricing Method and Value */
  async verifyInlineEditInFullEdit() {
    await this.reloadMarginSettings();
    await this.verifySavedRule();
    await step(`Click Full Edit on "${this.ruleName}"`, async () => {
      await this.ruleRow(this.ruleName).locator('button[data-action="full-edit"]').click();
      await expect(this.editRuleHeading).toBeVisible();
    });
    await step("Verify Full Edit shows the inline edits", async () => {
      await step(`Verify Rule Name: ${this.ruleName}`, async () => {
        await expect(this.ruleNameInput).toHaveValue(this.ruleName);
      });

      for (const rule of this.pricingRules) {
        await step(`${rule.partType}: ${rule.pricingMethod} ${rule.value}%`, async () => {
          const row = this.page.locator(`#marginRuleForm tbody tr[data-part="${rule.partType}"]`);
          const methodSelect = row.locator("select.mr-method");

          await step(`Verify Accepted: ${rule.accepted ? "Yes" : "No"}`, async () => {
            await expect(row.locator(`input.mr-accepted[value="${rule.accepted ? "1" : "0"}"]`)).toBeChecked();
          });
          await step(`Verify Pricing Method: ${rule.pricingMethod}`, async () => {
            expect(await this.selectedOptionText(methodSelect)).toBe(rule.pricingMethod);
          });
          await step(`Verify Value: ${rule.value}%`, async () => {
            // Full Edit shows "20.00"; inline edit entered "20"
            expect(Number(await row.locator("input.mr-value").inputValue())).toBe(Number(rule.value));
          });
        });
      }
    });
  }
  private get inlineEditRow(): Locator {
    return this.page.locator(`tr.mrEditRow[data-rule-id="${this.inlineEditRuleId}"]`);
  }
  private favouriteButton(ruleName: string): Locator {
    return this.ruleRow(ruleName).locator('button[data-action="favourite"]');
  }
  private ruleRow(ruleName: string): Locator {
    return this.page
      .locator("tr.mrDisplayRow")
      .filter({ has: this.page.locator(`[data-rule="${ruleName}"]`) });
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
