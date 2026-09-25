import { randomUUID } from "node:crypto";
import type { InvoiceRecord, InvoiceStatus } from "./invoice-service";

export type PaymentMethod = "eft" | "cash" | "other";

export type PaymentRecord = {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: string;
  currency: "ZAR";
  receivedAt: Date;
  reference: string;
  status: "recorded";
  recordedBy: string;
  createdAt: Date;
};

function normalizeAmount(value: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    throw new Error("The payment amount is invalid");
  }
  return amount.toFixed(2);
}

function sumAmounts(values: string[]): string {
  return values.reduce((total, value) => (Number(total) + Number(value)).toFixed(2), "0.00");
}

export function recordPayment(input: {
  invoice: InvoiceRecord;
  method: PaymentMethod;
  amount: string;
  currency: "ZAR";
  receivedAt?: Date;
  reference: string;
  recordedBy: string;
}): InvoiceRecord {
  if (input.invoice.status === "draft") {
    throw new Error("Only issued invoices can receive payments");
  }

  const now = input.receivedAt ?? new Date();
  const normalizedAmount = normalizeAmount(input.amount);
  const updatedPayments: PaymentRecord[] = [
    ...input.invoice.payments,
    {
      id: randomUUID(),
      invoiceId: input.invoice.id,
      method: input.method,
      amount: normalizedAmount,
      currency: input.currency,
      receivedAt: now,
      reference: input.reference,
      status: "recorded",
      recordedBy: input.recordedBy,
      createdAt: now,
    },
  ];

  const totalPaid = sumAmounts(updatedPayments.map((payment) => payment.amount));
  const paidTotal = Number(totalPaid);
  const invoiceTotal = Number(input.invoice.total);

  let nextStatus: InvoiceStatus = input.invoice.status;
  if (paidTotal < invoiceTotal) {
    nextStatus = "partially_paid";
  } else if (paidTotal >= invoiceTotal) {
    nextStatus = "paid";
  }

  return {
    ...input.invoice,
    payments: updatedPayments,
    totalPaid,
    status: nextStatus,
    updatedAt: now,
    receiptId: nextStatus === "paid" ? `RCPT-${randomUUID().slice(0, 8).toUpperCase()}` : input.invoice.receiptId,
  };
}
