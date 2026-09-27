"use server";

import {
  OnboardingService,
  validateOnboardingInput,
} from "@teacher-helper/domain";
import { createPostgresOnboardingRepository } from "@teacher-helper/integrations";
import { getCurrentIdentity, AuthorizationError } from "../../../lib/auth/dal";
import { getDatabasePool } from "../../../lib/database";

export async function createCentreAction(
  formData: globalThis.FormData,
): Promise<void> {
  try {
    const identity = await getCurrentIdentity();
    if (!identity.userId) throw new AuthorizationError();
    const centre = validateOnboardingInput({
      name: formData.get("name"),
      timezone: formData.get("timezone"),
      plan: formData.get("plan"),
    });
    const client = await getDatabasePool().connect();
    try {
      await client.query("BEGIN");
      const service = new OnboardingService(createPostgresOnboardingRepository(client));
      await service.createCentre({ actorRole: "owner", actorUserId: identity.userId, centre });
      await client.query("COMMIT");
      return;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch {
    throw new Error("Centre onboarding could not be completed");
  }
}
