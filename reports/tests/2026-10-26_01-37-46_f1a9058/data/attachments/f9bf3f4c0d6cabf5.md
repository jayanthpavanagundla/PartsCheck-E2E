# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: repairer/marginRules/marginRuleCreation.repairerAdmin.spec.ts >> Repairer: Margin Rules Settings >> Favourite star pins the rule to the top of the Margin Rules list
- Location: tests/repairer/marginRules/marginRuleCreation.repairerAdmin.spec.ts:48:9

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  locator('tr.mrDisplayRow').filter({ has: locator('[data-rule="Auto Rule 7APMN5"]') }).locator('button[data-action="favourite"]')
Expected: "1"
Received: "0"
Timeout:  30000ms

Call log:
  - Expect "toHaveAttribute" with timeout 30000ms
  - waiting for locator('tr.mrDisplayRow').filter({ has: locator('[data-rule="Auto Rule 7APMN5"]') }).locator('button[data-action="favourite"]')
    63 × locator resolved to <button type="button" title="Pin to top" data-favourite="0" data-rule-id="5760" data-action="favourite" data-rule="Auto Rule 7APMN5" class="tw:inline-flex tw:items-center tw:justify-center tw:w-7 tw:h-7 tw:rounded tw:border tw:border-gray-300 tw:bg-white tw:text-gray-500 tw:cursor-pointer tw:hover:bg-gray-50">…</button>
       - unexpected value "0"

```

```yaml
- button "Pin to top":
  - img
