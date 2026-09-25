import { describe, expect, it } from "vitest";
import { createInvoiceRecord, issueInvoice } from "../../packages/domain/src/billing/invoice-service";
import {
  createInvoiceAccessLink,
  createInvoiceNotification,
} from "../../packages/domain/src/billing/invoice-notification-service";

describe("invoice notification contract", () => {
  it("creates a ZAR invoice with immutable issued totals and guardian delivery metadata", () => {
    const invoice = createInvoiceRecord({
      centreId: "centre-a",
      studentId: "student-1",
      familyReference: "family-1",
      periodStart: new Date("2026-09-01T00:00:00Z"),
      periodEnd: new Date("2026-09-30T00:00:00Z"),
      lineItems: [
        { description: "Tuition", amount: "1200.00", taxable: true },
        { description: "Materials", amount: "250.00", taxable: true },
      ],
      dueAt: new Date("2026-10-10T00:00:00Z"),
      createdBy: "admin-1",
    });

    expect(invoice.currency).toBe("ZAR");
    expect(invoice.status).toBe("draft");
    expect(invoice.total).toBe("1450.00");

    const issued = issueInvoice(invoice, "admin-1");
    expect(issued.status).toBe("issued");
    expect(issued.documentReference).toMatch(/^INV-/);

    const link = createInvoiceAccessLink({
      centreId: invoice.centreId,
      guardianId: "guardian-1",
      studentId: invoice.studentId,
      recordId: invoice.id,
      token: "invoice-token-1",
      now: new Date("2026-09-25T10:00:00Z"),
    });

    expect(link.recordType).toBe("invoice");
    expect(link.expiresAt.getTime() - link.sentAt.getTime()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);

    const notification = createInvoiceNotification({
      centreId: invoice.centreId,
      guardianId: "guardian-1",
      studentId: invoice.studentId,
      accessLinkId: link.id,
      templateKey: "guardian_invoice_template",
    });

    expect(notification.kind).toBe("invoice");
    expect(notification.status).toBe("queued");
    expect(notification.templateKey).toBe("guardian_invoice_template");
  });
});
