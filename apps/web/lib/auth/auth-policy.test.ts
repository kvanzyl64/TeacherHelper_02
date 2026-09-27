import { describe, expect, it } from "vitest";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  validatePassword,
} from "./auth-policy";

describe("authentication policy", () => {
  it("normalizes email using the stored account comparison rules", () => {
    expect(normalizeEmail("  Centre.Owner@Example.Test  ")).toBe("centre.owner@example.test");
    expect(() => normalizeEmail("   ")).toThrow("email");
  });

  it("enforces password length boundaries without normalizing the password", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(12);
    expect(MAX_PASSWORD_LENGTH).toBe(1024);
    expect(() => validatePassword("a".repeat(MIN_PASSWORD_LENGTH))).not.toThrow();
    expect(() => validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toThrow("password");
    expect(() => validatePassword("a".repeat(MAX_PASSWORD_LENGTH + 1))).toThrow("password");
  });
});
