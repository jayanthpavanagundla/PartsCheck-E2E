import { expect, Locator, Page } from '@playwright/test';

export class BasePage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Navigation
    goto(url: string) { return this.page.goto(url); }
    waitForURL(pattern: string | RegExp) { return this.page.waitForURL(pattern); }
    clickText(text: string | RegExp, exact = true) { return this.page.getByText(text, { exact }).click(); }

    // Waiting
    waitForVisible(locator: Locator, timeout = 30000) { return locator.waitFor({ state: 'visible', timeout }); }
    waitForSelector(selector: string, timeout = 30000) { return this.page.waitForSelector(selector, { timeout }); }
    waitForTimeout(ms: number) { return this.page.waitForTimeout(ms); }

    // Assertion helpers
    expectVisible(locator: Locator) { return expect(locator).toBeVisible(); }
    expectHidden(locator: Locator) { return expect(locator).toBeHidden(); }
    expectText(locator: Locator, text: string | RegExp) { return expect(locator).toHaveText(text); }
    expectContainsText(locator: Locator, text: string | RegExp) { return expect(locator).toContainText(text); }

    // Utility getters
    async getText(locator: Locator) { return (await locator.textContent())!.trim(); }
    async getInnerText(locator: Locator) { return (await locator.innerText()).trim(); }
    async isVisible(locator: Locator, timeout = 3000) { return locator.isVisible({ timeout }).catch(() => false); }

    getURL() { return this.page.url(); }
    getCurrentURL() { return this.page.url(); }
}
