import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeOidcCode, verifyOidcIdToken } from "../../../lib/auth/oidc-provider";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("teacher_helper_oidc_state")?.value;
  if (!code || !state || !expectedState || state !== expectedState) return NextResponse.redirect(new URL("/auth/login?error=invalid", request.url));

  try {
    const idToken = await exchangeOidcCode(code);
    await verifyOidcIdToken(idToken);
    cookieStore.set("teacher_helper_oidc_id_token", idToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    });
    cookieStore.delete("teacher_helper_oidc_state");
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch {
    return NextResponse.redirect(new URL("/auth/login?error=invalid", request.url));
  }
}