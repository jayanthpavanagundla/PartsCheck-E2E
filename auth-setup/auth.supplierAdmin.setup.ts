import { test as setup } from "@playwright/test";
import path from "path";
import { epic, feature } from "allure-js-commons";
import { LoginPage } from "../pages/Auth/LoginPage.js";

const authFile = path.join(__dirname, "../.auth/supplierAdmin.json");

setup("Supplier sign in", async ({ page }) => {
  await epic("Auth-Setup");
  await feature("Admin");

  const loginPage = new LoginPage(page);

  await loginPage.signIn(
    process.env.BASE_URL!,
    process.env.SUPPLIER_USERNAME!,
    process.env.SUPPLIER_ADMIN_PASSWORD!,
    process.env.SUPPLIER_LANDING_URL!,
    process.env.SUPPLIER_FINGERPRINT_USER!,
  );

  await page.context().storageState({ path: authFile });
});
