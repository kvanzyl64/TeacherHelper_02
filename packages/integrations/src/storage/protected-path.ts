import { randomUUID } from "node:crypto";

export type ProtectedObject = {
  centreId: string;
  recordType: "resource" | "invoice" | "export";
  recordId: string;
  objectId: string;
};

export function createProtectedObjectPath(input: Omit<ProtectedObject, "objectId">): ProtectedObject {
  return { ...input, objectId: randomUUID() };
}

export function canAccessProtectedObject(input: {
  object: ProtectedObject;
  centreId: string;
  authorizedRecordId: string;
}): boolean {
  return input.object.centreId === input.centreId && input.object.recordId === input.authorizedRecordId;
}

export function assertProtectedObjectAccess(input: Parameters<typeof canAccessProtectedObject>[0]): void {
  if (!canAccessProtectedObject(input)) throw new Error("The requested file is unavailable");
}