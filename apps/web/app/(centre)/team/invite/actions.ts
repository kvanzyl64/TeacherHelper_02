"use server";

import { createHash, randomBytes } from "node:crypto";
import { createMembershipInvitation } from "@teacher-helper/domain";
import { createPostgresMembershipInvitationRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";

function digestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviteTeamMemberAction(formData: globalThis.FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "tutor");

  if (!email || (role !== "admin" && role !== "tutor" && role !== "owner")) throw new Error("The invitation is invalid");
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  if (membership.role !== "owner" && membership.role !== "admin") throw new Error("Invitations are unavailable");

  const token = randomBytes(24).toString("base64url");
  const invitation = createMembershipInvitation({
    centreId: membership.centreId,
    email,
    role,
    tokenDigest: digestToken(token),
  });
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.centre_id", membership.centreId]);
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", membership.userId]);
    await createPostgresMembershipInvitationRepository(client).insert(invitation);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}
