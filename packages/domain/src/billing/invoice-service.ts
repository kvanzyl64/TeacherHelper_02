import { randomUUID } from "node:crypto";

export type InvoiceLineItem = {
  description: string;
  amount: string;
  taxable: boolean;
};

export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "paid" | "disputed" | "failed" | "cancelled";

export type PaymentLine = {
  id: string;
  invoiceId: string;
  method: "eft" | "cash" | "other";
  amount: string;
  currency: "ZAR";
  receivedAt: Date;
  reference: string;
  status: "recorded";
  recordedBy: string;
  createdAt: Date;
};

export type InvoiceRecord = {
  id: string;
  centreId: string;
  studentId: string;
  familyReference: string;
  periodStart: Date;
  periodEnd: Date;
  currency: "ZAR";
  lineItems: InvoiceLineItem[];
  subtotal: string;
  taxAmount: string;
  total: string;
  dueAt: Date;
  status: InvoiceStatus;
  documentReference?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  issuedAt?: Date;
  totalPaid: string;
  payments: PaymentLine[];
  receiptId?: string;
  failureReason?: string;
};

export type InvoiceInput = {
  centreId: string;
  studentId: string;
  familyReference: string;
  periodStart: Date;
  periodEnd: Date;
  lineItems: InvoiceLineItem[];
  dueAt: Date;
  currency?: "ZAR";
  createdBy: string;
  now?: Date;
};

function normalizeAmount(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error("The invoice amount is invalid");
  }
  return amount.toFixed(2);
}

function sumLineItems(items: InvoiceLineItem[]): string {
  return items.reduce((total, item) => {
    return (Number(total) + Number(normalizeAmount(item.amount))).toFixed(2);
  }, "0.00");
}

export function createInvoiceRecord(input: InvoiceInput): InvoiceRecord {
  if (!input.centreId || !input.studentId || !input.familyReference || !input.createdBy) {
    throw new Error("The invoice input is incomplete");
  }

  const now = input.now ?? new Date();
  const lineItems = input.lineItems.map((item) => ({
    ...item,
    description: item.description.trim(),
    amount: normalizeAmount(item.amount),
  }));
  const subtotal = sumLineItems(lineItems);

  return {
    id: randomUUID(),
    centreId: input.centreId,
    studentId: input.studentId,
    familyReference: input.familyReference,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    currency: input.currency ?? "ZAR",
    lineItems,
    subtotal,
    taxAmount: "0.00",
    total: subtotal,
    dueAt: input.dueAt,
    status: "draft",
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    totalPaid: "0.00",
    payments: [],
  };
}

export function issueInvoice(invoice: InvoiceRecord, issuedBy = "centre-admin"): InvoiceRecord {
  if (invoice.status !== "draft") {
    throw new Error("Only a draft invoice can be issued");
  }

  const now = new Date();
  return {
    ...invoice,
    status: "issued",
    documentReference: `INV-${randomUUID().slice(0, 8).toUpperCase()}`,
    issuedAt: now,
    updatedAt: now,
    createdBy: issuedBy,
  };
}

export function markInvoiceFailed(invoice: InvoiceRecord, failureReason: string): InvoiceRecord {
  if (!failureReason.trim()) {
    throw new Error("A failure reason is required");
  }

  return {
    ...invoice,
    status: "failed",
    failureReason,
    updatedAt: new Date(),
  };
}

export function getInvoiceGuardianView(
  invoice: InvoiceRecord,
  input: { guardianId: string; studentId: string; familyReference: string },
): Pick<InvoiceRecord, "id" | "centreId" | "studentId" | "familyReference" | "currency" | "total" | "status" | "dueAt" | "documentReference"> {
  if (input.studentId !== invoice.studentId || input.familyReference !== invoice.familyReference) {
    throw new Error("The invoice is unavailable for this guardian");
  }

  return {
    id: invoice.id,
    centreId: invoice.centreId,
    studentId: invoice.studentId,
    familyReference: invoice.familyReference,
    currency: invoice.currency,
    total: invoice.total,
    status: invoice.status,
    dueAt: invoice.dueAt,
    documentReference: invoice.documentReference,
  };
}
