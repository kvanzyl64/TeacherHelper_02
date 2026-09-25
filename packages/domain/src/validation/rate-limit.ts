export type RateLimitDecision = { allowed: boolean; retryAfterSeconds?: number };

export interface RateLimitHook {
  check(input: { key: string; limit: number; windowSeconds: number }): RateLimitDecision;
}

export const allowAllRateLimitHook: RateLimitHook = {
  check: () => ({ allowed: true }),
};