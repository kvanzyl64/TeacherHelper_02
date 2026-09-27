export type PasswordRecoveryMessage = {
  to: string;
  recoveryUrl: string;
  expiresAt: Date;
};

export interface PasswordRecoveryDelivery {
  sendRecoveryMessage(message: PasswordRecoveryMessage): Promise<void>;
}

export function createWebhookPasswordRecoveryDelivery(input: {
  endpoint: string;
  bearerToken?: string;
  allowInsecureLocalhost?: boolean;
  fetcher?: typeof fetch;
}): PasswordRecoveryDelivery {
  const endpoint = new URL(input.endpoint);
  const isLoopback = ["localhost", "127.0.0.1", "::1"].includes(endpoint.hostname);
  if (endpoint.protocol !== "https:" && !(input.allowInsecureLocalhost && isLoopback)) {
    throw new Error("Password recovery delivery requires HTTPS outside local development.");
  }

  return {
    async sendRecoveryMessage(message) {
      const response = await (input.fetcher ?? fetch)(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(input.bearerToken ? { authorization: `Bearer ${input.bearerToken}` } : {}),
        },
        body: JSON.stringify({
          to: message.to,
          recoveryUrl: message.recoveryUrl,
          expiresAt: message.expiresAt.toISOString(),
        }),
      });
      if (!response.ok)
        throw new Error("Password recovery delivery provider rejected the message.");
    },
  };
}
