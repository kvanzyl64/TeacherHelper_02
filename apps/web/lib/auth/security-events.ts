import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { normalizeEmail } from "./auth-policy";

export type AuthSecurityEventType =
  | "sign_in_success"
  | "sign_in_failure"
  | "sign_out"
  | "password_change"
  | "recovery_request"
  | "recovery_complete"
  | "session_revoked"
  | "account_disabled"
  | "rate_limited";

export type AuthSecurityEventOutcome = "success" | "failure" | "rate_limited";
export type AuthSecurityScope = "sign_in" | "recovery";
export type AuthSecurityReason =
  "invalid_credentials" | "inactive_account" | "attempt_limit" | "password_updated";

export function digestEmail(email: string | undefined): string | null {
  if (!email) return null;
  try {
    return createHash("sha256").update(normalizeEmail(email)).digest("hex");
  } catch {
    return null;
  }
}

export function digestSource(source: string | undefined): string | null {
  const normalized = source?.trim();
  return normalized ? createHash("sha256").update(normalized).digest("hex") : null;
}

export async function recordAuthenticationEvent(
  client: Pick<PoolClient, "query">,
  input: {
    eventType: AuthSecurityEventType;
    outcome: AuthSecurityEventOutcome;
    email?: string;
    source?: string;
    userId?: string;
    platformAdminId?: string;
    scope?: AuthSecurityScope;
    reasonCode?: AuthSecurityReason;
  },
): Promise<void> {
  if (input.userId && input.platformAdminId) {
    throw new Error("An authentication event cannot identify two account principals");
  }
  const metadata: { scope?: AuthSecurityScope; reasonCode?: AuthSecurityReason } = {};
  if (input.eventType === "rate_limited" && input.scope) metadata.scope = input.scope;
  if (input.reasonCode) metadata.reasonCode = input.reasonCode;
  await client.query(
    `INSERT INTO app.auth_security_events
       (user_id, platform_admin_id, event_type, outcome, email_digest, source_digest, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      input.userId ?? null,
      input.platformAdminId ?? null,
      input.eventType,
      input.outcome,
      digestEmail(input.email),
      digestSource(input.source),
      JSON.stringify(metadata),
    ],
  );
}
