import { test } from "@playwright/test";
import { RepairerSettings } from "../../../pages/Repairer/RepairerSettings.js";
import { RepairerNavBar } from "../../../pages/Repairer/RepairerNavBar.js";
import { epic, step } from "allure-js-commons";

test.describe("Repairer: Margin Rules Settings", () => {
  let repairerSettings: RepairerSettings;
  let repairerNavBar: RepairerNavBar;

  test.beforeEach(async ({ page }) => {
    epic("Repairer: Margin Rules Settings");

    repairerSettings = new RepairerSettings(page);
    repairerNavBar = new RepairerNavBar(page);

    await page.goto(process.env.REPAIRER_LANDING_URL!);
  });

  test("Create margin rule", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.clickAddRule();
    await repairerSettings.marginSettingsTab.enterRuleName();
    // oneNo == One Part Type No; allYes == All Part Types Yes
    await repairerSettings.marginSettingsTab.fillPricingRules("allYes"); 
    await repairerSettings.marginSettingsTab.clickSaveChanges();
    await repairerSettings.marginSettingsTab.verifySavedRule();
    await repairerSettings.marginSettingsTab.deleteSavedRule();
  });

  test("Edit margin rule", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.clickFullEditOnRandomRule();
    await repairerSettings.marginSettingsTab.fillPricingRules("allYes");
    await repairerSettings.marginSettingsTab.clickSaveChanges();
    await repairerSettings.marginSettingsTab.verifySavedRule();
  });

  test("Set margin rule as default", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.setRandomRuleAsDefault();
    await repairerSettings.marginSettingsTab.verifyDefaultRule();
  });

  test("Pin and unpin margin rules", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.ensurePinnedRule();
    await repairerSettings.marginSettingsTab.pinAnotherRule();
    await repairerSettings.marginSettingsTab.unpinSecondRule();
  });

  test("Copy & customise system rule", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.selectRandomSystemRule();
    await repairerSettings.marginSettingsTab.clickCopyAndCustomise();
    await repairerSettings.marginSettingsTab.enterRuleName();
    await repairerSettings.marginSettingsTab.verifyCopiedPricingRules();
    await repairerSettings.marginSettingsTab.clickSaveChanges();
    await repairerSettings.marginSettingsTab.verifySavedRule();
    await repairerSettings.marginSettingsTab.deleteSavedRule();
  });

  test("Inline edit margin rule", async () => {
    await repairerNavBar.clickSettings();
    await repairerSettings.marginSettingsTab.clickMarginSettings();
    await repairerSettings.marginSettingsTab.clickQuickEditOnRandomRule();
    await repairerSettings.marginSettingsTab.editInlineRule();
    await repairerSettings.marginSettingsTab.clickInlineSave();
    await repairerSettings.marginSettingsTab.verifyInlineEditInFullEdit();
  });
})