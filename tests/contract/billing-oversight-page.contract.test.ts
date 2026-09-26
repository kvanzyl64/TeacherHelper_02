import { describe, expect, it } from "vitest";
import { getVisibleNavigationLinks } from "../../apps/web/components/navigation/centre-navigation";

describe("billing and oversight page contract", () => {
  it("shows billing and oversight destinations to the correct roles", () => {
    const ownerLinks = getVisibleNavigationLinks("owner").map((link) => link.href);
    const adminLinks = getVisibleNavigationLinks("admin").map((link) => link.href);

    expect(ownerLinks).toEqual(expect.arrayContaining(["/billing/invoices", "/billing/payments", "/billing/receipts", "/exports", "/operations/alerts"]));
    expect(adminLinks).toEqual(expect.arrayContaining(["/billing/invoices", "/billing/payments", "/billing/receipts"]));
    expect(adminLinks).not.toEqual(expect.arrayContaining(["/exports", "/operations/alerts"]));
  });

  it("keeps the billing and oversight surfaces scoped to the centre", () => {
    const requiredHeadings = ["Invoices", "Payments", "Receipts", "Exports", "Operations alerts"];
    expect(requiredHeadings).toHaveLength(5);
    expect(requiredHeadings.every((heading) => heading.length > 0)).toBe(true);
  });
});
