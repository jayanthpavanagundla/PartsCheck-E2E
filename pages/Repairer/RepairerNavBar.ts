import { Locator, Page } from "@playwright/test";
import { step } from "allure-js-commons";

export class RepairerNavBar {
  readonly page: Page;

  dashboard: Locator;
  getprice: Locator;
  checkprice: Locator;
  orders: Locator;
  credits: Locator;
  reports: Locator;
  settings: Locator;
  search: Locator;
  logout: Locator;

  constructor(page: Page) {
    this.page = page;

    this.dashboard = page.getByText("DASHBOARD", { exact: true });
    this.getprice = page.getByText("GET PRICE", { exact: true });
    this.checkprice = page.getByText("CHECK PRICE", { exact: true });
    this.orders = page.getByText("ORDERS", { exact: true });
    this.credits = page.getByText("CREDITS", { exact: true });
    this.reports = page.getByText("REPORTS", { exact: true });
    this.settings = page.getByText("SETTINGS", { exact: true });
    this.search = page.locator("input#searchAllInput");
    this.logout = page.getByRole("link", { name: "LOGOUT" });
  }
  //=============================COMMON METHODS=============================//
  async clickDashboard() {
    await step("Click on Dashboard", async () => {
      await this.dashboard.click();
    });
  }
  async clickGetPrice() {
    await step("Click on Get Price", async () => {
      await this.getprice.click();
    });
  }
  async clickCheckPrice() {
    await step("Click on Check Price", async () => {
      await this.checkprice.click();
    });
  }
  async clickOrders() {
    await step("Click on Orders", async () => {
      await this.orders.click();
    });
  }
  async clickCredits() {
    await step("Click on Credits", async () => {
      await this.credits.click();
    });
  }
  async clickReports() {
    await step("Click on Reports", async () => {
      await this.reports.click();
    });
  }
  async clickSettings() {
    await step("Click on Settings", async () => {
      await this.settings.click();
    });
  }
  async searchForResult(searchTerm: string) {
    await step(`Search for ${searchTerm}`, async () => {
      await this.search.fill(searchTerm);
      await this.search.press("Enter");
    });
  }
  async clickLogout() {
    await step("Click on Logout", async () => {
      await this.logout.click();
    });
  }
  //=========================================================================//
}
