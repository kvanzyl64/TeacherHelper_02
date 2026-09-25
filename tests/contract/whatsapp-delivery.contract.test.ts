import { describe, expect, it } from "vitest";
import {
  createNotification,
  normalizeProviderCallback,
  shouldRetryNotification,
} from "../../packages/domain/src/notifications/notification-service";

describe("whatsapp delivery contract", () => {
  it("creates normalized notifications and deduplicates provider callbacks", () => {
    const notification = createNotification({
      centreId: "centre-a",
      guardianId: "guardian-1",
      studentId: "student-1",
      accessLinkId: "link-1",
      kind: "session_update",
      templateKey: "approved-session-update",
      idempotencyKey: "msg-1",
    });

    expect(notification.status).toBe("queued");
    expect(notification.idempotencyKey).toBe("msg-1");
    expect(normalizeProviderCallback({ providerMessageId: "abc", event: "delivered", occurredAt: "2026-09-25T09:00:00Z" }).status).toBe("delivered");
  });

  it("retries transient failures and stops for permanent ones", () => {
    expect(shouldRetryNotification("timeout")).toBe(true);
    expect(shouldRetryNotification("rate_limited")).toBe(true);
    expect(shouldRetryNotification("blocked_number")).toBe(false);
    expect(shouldRetryNotification("invalid_template")).toBe(false);
  });
});
