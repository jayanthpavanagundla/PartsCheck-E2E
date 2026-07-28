# partscheck-e2e

![Playwright](https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)

Playwright end-to-end tests for **PartsCheck**, runnable against `dev`, `staging`, or
`prod`, with a pre-authenticated session per role.

**Roles** — in PartsCheck the username is the same for normal and admin; the **password**
decides which role you land as.

| Role | App | Signs in with |
|---|---|---|
| Normal Repairer | v2 | repairer username + normal password |
| Admin Repairer  | v2 | repairer username + admin password |
| Normal Supplier | v1 | supplier username + normal password |
| Admin Supplier  | v1 | supplier username + admin password |

## Setup

```bash
npm install               # dependencies
npx playwright install    # browsers (first time only)
cp .env.dev.example .env.dev   # then fill in real values
```

`.env.<env>` files hold real credentials and are **gitignored**. The
`.env.<env>.example` templates are committed placeholders — **never commit credentials.**

The config **fails fast** at load if any required variable is missing, naming which ones.
See `.env.dev.example` for the full list.

## Running tests

| Command | Environment |
|---|---|
| `npm test` / `npm run test:dev` | dev (default) |
| `npm run test:staging` | staging (needs `.env.staging`) |
| `npm run test:prod` | prod (needs `.env.prod` — use sparingly) |
| `npm run report` | open the last HTML report |

Forward flags to Playwright with `--`:

```bash
npm run test:dev -- --headed                 # watch the browser
npm run test:dev -- tests/example.spec.ts    # a single file
```

## Test sessions & routing

Each role maps to a **project** (`--project=…`) and to a spec **filename suffix**. A spec
runs under a role when its filename matches that suffix; the role's saved login session is
loaded automatically.

| Role | `--project` | Spec files it runs | Session file |
|---|---|---|---|
| Normal Repairer | `partscheck-repairer` | `*.spec.ts` *(any file without an admin/supplier suffix)* | `.auth/repairer.json` |
| Admin Repairer | `partscheck-repairer-admin` | `*.repairerAdmin.spec.ts` | `.auth/repairerAdmin.json` |
| Normal Supplier | `partscheck-supplier` | `*.supplier.spec.ts` | `.auth/supplier.json` |
| Admin Supplier | `partscheck-supplier-admin` | `*.supplierAdmin.spec.ts` | `.auth/supplierAdmin.json` |

**Rule of thumb:** pick the **environment** with the script (`test:dev` / `test:staging` /
`test:prod`) and pick the **role** with `--project`. Omit `--project` to run every role.

### Run everything (all four roles)

```bash
npm run test:dev      # all roles on dev
npm run test:prod     # all roles on prod
```

### Run one role — dev

```bash
npm run test:dev -- --project=partscheck-repairer         # Normal Repairer specs
npm run test:dev -- --project=partscheck-repairer-admin   # Admin Repairer specs
npm run test:dev -- --project=partscheck-supplier         # Normal Supplier specs
npm run test:dev -- --project=partscheck-supplier-admin   # Admin Supplier specs
```

### Run one role — prod

```bash
npm run test:prod -- --project=partscheck-repairer        # Normal Repairer specs
npm run test:prod -- --project=partscheck-repairer-admin  # Admin Repairer specs
npm run test:prod -- --project=partscheck-supplier        # Normal Supplier specs
npm run test:prod -- --project=partscheck-supplier-admin  # Admin Supplier specs
```

> Staging is identical — swap `test:dev` for `test:staging`.

Every command above first runs that role's **login setup** (which saves the `.auth/*.json`
session), then runs the role's specs against the chosen environment.

### Refresh a login session only (no specs)

```bash
npm run test:dev -- --project=repairer-setup         # or repairerAdmin-setup /
                                                      #    supplier-setup / supplierAdmin-setup
```

Per-spec override (rare): `test.use({ storageState: '.auth/supplierAdmin.json' });`

## How it works

- **Env** — `playwright.config.ts` loads `.env.${ENV}` (default `dev`) and validates it.
- **Auth setups** — four flows in `auth-setup/` sign in once and save a session:
  `auth.repairer` → `.auth/repairer.json`, `auth.repairerAdmin` → `.auth/repairerAdmin.json`,
  `auth.supplier` → `.auth/supplier.json`, `auth.supplierAdmin` → `.auth/supplierAdmin.json`.
- **Login flow** — `pages/Auth/LoginPage.ts` `signIn(...)`: go to `BASE_URL` →
  LOGIN/REGISTER → Account + Password → assert landing URL → confirm device (fingerprint user).
- **Routing** — a spec's suffix selects its role project, which loads the matching
  `.auth/*.json` and depends on that role's setup, so the login runs first.

## Project structure

```
.
├── .env.<env> / .env.<env>.example   # real config (gitignored) + committed templates
├── playwright.config.ts              # env load + validation + projects/routing
├── auth-setup/                       # login flows that hydrate .auth/*.json
├── pages/                            # Page Object Models (Auth, Repairer, Supplier)
├── tests/                            # filename suffix routes each spec to a session
└── .auth/                            # stored sessions (gitignored, auto-generated)
```

## Adding a new environment

1. `cp .env.dev.example .env.<name>` and fill it in.
2. Add to `package.json`: `"test:<name>": "cross-env ENV=<name> playwright test"`.
3. Run `npm run test:<name>`.

## Troubleshooting

- **`Missing env vars in .env.<env>: …`** — copy the matching `.example`, fill every key, re-run.
- **Password truncated / logs in wrong** — an unquoted `#` in a `.env` value starts a
  comment. Wrap values containing `#` or `"` in quotes, e.g. `KEY="va#lue"`.
- **`Executable doesn't exist`** — run `npx playwright install`.
- **Stale session after login** — refresh it: `npm run test:dev -- --project=<role>-setup`.
