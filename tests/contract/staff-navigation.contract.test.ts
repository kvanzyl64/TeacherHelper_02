import { describe, expect, it } from "vitest";
import { getVisibleNavigationLinks } from "../../apps/web/components/navigation/centre-navigation";

describe("staff navigation contract", () => {
  it("shows centre workflow destinations to owners and administrators", () => {
    for (const role of ["owner", "admin"] as const) {
      const hrefs = getVisibleNavigationLinks(role).map((link) => link.href);
      expect(hrefs).toEqual(expect.arrayContaining(["/dashboard", "/people", "/centre/sessions", "/billing/invoices", "/team/invite", "/settings/centre"]));
    }

    const ownerHrefs = getVisibleNavigationLinks("owner").map((link) => link.href);
    const adminHrefs = getVisibleNavigationLinks("admin").map((link) => link.href);
    expect(ownerHrefs).toEqual(expect.arrayContaining(["/exports", "/operations/alerts"]));
    expect(adminHrefs).not.toEqual(expect.arrayContaining(["/exports", "/operations/alerts"]));
  });

  it("keeps tutor navigation assignment-scoped", () => {
    const hrefs = getVisibleNavigationLinks("tutor").map((link) => link.href);

    expect(hrefs).toEqual(expect.arrayContaining(["/students", "/sessions"]));
    expect(hrefs).not.toEqual(expect.arrayContaining(["/billing/invoices", "/exports", "/operations/alerts"]));
  });
});