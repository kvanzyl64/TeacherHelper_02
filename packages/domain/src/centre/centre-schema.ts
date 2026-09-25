import { ValidationError, requiredText } from "../validation/validation";

export const centreStatuses = ["onboarding", "trial", "active", "suspended", "archived"] as const;
export const onboardingPlans = ["trial", "subscription"] as const;

export type CentreStatus = (typeof centreStatuses)[number];
export type OnboardingPlan = (typeof onboardingPlans)[number];

export type CentreOnboardingInput = {
  name: string;
  timezone: string;
  plan: OnboardingPlan;
};

function assertOneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
  if (!allowed.includes(value as T)) {
    throw new ValidationError([{ field, message: "The selected value is invalid" }]);
  }
  return value as T;
}

export function normalizeCentreName(value: unknown): string {
  return requiredText(value, "name").replace(/\s+/g, " ");
}

export function validateCentreStatus(value: unknown): CentreStatus {
  return assertOneOf(requiredText(value, "status"), centreStatuses, "status");
}

export function validateOnboardingInput(input: {
  name: unknown;
  timezone?: unknown;
  plan: unknown;
}): CentreOnboardingInput {
  return {
    name: normalizeCentreName(input.name),
    timezone:
      typeof input.timezone === "string" && input.timezone.trim() !== ""
        ? input.timezone.trim()
        : "Africa/Johannesburg",
    plan: assertOneOf(requiredText(input.plan, "plan"), onboardingPlans, "plan"),
  };
}
