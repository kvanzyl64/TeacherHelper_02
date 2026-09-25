export type WhatsAppProviderResponse = {
  providerMessageId: string;
  status: "accepted" | "delivered" | "failed";
  failureReason?: string;
};

export function sendWhatsAppMessage(input: {
  to: string;
  templateKey: string;
  variables?: Record<string, string | number>;
  idempotencyKey?: string;
}): WhatsAppProviderResponse {
  return {
    providerMessageId: `wa-${input.idempotencyKey ?? input.templateKey}`,
    status: "accepted",
  };
}

export function normalizeProviderFailureReason(reason?: string): string | undefined {
  if (!reason) return undefined;
  const normalized = reason.toLowerCase().replace(/\s+/g, "_");

  if (["timeout", "network", "rate_limited", "temporary_service_error"].includes(normalized)) {
    return normalized;
  }

  return normalized;
}
