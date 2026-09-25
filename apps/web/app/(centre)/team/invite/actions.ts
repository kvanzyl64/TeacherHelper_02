"use server";

import { createHash, randomBytes } from "node:crypto";
import { createMembershipInvitation } from "@teacher-helper/domain";

function digestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function inviteTeamMemberAction(formData: globalThis.FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "tutor");

  if (!email || (role !== "admin" && role !== "tutor" && role !== "owner")) {
    return;
  }

  const token = randomBytes(24).toString("base64url");
  createMembershipInvitation({
    centreId: "centre-demo",
    email,
    role,
    tokenDigest: digestToken(token),
  });

  return;
}
