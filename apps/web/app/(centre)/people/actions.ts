"use server";

import { validateGuardianInput, validateStudentInput } from "../../../../../packages/domain/src/people/people-repository";
import { createPostgresPeopleRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../lib/auth/dal";
import { getDatabasePool } from "../../../lib/database";

export async function validateStudentAction(formData: FormData): Promise<void> {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const input = validateStudentInput({ reference: String(formData.get("reference") ?? ""), name: String(formData.get("name") ?? "") });
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.centre_id", membership.centreId]);
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", membership.userId]);
    await createPostgresPeopleRepository(client).createStudent(membership.centreId, input);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

export async function validateGuardianAction(formData: FormData): Promise<void> {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  if (membership.role !== "owner" && membership.role !== "admin") throw new Error("Guardian management is unavailable");
  const input = validateGuardianInput({ name: String(formData.get("name") ?? ""), whatsappNumber: String(formData.get("whatsappNumber") ?? "") });
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.centre_id", membership.centreId]);
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", membership.userId]);
    await createPostgresPeopleRepository(client).createGuardian(membership.centreId, input);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}