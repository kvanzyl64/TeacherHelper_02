import { randomUUID } from "node:crypto";
import { assertPermission } from "../auth/permissions";
import type { MembershipRole } from "../auth/tenant-context";
import type { CentreOnboardingInput, CentreStatus } from "./centre-schema";

export type CentreRecord = {
  id: string;
  name: string;
  timezone: string;
  plan: "trial" | "subscription";
  status: CentreStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OnboardingRepository = {
  findByActiveName(name: string): Promise<CentreRecord | null>;
  insert(record: CentreRecord): Promise<CentreRecord>;
  updateStatus(id: string, status: CentreStatus): Promise<CentreRecord>;
};

export class DuplicateCentreNameError extends Error {
  constructor() {
    super("A centre with this name already exists");
    this.name = "DuplicateCentreNameError";
  }
}

export class OnboardingService {
  constructor(private readonly repository: OnboardingRepository) {}

  async createCentre(input: {
    actorRole: MembershipRole;
    actorUserId: string;
    centre: CentreOnboardingInput;
  }): Promise<CentreRecord> {
    assertPermission(input.actorRole, "centre:manage");
    const duplicate = await this.repository.findByActiveName(input.centre.name);
    if (duplicate) throw new DuplicateCentreNameError();

    const now = new Date();
    const record: CentreRecord = {
      id: randomUUID(),
      name: input.centre.name,
      timezone: input.centre.timezone,
      plan: input.centre.plan,
      status: input.centre.plan === "trial" ? "trial" : "onboarding",
      createdBy: input.actorUserId,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.insert(record);
  }

  async completeSetup(input: {
    actorRole: MembershipRole;
    centreId: string;
    hasBillingProfile: boolean;
  }): Promise<CentreRecord> {
    assertPermission(input.actorRole, "centre:manage");
    return this.repository.updateStatus(input.centreId, input.hasBillingProfile ? "active" : "trial");
  }
}

export function createInMemoryOnboardingRepository(seed: readonly CentreRecord[] = []): OnboardingRepository {
  const records = new Map(seed.map((record) => [record.id, record]));

  return {
    async findByActiveName(name) {
      const normalized = name.trim().toLowerCase();
      for (const record of records.values()) {
        if (
          record.name.trim().toLowerCase() === normalized &&
          ["onboarding", "trial", "active", "suspended"].includes(record.status)
        ) {
          return record;
        }
      }
      return null;
    },
    async insert(record) {
      records.set(record.id, record);
      return record;
    },
    async updateStatus(id, status) {
      const current = records.get(id);
      if (!current) throw new Error("Centre record was not found");
      const updated = { ...current, status, updatedAt: new Date() };
      records.set(id, updated);
      return updated;
    },
  };
}
