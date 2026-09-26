import type { PoolClient } from "pg";
import type { OidcClaims } from "./oidc-provider";

export type ResolvedIdentity = {
  identityId: string;
  issuer: string;
  subject: string;
  userId: string | null;
  platformAdminId: string | null;
  platformRole: "platform_owner" | "support_readonly" | null;
  platformStatus: "active" | "suspended" | "disabled" | null;
};

export class IdentityResolutionError extends Error {
  constructor() {
    super("The requested resource is unavailable");
    this.name = "IdentityResolutionError";
  }
}

export async function resolveIdentity(client: Pick<PoolClient, "query">, claims: Pick<OidcClaims, "iss" | "sub">): Promise<ResolvedIdentity> {
  const identity = await client.query<{ id: string; status: "active" | "disabled" }>(
    "SELECT id, status FROM app.auth_identities WHERE issuer = $1 AND subject = $2",
    [claims.iss, claims.sub],
  );
  const mapping = identity.rows[0];
  if (!mapping || mapping.status !== "active") throw new IdentityResolutionError();

  const user = await client.query<{ id: string }>("SELECT id FROM app.users WHERE identity_id = $1 AND authentication_status = 'active'", [mapping.id]);
  const admin = await client.query<{ id: string; role: ResolvedIdentity["platformRole"]; status: ResolvedIdentity["platformStatus"] }>(
    "SELECT id, role, status FROM app.platform_admins WHERE identity_id = $1",
    [mapping.id],
  );
  const adminRow = admin.rows[0];
  if (!user.rows[0] && !adminRow) throw new IdentityResolutionError();
  return {
    identityId: mapping.id,
    issuer: claims.iss,
    subject: claims.sub,
    userId: user.rows[0]?.id ?? null,
    platformAdminId: adminRow?.id ?? null,
    platformRole: adminRow?.role ?? null,
    platformStatus: adminRow?.status ?? null,
  };
}