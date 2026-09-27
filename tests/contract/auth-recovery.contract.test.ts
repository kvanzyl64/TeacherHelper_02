import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const authRoot = join(process.cwd(), "apps/web/app/auth/recover");
const readRecoveryFile = (path: string) => readFileSync(join(authRoot, path), "utf8");

describe("password recovery contract", () => {
  it("accepts an email and uses the same confirmation route for every request", () => {
    const requestPage = readRecoveryFile("page.tsx");
    const requestActions = readRecoveryFile("actions.ts");
    expect(requestPage).toContain('name="email"');
    expect(requestPage).toContain('type="email"');
    expect(requestPage).toContain("requestPasswordRecovery");
    expect(requestPage).toContain("searchParams");
    expect(requestActions).toContain("checkAuthenticationRateLimit");
    expect(requestActions).toContain("recordAuthenticationEvent");
    expect(requestActions).toContain("/auth/recover?sent=1");
  });

  it("shows generic token errors and accepts a new password", () => {
    const tokenPage = readRecoveryFile("[token]/page.tsx");
    const tokenActions = readRecoveryFile("[token]/actions.ts");
    const requestActions = readRecoveryFile("actions.ts");
    expect(tokenPage).toContain('name="password"');
    expect(tokenPage).toContain('type="password"');
    expect(tokenPage).toContain('autoComplete="new-password"');
    expect(tokenPage).toContain('role="alert"');
    expect(tokenPage).toContain('referrer: "no-referrer"');
    expect(tokenPage).toContain("isPasswordRecoveryTokenValid");
    expect(tokenPage).toContain("completePasswordRecovery");
    expect(tokenActions).toContain("completePasswordRecoveryAction");
    expect(requestActions).toContain("clearApplicationSessionCookie");
    expect(requestActions).toContain("recordAuthenticationEvent");
  });

  it("does not log or render raw recovery credentials", () => {
    const requestActions = readRecoveryFile("actions.ts");
    const tokenActions = readRecoveryFile("[token]/actions.ts");
    const tokenPage = readRecoveryFile("[token]/page.tsx");
    expect(`${requestActions}\n${tokenActions}`).not.toMatch(/console\.(log|info|error).*token/i);
    expect(tokenPage).not.toContain("{token}");
  });
});
