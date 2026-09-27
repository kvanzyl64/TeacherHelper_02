"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createPostgresPlatformAlertRepository } from "@teacher-helper/integrations/src/admin/postgres-alerts";
import { createPostgresSupportCaseRepository } from "@teacher-helper/integrations/src/admin/postgres-support-cases";
import { getCurrentIdentity, requirePlatformOwner } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";

export async function updatePlatformAlert(formData: FormData): Promise<void> {
  const alertId = formData.get("alertId");
  const status = formData.get("status");
  if (typeof alertId !== "string" || (status !== "acknowledged" && status !== "resolved")) {
    throw new Error("The requested resource is unavailable");
  }
  const owner = requirePlatformOwner(await getCurrentIdentity(), "admin:alerts:manage");
  const client = await getDatabasePool().connect();
  try {
    await createPostgresPlatformAlertRepository(client).updateAlertStatus(alertId, status, owner.id, randomUUID());
  } finally {
    client.release();
  }
  revalidatePath("/admin/alerts");
}

export async function updatePlatformSupportCase(formData: FormData): Promise<void> {
  const caseId = formData.get("caseId");
  const status = formData.get("status");
  if (typeof caseId !== "string" || (status !== "in_review" && status !== "resolved")) {
    throw new Error("The requested resource is unavailable");
  }
  const owner = requirePlatformOwner(await getCurrentIdentity(), "admin:alerts:manage");
  const client = await getDatabasePool().connect();
  try {
    await createPostgresSupportCaseRepository(client).updateCaseStatus(caseId, status, owner.id, randomUUID());
  } finally {
    client.release();
  }
  revalidatePath("/admin/alerts");
}