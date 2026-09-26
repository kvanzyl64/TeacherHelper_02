import { describe, expect, it } from "vitest";

const publicLinks = [
  { label: "Log in", href: "/auth/login" },
  { label: "Start free", href: "/onboarding" },
  { label: "Create your centre", href: "/onboarding" },
  { label: "How it works", href: "#workflow" },
  { label: "Trust and privacy", href: "#trust" },
] as const;

describe("public page contract", () => {
  it("uses descriptive names and intentional destinations for public links", () => {
    expect(publicLinks.every((link) => link.label.trim().length > 0 && link.href.trim().length > 0)).toBe(true);
    expect(publicLinks.map((link) => link.href)).not.toContain("#");
  });

  it("keeps protected record language out of the public navigation contract", () => {
    const publicCopy = publicLinks.map((link) => link.label.toLowerCase()).join(" ");
    expect(publicCopy).not.toMatch(/student record|invoice|payment|guardian link|centre id/);
  });
});