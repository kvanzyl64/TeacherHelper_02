import type { PoolClient } from "pg";
import { digestEmail, digestSource, type AuthSecurityScope } from "./security-events";

export const MAX_SIGN_IN_FAILURES = 5;
export const MAX_RECOVERY_REQUESTS = 3;
export const AUTH_RATE_LIMIT_WINDOW_SECONDS = 15 * 60;

export type AuthenticationRateLimitDecision = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function checkAuthenticationRateLimit(
  client: Pick<PoolClient, "query">,
  input: { email: string; source?: string; scope: AuthSecurityScope },
): Promise<AuthenticationRateLimitDecision> {
  const limit = input.scope === "sign_in" ? MAX_SIGN_IN_FAILURES : MAX_RECOVERY_REQUESTS;
  const eventType = input.scope === "sign_in" ? "sign_in_failure" : "recovery_request";
  const result = await client.query<{ event_count: number | string }>(
    "SELECT app.count_recent_auth_events($1, $2, $3) AS event_count",
    [digestEmail(input.email), digestSource(input.source), eventType],
  );
  const count = Number(result.rows[0]?.event_count ?? 0);
  const allowed = count < limit;
  return {
    allowed,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: allowed ? 0 : AUTH_RATE_LIMIT_WINDOW_SECONDS,
  };
}
