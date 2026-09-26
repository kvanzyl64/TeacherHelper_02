import type { PoolClient } from "pg";

export const syntheticTenantIds = {
  centreA: "00000000-0000-0000-0000-000000000001",
  centreB: "00000000-0000-0000-0000-000000000002",
  userA: "00000000-0000-0000-0000-000000000011",
  userB: "00000000-0000-0000-0000-000000000012",
  identityA: "00000000-0000-0000-0000-000000000021",
  identityB: "00000000-0000-0000-0000-000000000022",
};

export async function seedSyntheticTenant(client: Pick<PoolClient, "query">, input: { centreId: string; userId: string; identityId: string; issuer: string; subject: string; role?: "owner" | "admin" | "tutor" }) {
  const role = input.role ?? "owner";
  await client.query("INSERT INTO app.auth_identities (id, issuer, subject, status) VALUES ($1, $2, $3, 'active') ON CONFLICT (id) DO UPDATE SET issuer = EXCLUDED.issuer, subject = EXCLUDED.subject, status = 'active'", [input.identityId, input.issuer, input.subject]);
  await client.query("INSERT INTO app.users (id, identity_id, email, display_name, authentication_status) VALUES ($1, $2, $3, $4, 'active') ON CONFLICT (id) DO NOTHING", [input.userId, input.identityId, `${input.subject}@synthetic.invalid`, `Synthetic ${input.subject}`]);
  await client.query("INSERT INTO app.centres (id, name, status) VALUES ($1, $2, 'active') ON CONFLICT (id) DO NOTHING", [input.centreId, `Synthetic Centre ${input.subject}`]);
  await client.query("INSERT INTO app.centre_memberships (centre_id, user_id, role, status, accepted_at) VALUES ($1, $2, $3, 'active', now()) ON CONFLICT (centre_id, user_id) DO NOTHING", [input.centreId, input.userId, role]);
  return { centreId: input.centreId, userId: input.userId, identityId: input.identityId };
}