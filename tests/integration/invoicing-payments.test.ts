import { describe, expect, it } from "vitest";
import { createInvoiceRecord, issueInvoice, getInvoiceGuardianView } from "../../packages/domain/src/billing/invoice-service";
import { recordPayment } from "../../packages/domain/src/billing/payment-service";

describe("invoicing and payments", () => {
  it("records EFT and cash payments and advances the invoice state to paid", () => {
    const invoice = createInvoiceRecord({
      centreId: "centre-a",
      studentId: "student-1",
      familyReference: "family-1",
      periodStart: new Date("2026-09-01T00:00:00Z"),
      periodEnd: new Date("2026-09-30T00:00:00Z"),
      lineItems: [{ description: "Tuition", amount: "1000.00", taxable: true }],
      dueAt: new Date("2026-10-10T00:00:00Z"),
      createdBy: "admin-1",
    });

    const issued = issueInvoice(invoice, "admin-1");
    const partial = recordPayment({
      invoice: issued,
      method: "eft",
      amount: "600.00",
      currency: "ZAR",
      receivedAt: new Date("2026-09-28T09:00:00Z"),
      reference: "EFT-001",
      recordedBy: "admin-1",
    });

    expect(partial.status).toBe("partially_paid");
    expect(partial.payments).toHaveLength(1);

    const paid = recordPayment({
      invoice: partial,
      method: "cash",
      amount: "400.00",
      currency: "ZAR",
      receivedAt: new Date("2026-09-29T09:00:00Z"),
      reference: "CASH-001",
      recordedBy: "admin-1",
    });

    expect(paid.status).toBe("paid");
    expect(paid.receiptId).toMatch(/^RCPT-/);
    expect(paid.totalPaid).toBe("1000.00");
  });

  it("exposes only the linked guardian family invoice and rejects another family scope", () => {
    const invoice = issueInvoice(
      createInvoiceRecord({
        centreId: "centre-a",
        studentId: "student-1",
        familyReference: "family-1",
        periodStart: new Date("2026-09-01T00:00:00Z"),
        periodEnd: new Date("2026-09-30T00:00:00Z"),
        lineItems: [{ description: "Tuition", amount: "1500.00", taxable: true }],
        dueAt: new Date("2026-10-10T00:00:00Z"),
        createdBy: "admin-1",
      }),
      "admin-1",
    );

    const guardianView = getInvoiceGuardianView(invoice, {
      guardianId: "guardian-1",
      studentId: "student-1",
      familyReference: "family-1",
    });

    expect(guardianView.total).toBe("1500.00");
    expect(() =>
      getInvoiceGuardianView(invoice, {
        guardianId: "guardian-2",
        studentId: "student-1",
        familyReference: "family-2",
      }),
    ).toThrow("The invoice is unavailable for this guardian");
  });
});
