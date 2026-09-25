"use server";

import {
  createInMemoryOnboardingRepository,
  OnboardingService,
  validateOnboardingInput,
} from "@teacher-helper/domain";

const repository = createInMemoryOnboardingRepository();
const service = new OnboardingService(repository);

export async function createCentreAction(
  formData: globalThis.FormData,
): Promise<void> {
  try {
    const centre = validateOnboardingInput({
      name: formData.get("name"),
      timezone: formData.get("timezone"),
      plan: formData.get("plan"),
    });
    await service.createCentre({
      actorRole: "owner",
      actorUserId: "owner-demo",
      centre,
    });

    return;
  } catch {
    return;
  }
}
