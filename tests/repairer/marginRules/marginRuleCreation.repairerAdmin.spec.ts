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
    await repairerSettings.marginSettingsTab.fillPricingRules();
    await repairerSettings.marginSettingsTab.clickSaveChanges();
    await repairerSettings.marginSettingsTab.verifySavedRule();
  });
})