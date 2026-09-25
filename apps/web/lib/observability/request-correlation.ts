import { randomUUID } from "node:crypto";

export const requestIdHeader = "x-request-id";

export function getRequestId(value?: string | null): string {
  return value?.trim() || randomUUID();
}