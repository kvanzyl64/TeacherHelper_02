# Quickstart: SaaS Admin

This guide validates the platform-owner admin flow for portfolio health, billing risk, and operational escalation without exposing child or tenant data beyond the authorised scope.

## Prerequisites

- Node.js supported by the repository
- pnpm 10.x
- Repository dependencies installed with `pnpm install`
- Local app configuration available for the existing Teacher Helper web app
- Platform owner or read-only admin user fixtures available for testing

## Start the app

From the repository root:

```powershell
pnpm dev
```

Open the app in a browser and sign in as a platform owner or a read-only support user where the feature is configured.

## Platform admin validation scenarios

### 1. Admin dashboard overview

1. Open `/admin` or the platform admin landing route.
2. Confirm the dashboard shows totals for active centres, trials, overdue centres, open alerts, and high-risk accounts.
3. Confirm the dashboard is business-safe and does not display child or guardian-level detail.
4. Confirm the page contains obvious links to the billing overview and alert list.

Expected result: the SaaS owner sees a clear portfolio summary and can identify immediate action items.

### 2. Billing and subscription health

1. Open the billing overview for the admin workspace.
2. Review centre payment status, overdue items, and plan adoption summaries.
3. Confirm the status is grouped by centre and uses business-safe summaries rather than raw family or student details.
4. Confirm payment risk and overdue states are clearly distinguished from healthy subscriptions.

Expected result: the SaaS owner can identify revenue risk and who needs follow-up without seeing protected data.

### 3. Operational alerts and support escalation

1. Open the admin alerts area for current platform issues.
2. Confirm failed exports, backup issues, retention risks, and payment issues are clearly labelled with severity and centre context.
3. Open a centre-level alert or support case and verify the summary is limited to the relevant business context.
4. Confirm a read-only support user can view these summaries but cannot edit billing or tenant data.

Expected result: operational action paths are clear, safe, and auditable.

### 4. Security and tenant isolation

1. Attempt to open a centre record or billing detail that is outside the current role scope.
2. Confirm the system denies access and records the attempt in the audit trail.
3. Verify platform dashboards and alert summaries remain centre-safe and do not expose unrelated child or family records.

Expected result: tenant boundaries remain intact and read-only support users cannot exceed their permissions.

## Run project checks

Use the repository’s standard validation flow:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected result: domain, tenant, billing, and support workflows remain stable and no platform-level admin route breaks the existing multi-tenant model.

## Verification evidence recorded

The implementation has been validated with the currently passing project checks:

- `pnpm vitest run tests/contract/platform-admin.contract.test.ts` → 1 file passed, 5 tests passed
- `pnpm vitest run tests/contract tests/integration packages/domain/src` → 23 files passed, 47 tests passed
- `pnpm lint && pnpm typecheck && pnpm build` → completed successfully, with only an existing CSS autoprefixer warning that did not fail the build

## Evidence to record

- Platform owner dashboard totals and alert breakdown
- Billing and subscription risk summary for overdue or at-risk centres
- Read-only access behaviour for support users
- Tenant isolation proof for denied or out-of-scope centre access
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, and `pnpm build` outcomes
- Final constitution review: least privilege, tenant isolation, privacy, and audit evidence are preserved in the admin routes and domain guard model
