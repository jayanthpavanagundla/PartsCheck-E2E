import { test as setup } from "@playwright/test";
import path from "path";
import { LoginPage } from "../pages/Auth/LoginPage.js";

const authFile = path.join(__dirname, "../.auth/supplier.json");

setup("Normal Supplier sign in", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.signIn(
    process.env.BASE_URL!,
    process.env.SUPPLIER_USERNAME!,
    process.env.SUPPLIER_PASSWORD!,
    process.env.SUPPLIER_LANDING_URL!,
    process.env.SUPPLIER_FINGERPRINT_USER!,
  );

  await page.context().storageState({ path: authFile });
});
