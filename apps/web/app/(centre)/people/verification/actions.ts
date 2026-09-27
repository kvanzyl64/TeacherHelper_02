"use server";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";

export async function requestGuardianChallengeAction(formData: FormData): Promise<void> {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  if (membership.role !== "owner" && membership.role !== "admin") throw new Error("Guardian verification is unavailable");
  const guardianId = String(formData.get("guardian") ?? "").trim();
  if (!guardianId) throw new Error("A guardian is required");
  const code = String(randomInt(100000, 1000000));
  const digest = createHash("sha256").update(code).digest("hex");
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.centre_id", membership.centreId]);
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", membership.userId]);
    const guardian = await client.query("SELECT id FROM app.guardians WHERE id = $1 AND centre_id = $2", [guardianId, membership.centreId]);
    if (!guardian.rowCount) throw new Error("The guardian is unavailable");
    await client.query(
      `INSERT INTO app.verification_challenges (id, centre_id, guardian_id, channel, purpose, code_digest, expires_at)
       VALUES ($1, $2, $3, 'whatsapp', 'guardian_number', $4, now() + interval '10 minutes')`,
      [randomUUID(), membership.centreId, guardianId, digest],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}