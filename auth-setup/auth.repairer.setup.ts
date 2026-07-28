import { test as setup } from "@playwright/test";
import path from "path";
import { LoginPage } from "../pages/Auth/LoginPage.js";

const authFile = path.join(__dirname, "../.auth/repairer.json");

setup("Normal Repairer sign in", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.signIn(
    process.env.BASE_URL!,
    process.env.REPAIRER_USERNAME!,
    process.env.REPAIRER_PASSWORD!,
    process.env.REPAIRER_LANDING_URL!,
    process.env.REPAIRER_FINGERPRINT_USER!,
  );

  await page.context().storageState({ path: authFile });
});
