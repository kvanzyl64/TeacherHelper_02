"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { getDatabasePool } from "../../../lib/database";
import { verifyPlatformAdminPassword } from "../../../lib/auth/platform-admin-credentials";
import {
  createPlatformAdminSession,
  revokePlatformAdminSession,
  setPlatformAdminSessionCookie,
} from "../../../lib/auth/platform-admin-session";

export async function loginPlatformAdmin(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length === 0 || password.length > 1024) {
    redirect("/auth/login?error=invalid" as Route);
  }

  const result = await getDatabasePool().query<{
    id: string;
    password_hash: string;
    status: "active" | "suspended" | "disabled";
  }>(
    `SELECT id, password_hash, status
     FROM app.platform_admins
     WHERE lower(trim(email)) = $1`,
    [email],
  );
  const admin = result.rows[0];
  if (
    !admin ||
    admin.status !== "active" ||
    !(await verifyPlatformAdminPassword(password, admin.password_hash))
  ) {
    redirect("/auth/login?error=invalid" as Route);
  }

  const token = await createPlatformAdminSession(admin.id);
  await getDatabasePool().query(
    "UPDATE app.platform_admins SET last_login_at = now(), updated_at = now() WHERE id = $1",
    [admin.id],
  );
  await setPlatformAdminSessionCookie(token);
  redirect("/admin");
}

export async function logoutPlatformAdmin(): Promise<void> {
  await revokePlatformAdminSession();
  redirect("/auth/login" as Route);
}
