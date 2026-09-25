"use server";

import {
  CentreSettingsService,
  createInMemoryCentreSettingsRepository,
} from "@teacher-helper/domain";

const service = new CentreSettingsService(createInMemoryCentreSettingsRepository());

export async function saveCentreSettingsAction(formData: globalThis.FormData): Promise<void> {
  try {
    await service.saveSettings({
      actorRole: "owner",
      centreId: "centre-demo",
      legalName: formData.get("legalName"),
      timezone: formData.get("timezone") ?? "Africa/Johannesburg",
      notificationEmail: formData.get("notificationEmail"),
    });
    return;
  } catch {
    return;
  }
}
