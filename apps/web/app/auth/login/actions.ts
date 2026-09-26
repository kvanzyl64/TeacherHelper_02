"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { getOidcAuthorizationUrl } from "../../../lib/auth/oidc-provider";

export async function beginOidcSignIn(): Promise<void> {
  const state = randomBytes(32).toString("base64url");
  (await cookies()).set("teacher_helper_oidc_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/auth",
    maxAge: 600,
  });
  redirect(getOidcAuthorizationUrl(state) as Route);
}

export async function logoutPlatformAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("teacher_helper_oidc_id_token");
  cookieStore.delete("teacher_helper_oidc_state");
  redirect("/auth/login" as Route);
}
