import { FrameLocator, Locator, Page, expect } from "@playwright/test";
import { step } from "allure-js-commons";

export class LoginPage {
  readonly page: Page;

  loginRegisterLink: Locator;
  accountInput: Locator;
  passwordInput: Locator;
  loginButton: Locator;
  errorMessage: Locator;
  fingerprintFrame: FrameLocator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.loginRegisterLink = page.getByText("LOGIN / REGISTER");

    // Form inputs
    this.accountInput = page.getByRole("textbox", { name: "Account" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });

    // Buttons
    this.loginButton = page.locator("#loginButton");

    // Error message
    this.errorMessage = page.locator(
      '[class*="message"][style*="visibility: visible"]',
    );

    // Fingerprint / device confirmation popup
    this.fingerprintFrame = page.frameLocator("iframe.cboxIframe");
  }

  async openLoginRegister() {
    await this.loginRegisterLink.click();
  }

  /**
   * Full sign-in flow shared by every auth-setup file. The username is the
   * same for normal and admin; the password decides which role you land as.
   */
  async signIn(
    baseUrl: string,
    username: string,
    password: string,
    landingUrl: string | RegExp,
    fingerprintUser: string,
  ) {
    await step(`Sign in as ${username}`, async () => {
      await this.page.goto(baseUrl);
      await this.openLoginRegister();
      await this.login(username, password);
      await this.expectLoggedInUrl(landingUrl);
      await this.selectFingerprintTestUser(fingerprintUser);
    });
  }

  async login(account: string, password: string) {
    await this.accountInput.fill(account);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoggedInUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  async selectFingerprintTestUser(name: string) {
    await this.fingerprintFrame.getByText(name, { exact: true }).click();
  }

  async expectLoginErrorVisible() {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(
      "Username or password Incorrect",
    );
  }

  async signOut() {
    const logoutLink = this.page.locator("a[href*='action=logout']");
    await expect(logoutLink).toBeVisible();
    await logoutLink.click();
  }
}
