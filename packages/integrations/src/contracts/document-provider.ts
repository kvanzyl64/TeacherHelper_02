export type DocumentRequest = {
  idempotencyKey: string;
  templateKey: string;
  data: Record<string, unknown>;
};

export type DocumentResult = { storageReference: string; contentType: "application/pdf" };

export interface DocumentProvider {
  render(request: DocumentRequest): Promise<DocumentResult>;
}