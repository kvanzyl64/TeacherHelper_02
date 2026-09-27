import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import { describe, expect, it, vi } from "vitest";
import { authenticateAccountByEmail, lookupAccountByEmail } from "./account";
import { hashPassword } from "./platform-admin-credentials";

function createClient(rows: unknown[]) {
  return {
    query: vi.fn().mockResolvedValue({ rows }),
  } as unknown as Pick<PoolClient, "query">;
}

describe("application account lookup", () => {
  it("normalizes the email and resolves active centre memberships", async () => {
    const client = createClient([
      {
        principal_type: "centre",
        principal_id: "user-id",
        password_hash: "scrypt$hash",
        account_status: "active",
        platform_role: null,
        memberships: [{ centreId: "centre-id", role: "owner" }],
      },
    ]);

    await expect(lookupAccountByEmail(client, " Owner@Example.Test ")).resolves.toMatchObject({
      kind: "centre",
      id: "user-id",
      email: "owner@example.test",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    });
    expect(client.query).toHaveBeenCalledWith(
      "SELECT * FROM app.lookup_application_accounts_by_email($1)",
      ["owner@example.test"],
    );
  });

  it("resolves only active platform owners", async () => {
    const client = createClient([
      {
        principal_type: "platform_admin",
        principal_id: "admin-id",
        password_hash: "scrypt$hash",
        account_status: "active",
        platform_role: "platform_owner",
        memberships: [],
      },
    ]);

    await expect(lookupAccountByEmail(client, "owner@example.test")).resolves.toMatchObject({
      kind: "platform_admin",
      id: "admin-id",
      role: "platform_owner",
    });
  });

  it.each([
    {
      principal_type: "centre",
      account_status: "pending",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    },
    { principal_type: "centre", account_status: "active", memberships: [] },
    {
      principal_type: "platform_admin",
      account_status: "suspended",
      platform_role: "platform_owner",
    },
    {
      principal_type: "platform_admin",
      account_status: "active",
      platform_role: "support_readonly",
    },
  ])("rejects inactive or unauthorized account rows", async (row) => {
    await expect(
      lookupAccountByEmail(
        createClient([{ ...row, principal_id: "id", password_hash: "scrypt$hash" }]),
        "person@example.test",
      ),
    ).resolves.toBeNull();
  });

  it("rejects ambiguous principals and accounts without a password verifier", async () => {
    const centre = {
      principal_type: "centre",
      principal_id: "user-id",
      password_hash: "scrypt$hash",
      account_status: "active",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    };
    await expect(
      lookupAccountByEmail(
        createClient([centre, { ...centre, principal_type: "platform_admin" }]),
        "person@example.test",
      ),
    ).resolves.toBeNull();
    await expect(
      lookupAccountByEmail(
        createClient([{ ...centre, password_hash: null }]),
        "person@example.test",
      ),
    ).resolves.toBeNull();
  });

  it("returns the account only for a matching password and uses the same null result for unknown email", async () => {
    const password = randomBytes(32).toString("base64url");
    const passwordHash = await hashPassword(password);
    const activeAccount = {
      principal_type: "centre",
      principal_id: "user-id",
      password_hash: passwordHash,
      account_status: "active",
      memberships: [{ centreId: "centre-id", role: "owner" }],
    };

    await expect(
      authenticateAccountByEmail(createClient([activeAccount]), "owner@example.test", password),
    ).resolves.toMatchObject({ kind: "centre", id: "user-id" });
    await expect(
      authenticateAccountByEmail(
        createClient([activeAccount]),
        "owner@example.test",
        randomBytes(32).toString("base64url"),
      ),
    ).resolves.toBeNull();
    await expect(
      authenticateAccountByEmail(
        createClient([]),
        "unknown@example.test",
        randomBytes(32).toString("base64url"),
      ),
    ).resolves.toBeNull();
  });
});
