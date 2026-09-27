"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { getDatabasePool } from "../../../../lib/database";

export async function verifyGuardianCodeAction(challenge: string, formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "");
  if (!/^\d{6}$/.test(code)) throw new Error("The verification code is invalid");
  const digest = createHash("sha256").update(code).digest("hex");
  const result = await getDatabasePool().query<{ verified: boolean }>("SELECT app.verify_guardian_challenge($1::uuid, $2) AS verified", [challenge, digest]);
  redirect(result.rows[0]?.verified ? `/verify/${challenge}?verified=true` as Route : `/verify/${challenge}?error=invalid` as Route);
}