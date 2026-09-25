import { describe, expect, it } from "vitest";
import {
  createInMemoryOnboardingRepository,
  DuplicateCentreNameError,
  OnboardingService,
} from "../../packages/domain/src/centre/onboarding-service";
import { validateOnboardingInput } from "../../packages/domain/src/centre/centre-schema";

describe("onboarding contract", () => {
  it("creates a valid centre onboarding record", async () => {
    const repository = createInMemoryOnboardingRepository();
    const service = new OnboardingService(repository);

    const created = await service.createCentre({
      actorRole: "owner",
      actorUserId: "owner-1",
      centre: validateOnboardingInput({
        name: "Northside Learning Hub",
        timezone: "Africa/Johannesburg",
        plan: "trial",
      }),
    });

    expect(created.name).toBe("Northside Learning Hub");
    expect(created.status).toBe("trial");
  });

  it("rejects duplicate active centre names", async () => {
    const repository = createInMemoryOnboardingRepository([
      {
        id: "centre-1",
        name: "Northside Learning Hub",
        timezone: "Africa/Johannesburg",
        plan: "trial",
        status: "active",
        createdBy: "owner-seed",
        createdAt: new Date("2026-09-25T00:00:00Z"),
        updatedAt: new Date("2026-09-25T00:00:00Z"),
      },
    ]);
    const service = new OnboardingService(repository);

    await expect(
      service.createCentre({
        actorRole: "owner",
        actorUserId: "owner-2",
        centre: validateOnboardingInput({
          name: "Northside Learning Hub",
          plan: "subscription",
        }),
      }),
    ).rejects.toBeInstanceOf(DuplicateCentreNameError);
  });

  it("supports trial and subscription selection", async () => {
    const repository = createInMemoryOnboardingRepository();
    const service = new OnboardingService(repository);

    const trial = await service.createCentre({
      actorRole: "owner",
      actorUserId: "owner-trial",
      centre: validateOnboardingInput({ name: "Trial Centre", plan: "trial" }),
    });
    const subscription = await service.createCentre({
      actorRole: "owner",
      actorUserId: "owner-sub",
      centre: validateOnboardingInput({ name: "Subscription Centre", plan: "subscription" }),
    });

    expect(trial.status).toBe("trial");
    expect(subscription.status).toBe("onboarding");
  });
});
