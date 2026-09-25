import { randomUUID } from "node:crypto";

export type ExportStatus = "requested" | "processing" | "ready" | "failed" | "expired" | "deleted";
export type ExportScope = "student_session" | "billing" | "audit" | "centre";

export type ExportRequest = {
  id: string;
  centreId: string;
  requestedBy: string;
  scope: ExportScope;
  status: ExportStatus;
  storageReference: string;
  requestedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  failureReason?: string;
};

export function createExportRequest(input: {
  centreId: string;
  requestedBy: string;
  scope: ExportScope;
  storageReference: string;
  now?: Date;
}): ExportRequest {
  const now = input.now ?? new Date();
  return {
    id: randomUUID(),
    centreId: input.centreId,
    requestedBy: input.requestedBy,
    scope: input.scope,
    status: "requested",
    storageReference: input.storageReference,
    requestedAt: now,
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
}

export function processExportRequest(
  request: ExportRequest,
  input: { ready?: boolean; failureReason?: string; now?: Date },
): ExportRequest {
  const now = input.now ?? new Date();

  if (input.failureReason) {
    return {
      ...request,
      status: "failed",
      failureReason: input.failureReason,
      completedAt: now,
    };
  }

  return {
    ...request,
    status: input.ready === false ? "processing" : "ready",
    completedAt: input.ready === false ? undefined : now,
    expiresAt: input.ready === false ? request.expiresAt : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
}

export function expireExportRequest(request: ExportRequest, now = new Date()): ExportRequest {
  if (request.status === "deleted") {
    return request;
  }

  return {
    ...request,
    status: "expired",
    completedAt: request.completedAt ?? now,
    expiresAt: request.expiresAt ?? now,
  };
}
