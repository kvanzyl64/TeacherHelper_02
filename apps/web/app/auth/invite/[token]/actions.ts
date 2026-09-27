"use server";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { createPostgresInvitationAcceptanceRepository } from "@teacher-helper/integrations";
import { verifyOidcIdToken } from "../../../../lib/auth/oidc-provider";
import { getDatabasePool } from "../../../../lib/database";

export async function acceptInvitationAction(token: string): Promise<void> {
  const idToken = (await cookies()).get("teacher_helper_oidc_id_token")?.value;
  if (!idToken) redirect("/auth/login" as Route);

  const claims = await verifyOidcIdToken(idToken).catch(() => null);
  if (!claims) redirect("/auth/login?error=invalid" as Route);

  const digest = createHash("sha256").update(token).digest("hex");
  const client = await getDatabasePool().connect();
  let accepted: Awaited<ReturnType<ReturnType<typeof createPostgresInvitationAcceptanceRepository>["accept"]>> = null;
  try {
    await client.query("BEGIN");
    accepted = await createPostgresInvitationAcceptanceRepository(client).accept({
      tokenDigest: digest,
      issuer: claims.iss,
      subject: claims.sub,
      email: claims.email ?? `${claims.sub}@identity.local`,
      displayName: claims.name ?? claims.email ?? "Centre member",
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  redirect((accepted ? "/dashboard" : `/auth/invite/${token}?error=invalid`) as Route);
}
