"use server";

import { error as logError } from "node:console";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { checkAuthenticationRateLimit } from "../../../lib/auth/rate-limit";
import { recordAuthenticationEvent } from "../../../lib/auth/security-events";
import {
  createPasswordRecoveryRequest,
  completePasswordRecovery as consumeRecoveryToken,
} from "../../../lib/auth/recovery";
import { getPasswordRecoveryDelivery } from "../../../lib/auth/recovery-delivery";
import { clearApplicationSessionCookie } from "../../../lib/auth/session";
import { getDatabasePool } from "../../../lib/database";
import { validatePassword } from "../../../lib/auth/auth-policy";

export async function requestPasswordRecovery(formData: FormData): Promise<void> {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue : "";
  const requestHeaders = await headers();
  const source =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    undefined;
  const delivery = getPasswordRecoveryDelivery();
  const client = await getDatabasePool().connect();
  let message = null;

  try {
    await client.query("BEGIN");
    const rateLimit = await checkAuthenticationRateLimit(client, {
      email,
      source,
      scope: "recovery",
    });
    if (!rateLimit.allowed) {
      await recordAuthenticationEvent(client, {
        eventType: "rate_limited",
        outcome: "rate_limited",
        email,
        source,
        scope: "recovery",
        reasonCode: "attempt_limit",
      });
    } else {
      if (delivery) {
        message = await createPasswordRecoveryRequest(
          client,
          email,
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        );
      }
      await recordAuthenticationEvent(client, {
        eventType: "recovery_request",
        outcome: message ? "success" : "failure",
        email,
        source,
      });
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (message && delivery) {
    try {
      await delivery.sendRecoveryMessage(message);
    } catch {
      logError("Password recovery delivery failed.");
    }
  }
  redirect("/auth/recover?sent=1" as Route);
}

export async function completePasswordRecoveryAction(
  token: string,
  formData: FormData,
): Promise<void> {
  const passwordValue = formData.get("password");
  const confirmationValue = formData.get("confirmPassword");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const confirmation = typeof confirmationValue === "string" ? confirmationValue : "";
  if (password !== confirmation) {
    redirect(`/auth/recover/${token}?error=mismatch` as Route);
  }
  try {
    validatePassword(password);
  } catch {
    redirect(`/auth/recover/${token}?error=password` as Route);
  }

  const client = await getDatabasePool().connect();
  let principal: { userId: string | null; platformAdminId: string | null } | null = null;
  try {
    await client.query("BEGIN");
    principal = await consumeRecoveryToken(client, token, password);
    if (principal) {
      await recordAuthenticationEvent(client, {
        eventType: "recovery_complete",
        outcome: "success",
        userId: principal.userId ?? undefined,
        platformAdminId: principal.platformAdminId ?? undefined,
        reasonCode: "password_updated",
      });
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  if (!principal) redirect("/auth/recover?error=invalid" as Route);
  clearApplicationSessionCookie(await cookies());
  redirect("/auth/login?recovered=1" as Route);
}
