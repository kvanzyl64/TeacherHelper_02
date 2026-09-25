export type InvoiceDocument = {
  id: string;
  title: string;
  currency: string;
  total: string;
  dueAt: Date;
  documentReference?: string;
};

export function buildInvoiceDocument(input: {
  id: string;
  currency: string;
  total: string;
  dueAt: Date;
  documentReference?: string;
}): InvoiceDocument {
  return {
    id: input.id,
    title: "Invoice",
    currency: input.currency,
    total: input.total,
    dueAt: input.dueAt,
    documentReference: input.documentReference,
  };
}
