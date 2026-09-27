"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { authenticateAccountByEmail } from "../../../lib/auth/account";
import { checkAuthenticationRateLimit } from "../../../lib/auth/rate-limit";
import { recordAuthenticationEvent } from "../../../lib/auth/security-events";
import {
  clearApplicationSessionCookie,
  createApplicationSession,
  resolveApplicationSession,
  revokeApplicationSession,
  setApplicationSessionCookie,
  type ApplicationPrincipal,
  sessionCookieName,
} from "../../../lib/auth/session";
import { getDatabasePool } from "../../../lib/database";

export async function signInWithEmailPassword(formData: FormData): Promise<void> {
  const emailValue = formData.get("email");
  const passwordValue = formData.get("password");
  const email = typeof emailValue === "string" ? emailValue : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const requestHeaders = await headers();
  const source =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    undefined;
  const client = await getDatabasePool().connect();
  let token: string | null = null;
  let destination = "/auth/login?error=invalid";

  try {
    await client.query("BEGIN");
    try {
      const rateLimit = await checkAuthenticationRateLimit(client, {
        email,
        source,
        scope: "sign_in",
      });
      if (!rateLimit.allowed) {
        await recordAuthenticationEvent(client, {
          eventType: "rate_limited",
          outcome: "rate_limited",
          email,
          source,
          scope: "sign_in",
          reasonCode: "attempt_limit",
        });
        destination = "/auth/login?error=retry";
      } else {
        const account = await authenticateAccountByEmail(client, email, password);
        if (!account) {
          await recordAuthenticationEvent(client, {
            eventType: "sign_in_failure",
            outcome: "failure",
            email,
            source,
            reasonCode: "invalid_credentials",
          });
        } else {
          const principal: ApplicationPrincipal =
            account.kind === "centre"
              ? { userId: account.id, platformAdminId: null }
              : { userId: null, platformAdminId: account.id };
          const session = await createApplicationSession(client, principal);
          token = session.token;
          destination = account.kind === "platform_admin" ? "/admin" : "/dashboard";
          await recordAuthenticationEvent(client, {
            eventType: "sign_in_success",
            outcome: "success",
            email: account.email,
            source,
            userId: principal.userId ?? undefined,
            platformAdminId: principal.platformAdminId ?? undefined,
          });
        }
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  } finally {
    client.release();
  }

  if (token) setApplicationSessionCookie(await cookies(), token);
  redirect(destination as Route);
}

export async function logoutPlatformAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (token) {
    const client = await getDatabasePool().connect();
    try {
      await client.query("BEGIN");
      try {
        const session = await resolveApplicationSession(client, token);
        await revokeApplicationSession(client, token);
        await recordAuthenticationEvent(client, {
          eventType: "sign_out",
          outcome: "success",
          userId: session?.userId ?? undefined,
          platformAdminId: session?.platformAdminId ?? undefined,
        });
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    } finally {
      client.release();
    }
  }
  clearApplicationSessionCookie(cookieStore);
  cookieStore.delete("teacher_helper_oidc_id_token");
  cookieStore.delete("teacher_helper_oidc_state");
  redirect("/auth/login" as Route);
}
