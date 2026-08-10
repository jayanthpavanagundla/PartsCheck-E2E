import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// --- Environment selection ---------------------------------------------------
// ENV picks which .env.<env> file to load. Defaults to `dev`.
const env = process.env.ENV ?? 'dev';
dotenv.config({ path: `.env.${env}` });

// --- Fail fast on missing config --------------------------------------------
const required = [
  'BASE_URL',
  'REPAIRER_USERNAME',
  'REPAIRER_PASSWORD',
  'REPAIRER_ADMIN_PASSWORD',
  'SUPPLIER_USERNAME',
  'SUPPLIER_PASSWORD',
  'SUPPLIER_ADMIN_PASSWORD',
  'REPAIRER_LANDING_URL',
  'SUPPLIER_LANDING_URL',
  'REPAIRER_FINGERPRINT_USER',
  'SUPPLIER_FINGERPRINT_USER',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(
    `Missing env vars in .env.${env}: ${missing.join(', ')}. ` +
      `Copy .env.${env}.example to .env.${env} and fill in the values.`,
  );
}

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Spec routing is by filename suffix:
 *   *.repairerAdmin.spec.ts -> partscheck-repairer-admin (.auth/repairerAdmin.json)
 *   *.supplier.spec.ts      -> partscheck-supplier       (.auth/supplier.json)
 *   *.supplierAdmin.spec.ts -> partscheck-supplier-admin (.auth/supplierAdmin.json)
 *   any other *.spec.ts     -> partscheck-repairer       (.auth/repairer.json)   [catch-all]
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  timeout: 60000,
  expect: {
    timeout: 30000,
  },

  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on',
    video: 'on',
    screenshot: 'only-on-failure',
    headless: false,
  },

  projects: [
    // --- Auth setups: each logs in once and writes its own .auth/*.json ------
    {
      name: 'repairer-setup',
      testDir: './auth-setup',
      testMatch: /auth\.repairer\.setup\.ts/,
    },
    {
      name: 'repairerAdmin-setup',
      testDir: './auth-setup',
      testMatch: /auth\.repairerAdmin\.setup\.ts/,
    },
    {
      name: 'supplier-setup',
      testDir: './auth-setup',
      testMatch: /auth\.supplier\.setup\.ts/,
    },
    {
      name: 'supplierAdmin-setup',
      testDir: './auth-setup',
      testMatch: /auth\.supplierAdmin\.setup\.ts/,
    },

    // --- Role projects: routed by filename suffix ----------------------------
    {
      name: 'partscheck-repairer-admin',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/repairerAdmin.json' },
      testMatch: /.*\.repairerAdmin\.spec\.ts/,
      dependencies: ['repairerAdmin-setup'],
    },
    {
      name: 'partscheck-supplier',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/supplier.json' },
      testMatch: /.*\.supplier\.spec\.ts/,
      dependencies: ['supplier-setup', 'partscheck-repairer'],
    },
    {
      name: 'partscheck-supplier-admin',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/supplierAdmin.json' },
      testMatch: /.*\.supplierAdmin\.spec\.ts/,
      dependencies: ['supplierAdmin-setup'],
    },
    {
      name: 'partscheck-repairer',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/repairer.json' },
      testMatch: /.*\.spec\.ts/,
      testIgnore: /.*\.(repairerAdmin|supplier|supplierAdmin)\.spec\.ts|.*checkPrice\.spec\.ts|.*partsOrder\.spec\.ts/,
      dependencies: ['repairer-setup'],
    },
    {
      name: 'partscheck-repairer-checkprice',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/repairer.json' },
      testMatch: /.*checkPrice\.spec\.ts/,
      dependencies: ['repairer-setup', 'partscheck-supplier'],
    },
    {
      name: 'partscheck-repairer-partsorder',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/repairer.json' },
      testMatch: /.*partsOrder\.spec\.ts/,
      // dependencies: ['repairer-setup', 'partscheck-repairer-checkprice'],
      dependencies: ['repairer-setup'],
    },
  ],
});
