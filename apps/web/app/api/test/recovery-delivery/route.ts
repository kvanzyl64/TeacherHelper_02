import { timingSafeEqual } from "node:crypto";
import { takeCapturedPasswordRecoveryMessage } from "../../../../lib/auth/recovery-delivery";

export async function GET(request: Request): Promise<Response> {
  const expectedSecret = process.env.AUTH_TEST_RECOVERY_CAPTURE_SECRET;
  if (process.env.NODE_ENV === "production" || !expectedSecret) {
    return new Response(null, { status: 404 });
  }

  const suppliedSecret = request.headers.get("x-recovery-test-secret") ?? "";
  const expected = Buffer.from(expectedSecret);
  const supplied = Buffer.from(suppliedSecret);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    return new Response(null, { status: 404 });
  }

  const email = new URL(request.url).searchParams.get("email");
  if (!email) return new Response(null, { status: 400 });
  const message = takeCapturedPasswordRecoveryMessage(email);
  if (!message) return new Response(null, { status: 404 });

  return Response.json(
    { recoveryUrl: message.recoveryUrl, expiresAt: message.expiresAt.toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}
