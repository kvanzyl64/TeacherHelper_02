import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { describe, expect, it, vi } from "vitest";
import { digestSecret } from "../../../../packages/integrations/src/auth/session-provider";
import {
  clearApplicationSessionCookie,
  createApplicationSession,
  isApplicationSessionActive,
  resolveApplicationSession,
  revokeApplicationSession,
  sessionCookieName,
  setApplicationSessionCookie,
} from "./session";

function createClient(rows: unknown[] = []) {
  return {
    query: vi.fn().mockResolvedValue({ rows }),
  } as unknown as Pick<PoolClient, "query">;
}

describe("application sessions", () => {
  it("stores only a digest and applies the configured session lifetime", async () => {
    const client = createClient([{ session_id: "session-id" }]);
    const now = new Date("2026-09-27T12:00:00.000Z");
    const created = await createApplicationSession(
      client,
      { userId: "user-id", platformAdminId: null },
      { now },
    );
    const [, parameters] = vi.mocked(client.query).mock.calls[0];

    expect(created.sessionId).toBe("session-id");
    expect(parameters).toContain(digestSecret(created.token));
    expect(parameters).not.toContain(created.token);
    expect(new Date(parameters[3] as Date).getTime()).toBe(now.getTime() + 8 * 60 * 60 * 1000);
  });

  it("rejects expired sessions before authorization", () => {
    const now = new Date("2026-09-27T12:00:00.000Z");
    expect(
      isApplicationSessionActive({ expiresAt: new Date(now.getTime() - 1), revokedAt: null }, now),
    ).toBe(false);
    expect(
      isApplicationSessionActive({ expiresAt: new Date(now.getTime() + 1), revokedAt: null }, now),
    ).toBe(true);
    expect(
      isApplicationSessionActive({ expiresAt: new Date(now.getTime() + 1), revokedAt: now }, now),
    ).toBe(false);
  });

  it("resolves a stored session by digest and treats missing rows as unauthenticated", async () => {
    const session = {
      session_id: "session-id",
      user_id: "user-id",
      platform_admin_id: null,
      platform_role: null,
      platform_status: null,
      authentication_status: "active",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    };
    const token = randomBytes(32).toString("base64url");
    const client = createClient([session]);
    await expect(resolveApplicationSession(client, token)).resolves.toMatchObject({
      sessionId: "session-id",
      userId: "user-id",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    });
    expect(client.query).toHaveBeenCalledWith("SELECT * FROM app.resolve_application_session($1)", [
      digestSecret(token),
    ]);
    await expect(resolveApplicationSession(createClient(), token)).resolves.toBeNull();
  });

  it("revokes a session using only the token digest", async () => {
    const token = randomBytes(32).toString("base64url");
    const client = createClient([{ revoked: true }]);
    await expect(revokeApplicationSession(client, token)).resolves.toBe(true);
    expect(client.query).toHaveBeenCalledWith(
      "SELECT app.revoke_application_session($1) AS revoked",
      [digestSecret(token)],
    );
  });

  it("sets protected cookie attributes and clears the shared session cookie", () => {
    const store = { set: vi.fn(), delete: vi.fn() };
    const token = randomBytes(32).toString("base64url");
    setApplicationSessionCookie(store, token);

    expect(store.set).toHaveBeenCalledWith(sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    clearApplicationSessionCookie(store);
    expect(store.delete).toHaveBeenCalledWith(sessionCookieName);
  });
});
