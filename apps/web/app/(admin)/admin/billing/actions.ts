"use server";

import { revalidatePath } from "next/cache";
import { createPostgresBillingRepository } from "@teacher-helper/integrations/src/admin/postgres-billing";
import { getCurrentIdentity, requirePlatformOwner } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";

const statuses = new Set(["paid", "failed", "pending", "overdue", "disputed"]);

export async function updateSaasPayment(formData: FormData): Promise<void> {
  const paymentId = formData.get("paymentId");
  const status = formData.get("status");
  const followUpRequired = formData.get("followUpRequired");
  if (typeof paymentId !== "string" || typeof status !== "string" || !statuses.has(status)) {
    throw new Error("The requested resource is unavailable");
  }
  const owner = requirePlatformOwner(await getCurrentIdentity(), "admin:billing:manage");
  const client = await getDatabasePool().connect();
  try {
    await createPostgresBillingRepository(client).updatePayment(
      paymentId,
      { status: status as "paid" | "failed" | "pending" | "overdue" | "disputed", followUpRequired: followUpRequired === "true" },
      owner.id,
      crypto.randomUUID(),
    );
  } finally {
    client.release();
  }
  revalidatePath("/admin/billing");
}