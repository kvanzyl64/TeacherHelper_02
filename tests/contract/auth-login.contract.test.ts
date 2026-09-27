import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const loginPage = readFileSync(join(process.cwd(), "apps/web/app/auth/login/page.tsx"), "utf8");
const loginActions = readFileSync(
  join(process.cwd(), "apps/web/app/auth/login/actions.ts"),
  "utf8",
);

describe("email/password login contract", () => {
  it("renders accessible email and password fields with a recovery link", () => {
    expect(loginPage).toContain('name="email"');
    expect(loginPage).toContain('type="email"');
    expect(loginPage).toContain('name="password"');
    expect(loginPage).toContain('type="password"');
    expect(loginPage).toContain('href="/auth/recover"');
    expect(loginPage).not.toContain("beginOidcSignIn");
  });

  it("authenticates through the application account and session boundary", () => {
    expect(loginPage).toContain("signInWithEmailPassword");
    expect(loginActions).toContain("authenticateAccountByEmail");
    expect(loginActions).toContain("setApplicationSessionCookie");
    expect(loginActions).toContain("recordAuthenticationEvent");
    expect(loginActions).not.toContain("getOidcAuthorizationUrl");
  });
});
