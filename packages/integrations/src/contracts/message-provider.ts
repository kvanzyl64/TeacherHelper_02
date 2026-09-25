export type ProviderFailure = {
  category: "transient" | "permanent";
  code: string;
  message: string;
  providerEventId?: string;
};

export type MessageRequest = {
  idempotencyKey: string;
  to: string;
  templateKey: string;
  parameters: readonly string[];
};

export type MessageResult = { providerMessageId: string; acceptedAt: Date };

export interface MessageProvider {
  send(request: MessageRequest): Promise<MessageResult>;
  normalizeFailure(error: unknown): ProviderFailure;
}