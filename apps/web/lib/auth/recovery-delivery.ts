import { createWebhookPasswordRecoveryDelivery } from "../../../../packages/integrations/src/auth/password-recovery-delivery";
import type { PasswordRecoveryMessage } from "../../../../packages/integrations/src/auth/password-recovery-delivery";

type RecoveryCaptureGlobal = typeof globalThis & {
  teacherHelperRecoveryMessages?: PasswordRecoveryMessage[];
};

const recoveryCaptureGlobal = globalThis as RecoveryCaptureGlobal;

function capturedMessages(): PasswordRecoveryMessage[] {
  recoveryCaptureGlobal.teacherHelperRecoveryMessages ??= [];
  return recoveryCaptureGlobal.teacherHelperRecoveryMessages;
}

export function takeCapturedPasswordRecoveryMessage(email: string): PasswordRecoveryMessage | null {
  const normalizedEmail = email.trim().toLowerCase();
  const messages = capturedMessages();
  const index = messages.findIndex((message) => message.to.toLowerCase() === normalizedEmail);
  if (index < 0) return null;
  return messages.splice(index, 1)[0] ?? null;
}

export function getPasswordRecoveryDelivery() {
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_TEST_RECOVERY_CAPTURE_SECRET) {
    return {
      async sendRecoveryMessage(message: PasswordRecoveryMessage): Promise<void> {
        capturedMessages().push({ ...message });
      },
    };
  }

  const endpoint = process.env.AUTH_RECOVERY_DELIVERY_URL?.trim();
  if (!endpoint) return null;

  return createWebhookPasswordRecoveryDelivery({
    endpoint,
    bearerToken: process.env.AUTH_RECOVERY_DELIVERY_TOKEN,
    allowInsecureLocalhost: process.env.NODE_ENV !== "production",
  });
}
