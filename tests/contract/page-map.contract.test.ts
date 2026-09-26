import { describe, expect, it } from "vitest";
import { getVisibleNavigationLinks } from "../../apps/web/components/navigation/centre-navigation";
import {
  pageStateFixtures,
  pageSurfaceFixtures,
  roleVisibilityFixtures,
} from "../../apps/web/tests/page-map-fixtures";

describe("page map contract", () => {
  it("keeps the public home destinations intentional", () => {
    expect([
      "/auth/login",
      "/auth/signup",
      "#workflow",
      "#trust",
    ]).toEqual(["/auth/login", "/auth/signup", "#workflow", "#trust"]);
  });

  it("keeps role-visible navigation within the declared role boundaries", () => {
    const tutorLinks = getVisibleNavigationLinks("tutor").map((link) => link.href);
    const ownerLinks = getVisibleNavigationLinks("owner").map((link) => link.href);

    expect(tutorLinks).toContain("/students");
    expect(tutorLinks).toContain("/sessions");
    expect(tutorLinks).not.toContain("/billing/invoices");
    expect(tutorLinks).not.toContain("/exports");
    expect(tutorLinks).not.toContain("/operations/alerts");
    expect(ownerLinks).toContain("/exports");
    expect(ownerLinks).toContain("/operations/alerts");
    expect(ownerLinks).not.toContain("/students");
  });

  it("requires nested surfaces to declare a parent and every surface to declare a primary action", () => {
    for (const surface of pageSurfaceFixtures) {
      expect(surface.primaryAction.length).toBeGreaterThan(0);
      if (surface.family !== "public") expect(surface.parentKey?.length).toBeGreaterThan(0);
    }
  });

  it("provides labels for every required page state", () => {
    const requiredStates = [
      "loading",
      "empty",
      "unavailable",
      "not-found",
      "denied",
      "expired",
      "revoked",
      "failed",
    ] as const;

    for (const state of requiredStates) {
      expect(pageStateFixtures[state].label).toBeTruthy();
    }
    expect(roleVisibilityFixtures).toHaveLength(5);
  });
});