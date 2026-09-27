import type { PoolClient } from "pg";
import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { checkAuthenticationRateLimit } from "./rate-limit";
import { recordAuthenticationEvent } from "./security-events";

function createClient(count: number) {
  return {
    query: vi.fn().mockResolvedValue({ rows: [{ event_count: count }] }),
  } as unknown as Pick<PoolClient, "query">;
}

describe("authentication rate limits", () => {
  it("allows attempts below the sign-in threshold without exposing identifiers", async () => {
    const client = createClient(4);
    await expect(
      checkAuthenticationRateLimit(client, {
        email: "Owner@Example.Test",
        source: "192.0.2.10",
        scope: "sign_in",
      }),
    ).resolves.toMatchObject({ allowed: true, remaining: 1 });
    const [, parameters] = vi.mocked(client.query).mock.calls[0];
    expect(parameters).toEqual([
      createHash("sha256").update("owner@example.test").digest("hex"),
      createHash("sha256").update("192.0.2.10").digest("hex"),
      "sign_in_failure",
    ]);
    expect(parameters).not.toContain("Owner@Example.Test");
    expect(parameters).not.toContain("192.0.2.10");
  });

  it("denies attempts at the configured threshold with a bounded retry delay", async () => {
    await expect(
      checkAuthenticationRateLimit(createClient(5), {
        email: "owner@example.test",
        scope: "sign_in",
      }),
    ).resolves.toMatchObject({ allowed: false, remaining: 0, retryAfterSeconds: 900 });
    await expect(
      checkAuthenticationRateLimit(createClient(3), {
        email: "owner@example.test",
        scope: "recovery",
      }),
    ).resolves.toMatchObject({ allowed: false, remaining: 0, retryAfterSeconds: 900 });
  });

  it("records only digests and allowlisted metadata for authentication events", async () => {
    const client = createClient(0);
    await recordAuthenticationEvent(client, {
      eventType: "sign_in_failure",
      outcome: "failure",
      email: "Owner@Example.Test",
      source: "192.0.2.10",
      reasonCode: "invalid_credentials",
    });
    const [query, parameters] = vi.mocked(client.query).mock.calls[0];

    expect(query).toContain("INSERT INTO app.auth_security_events");
    expect(parameters).toContain(createHash("sha256").update("owner@example.test").digest("hex"));
    expect(parameters).toContain(createHash("sha256").update("192.0.2.10").digest("hex"));
    expect(parameters).not.toContain("Owner@Example.Test");
    expect(parameters).not.toContain("192.0.2.10");
    expect(JSON.parse(parameters[6] as string)).toEqual({ reasonCode: "invalid_credentials" });
  });
});