```

# Test source

```ts
  359 |                 await this.clickRowButton(setDefaultButton);
  360 |             });
  361 |             await step("Verify Set as default button is marked current default", async () => {
  362 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  363 |             });
  364 |             this.defaultRuleName = this.ruleName;
  365 |             return this.defaultRuleName;
  366 |         });
  367 |     }
  368 |     /** After the default rule is deleted, verifies the default falls back to the given System Rule */
  369 |     async verifyDefaultFallsBackToSystemRule(systemRuleName = "Standard") {
  370 |         await step(`Verify default falls back to System Rule "${systemRuleName}"`, async () => {
  371 |             const setDefaultButton = this.page.locator(
  372 |                 `button[data-action="set-default"][data-rule="${systemRuleName}"]`
  373 |             );
  374 |             const systemRuleRow = setDefaultButton.locator("xpath=ancestor::tr[1]");
  375 |             await step(`Verify "${systemRuleName}" is listed in System Rules`, async () => {
  376 |                 await expect(systemRuleRow.locator("td").first().getByText("SYSTEM", { exact: true })).toBeVisible();
  377 |             });
  378 |             await step(`Verify DEFAULT pill is shown on "${systemRuleName}"`, async () => {
  379 |                 await expect(systemRuleRow.locator("td").first().getByText("DEFAULT", { exact: true })).toBeVisible();
  380 |             });
  381 |             await step(`Verify Set as default button on "${systemRuleName}" is marked current default`, async () => {
  382 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  383 |                 await expect(setDefaultButton).toBeDisabled();
  384 |             });
  385 |             await step("Verify no other rule (System or Your Rules) is default", async () => {
  386 |                 await expect(this.page.locator('button[data-action="set-default"][data-default="1"]')).toHaveCount(1);
  387 |             });
  388 |         });
  389 |     }
  390 |     /** Reloads after a short wait and verifies the rule set by setRandomRuleAsDefault() is the only one with the DEFAULT pill */
  391 |     async verifyDefaultRule() {
  392 |         await step(`Verify rule "${this.defaultRuleName}" is the default rule`, async () => {
  393 |             await step("Wait and reload Margin Settings", async () => {
  394 |                 await this.page.waitForTimeout(2500);
  395 |                 await this.page.reload();
  396 |                 await expect(this.addRuleButton).toBeVisible();
  397 |             });
  398 |             const ruleRow = this.ruleRow(this.defaultRuleName);
  399 |             await step("Verify DEFAULT pill is shown on the rule", async () => {
  400 |                 await expect(ruleRow.locator("td").first().getByText("DEFAULT", { exact: true })).toBeVisible();
  401 |             });
  402 |             await step("Verify Set as default button is marked current default", async () => {
  403 |                 const setDefaultButton = ruleRow.locator('button[data-action="set-default"]');
  404 |                 await expect(setDefaultButton).toHaveAttribute("data-default", "1");
  405 |                 await expect(setDefaultButton).toBeDisabled();
  406 |             });
  407 |             await step(`Verify previous default "${this.previousDefaultRuleName}" is no longer default`, async () => {
  408 |                 await expect(
  409 |                     this.page.locator(
  410 |                         `button[data-action="set-default"][data-rule="${this.previousDefaultRuleName}"][data-default="1"]`
  411 |                     )
  412 |                 ).toHaveCount(0);
  413 |             });
  414 |             await step("Verify no other rule (System or Your Rules) is default", async () => {
  415 |                 await expect(this.page.locator('button[data-action="set-default"][data-default="1"]')).toHaveCount(1);
  416 |             });
  417 |         });
  418 |     }
  419 |     /** Stores Your Rules in their current (default) display order, to compare against after unfavouriting */
  420 |     async captureDefaultSortOrder(): Promise<string[]> {
  421 |         return await step("Capture default sort order of Your Rules", async (ctx) => {
  422 |             const rules = await this.getYourRulesOrder();
  423 |             expect(rules.length, "Your Rules should have at least one rule").toBeGreaterThan(0);
  424 |             this.defaultSortOrder = rules.map((r) => r.name);
  425 |             await ctx.displayName(`Default sort order: ${this.defaultSortOrder.join(" | ")}`);
  426 |             return this.defaultSortOrder;
  427 |         });
  428 |     }
  429 |     /** Clicks the Favourite star on a random unfavourited rule, reloads and verifies it is pinned to the top */
  430 |     async favouriteRandomRule(): Promise<string> {
  431 |         return await step("Favourite a random rule", async (ctx) => {
  432 |             const unfavourited = (await this.getYourRulesOrder()).filter((r) => !r.pinned);
  433 |             expect(unfavourited.length, "Your Rules should have at least one unfavourited rule").toBeGreaterThan(0);
  434 |             this.favouriteRuleName = unfavourited[Math.floor(Math.random() * unfavourited.length)].name;
  435 |             await ctx.displayName(`Favourite rule: ${this.favouriteRuleName}`);
  436 | 
  437 |             await this.toggleFavourite(this.favouriteRuleName, true);
  438 |             await this.reloadMarginSettings();
  439 |             await this.verifyFavouriteState(this.favouriteRuleName, true);
  440 |             await this.verifyPinnedToTop(this.favouriteRuleName);
  441 |             return this.favouriteRuleName;
  442 |         });
  443 |     }
  444 |     /** Clicks the Favourite star again on the rule from favouriteRandomRule(), reloads and verifies default sort order is restored */
  445 |     async unfavouriteRule() {
  446 |         await step(`Unfavourite rule "${this.favouriteRuleName}"`, async () => {
  447 |             await this.toggleFavourite(this.favouriteRuleName, false);
  448 |             await this.reloadMarginSettings();
  449 |             await this.verifyFavouriteState(this.favouriteRuleName, false);
  450 |             await this.verifyDefaultSortOrder();
  451 |         });
  452 |     }
  453 |     /** Clicks the Favourite star and waits for data-favourite to flip */
  454 |     private async toggleFavourite(ruleName: string, favourite: boolean) {
  455 |         await step(`Click Favourite star to ${favourite ? "select" : "deselect"} on "${ruleName}"`, async () => {
  456 |             const button = this.favouriteButton(ruleName);
  457 |             await expect(button).toHaveAttribute("data-favourite", favourite ? "0" : "1");
  458 |             await this.clickRowButton(button);
> 459 |             await expect(this.favouriteButton(ruleName)).toHaveAttribute("data-favourite", favourite ? "1" : "0");
      |                                                          ^ Error: expect(locator).toHaveAttribute(expected) failed
  460 |         });
  461 |     }
  462 |     private async reloadMarginSettings() {
  463 |         await step("Wait and reload Margin Settings", async () => {
  464 |             await this.page.waitForTimeout(2500);
  465 |             await this.page.reload();
  466 |             await expect(this.addRuleButton).toBeVisible();
  467 |         });
  468 |     }
  469 |     /** Verifies the Favourite star state and the "Pinned to top" icon on the rule */
  470 |     private async verifyFavouriteState(ruleName: string, favourite: boolean) {
  471 |         await step(`Verify Favourite star on "${ruleName}" is ${favourite ? "selected" : "deselected"}`, async () => {
  472 |             const pinIcon = this.ruleRow(ruleName).locator("td").first().locator('span[title="Pinned to top"]');
  473 |             await expect(this.favouriteButton(ruleName)).toHaveAttribute("data-favourite", favourite ? "1" : "0");
  474 |             if (favourite) {
  475 |                 await expect(pinIcon).toBeVisible();
  476 |             } else {
  477 |                 await expect(pinIcon).toHaveCount(0);
  478 |             }
  479 |         });
  480 |     }
  481 |     /** Verifies the favourited rule sits in the pinned block at the top and the rest keep their default order */
  482 |     private async verifyPinnedToTop(ruleName: string) {
  483 |         await step(`Verify "${ruleName}" is pinned to the top of Your Rules`, async () => {
  484 |             const rules = await this.getYourRulesOrder();
  485 |             const pinnedCount = rules.filter((r) => r.pinned).length;
  486 |             const index = rules.findIndex((r) => r.name === ruleName);
  487 |             await step(`Row position: ${index + 1} of ${rules.length} (${pinnedCount} favourited)`, async () => {
  488 |                 expect(
  489 |                     rules.slice(0, pinnedCount).every((r) => r.pinned),
  490 |                     "All favourited rules should be at the top of Your Rules"
  491 |                 ).toBe(true);
  492 |                 expect(index, `"${ruleName}" should be in the favourited rows at the top`).toBeLessThan(pinnedCount);
  493 |                 if (pinnedCount === 1) {
  494 |                     expect(index, `"${ruleName}" is the only favourite so should be the first row`).toBe(0);
  495 |                 }
  496 |             });
  497 |             await step("Verify unfavourited rules keep the default sort order", async () => {
  498 |                 const pinnedNames = new Set(rules.filter((r) => r.pinned).map((r) => r.name));
  499 |                 expect(rules.filter((r) => !r.pinned).map((r) => r.name))
  500 |                     .toEqual(this.defaultSortOrder.filter((name) => !pinnedNames.has(name)));
  501 |             });
  502 |         });
  503 |     }
  504 |     /** Verifies Your Rules are back in the order captured by captureDefaultSortOrder() */
  505 |     private async verifyDefaultSortOrder() {
  506 |         await step("Verify Your Rules are back in the default sort order", async () => {
  507 |             const current = (await this.getYourRulesOrder()).map((r) => r.name);
  508 |             const expectedIndex = this.defaultSortOrder.indexOf(this.favouriteRuleName);
  509 |             await step(`"${this.favouriteRuleName}" is back at row ${expectedIndex + 1} of ${current.length}`, async () => {
  510 |                 expect(current.indexOf(this.favouriteRuleName)).toBe(expectedIndex);
  511 |             });
  512 |             await step("Full list matches the default sort order", async () => {
  513 |                 expect(current).toEqual(this.defaultSortOrder);
  514 |             });
  515 |         });
  516 |     }
  517 |     /** Your Rules in display order with each rule's pinned state */
  518 |     private async getYourRulesOrder(): Promise<{ name: string; pinned: boolean }[]> {
  519 |         return await this.page.locator('tr.mrDisplayRow button[data-action="favourite"]').evaluateAll((buttons) =>
  520 |             buttons.map((b) => ({
  521 |                 name: b.getAttribute("data-rule") ?? "",
  522 |                 pinned: b.getAttribute("data-favourite") === "1",
  523 |             }))
  524 |         );
  525 |     }
  526 |     /** Picks a random System Rule and captures its pricing (e.g. "100% of List") per part type */
  527 |     async selectRandomSystemRule(): Promise<string> {
  528 |         return await step("Select a random System Rule", async (ctx) => {
  529 |             const copyLinks = this.page.locator('a[href*="action=marginSettingsCopyTemplate"]');
  530 |             const count = await copyLinks.count();
  531 |             expect(count, "System Rules should have at least one rule").toBeGreaterThan(0);
  532 |             const copyLink = copyLinks.nth(Math.floor(Math.random() * count));
  533 |             this.systemRuleCopyHref = (await copyLink.getAttribute("href"))!;
  534 | 
  535 |             const row = copyLink.locator("xpath=ancestor::tr[1]");
  536 |             this.systemRuleName = (await row.locator("td").first().locator("div").first().textContent())!.trim();
  537 |             await ctx.displayName(`Select System Rule: ${this.systemRuleName}`);
  538 | 
  539 |             this.systemRulePricing = {};
  540 |             for (const [partType, index] of Object.entries(await this.partColumnIndex(row))) {
  541 |                 const text =(await row.locator("td").nth(index).textContent())!.trim();
  542 |                 this.systemRulePricing[partType] = text;
  543 |                 await step(`Captured ${partType}: ${text}`, async () => { });
  544 |             }
  545 |             return this.systemRuleName;
  546 |         });
  547 |     }
  548 |     async clickCopyAndCustomise() {
  549 |         await step(`Click Copy & customise on "${this.systemRuleName}"`, async () => {
  550 |             await this.page.locator(`a[href="${this.systemRuleCopyHref}"]`).click();
  551 |             await expect(this.page).toHaveURL(/action=marginSettingsCopyTemplate/);
  552 |             await expect(this.page.getByText("Copy & Customise", { exact: true })).toBeVisible();
  553 |             await expect(this.ruleNameInput).toHaveValue(`Copy of ${this.systemRuleName}`);
  554 |         });
  555 |     }
  556 |     /** Verifies the prefilled Pricing Rules match the captured System Rule and stores them for verifySavedRule() */
  557 |     async verifyCopiedPricingRules(): Promise<PricingRuleRow[]> {
  558 |         return await step(`Verify Pricing Rules are prefilled from "${this.systemRuleName}"`, async () => {
  559 |             this.pricingRules = [];
```