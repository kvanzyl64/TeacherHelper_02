import { assertPermission } from "../auth/permissions";
import type { MembershipRole } from "../auth/tenant-context";
import { requiredText } from "../validation/validation";

export type CentreSettings = {
  centreId: string;
  legalName: string;
  timezone: string;
  notificationEmail: string;
};

export type CentreSettingsRepository = {
  save(settings: CentreSettings): Promise<CentreSettings>;
  getByCentreId(centreId: string): Promise<CentreSettings | null>;
};

export class CentreSettingsService {
  constructor(private readonly repository: CentreSettingsRepository) {}

  async saveSettings(input: {
    actorRole: MembershipRole;
    centreId: string;
    legalName: unknown;
    timezone: unknown;
    notificationEmail: unknown;
  }): Promise<CentreSettings> {
    assertPermission(input.actorRole, "centre:manage");
    return this.repository.save({
      centreId: input.centreId,
      legalName: requiredText(input.legalName, "legalName"),
      timezone: requiredText(input.timezone, "timezone"),
      notificationEmail: requiredText(input.notificationEmail, "notificationEmail"),
    });
  }
}

export function createInMemoryCentreSettingsRepository(
  seed: readonly CentreSettings[] = [],
): CentreSettingsRepository {
  const values = new Map(seed.map((item) => [item.centreId, item]));
  return {
    async save(settings) {
      values.set(settings.centreId, settings);
      return settings;
    },
    async getByCentreId(centreId) {
      return values.get(centreId) ?? null;
    },
  };
}
