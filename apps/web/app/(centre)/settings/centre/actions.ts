"use server";

import {
  CentreSettingsService,
} from "@teacher-helper/domain";
import { createPostgresCentreSettingsRepository } from "@teacher-helper/integrations";
import { getCurrentIdentity, getCurrentCentreMembership } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";

export async function saveCentreSettingsAction(formData: globalThis.FormData): Promise<void> {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  if (membership.role !== "owner" && membership.role !== "admin") throw new Error("Centre settings are unavailable");
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const service = new CentreSettingsService(createPostgresCentreSettingsRepository(client));
    await service.saveSettings({
      actorRole: membership.role,
      centreId: membership.centreId,
      legalName: formData.get("legalName"),
      timezone: formData.get("timezone") ?? "Africa/Johannesburg",
      notificationEmail: formData.get("notificationEmail"),
    });
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
