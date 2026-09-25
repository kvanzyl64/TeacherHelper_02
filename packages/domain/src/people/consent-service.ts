import { randomUUID } from "node:crypto";

export type ConsentDecision = "granted" | "restricted" | "withdrawn";
export type ConsentRecord = {
  id: string;
  centreId: string;
  studentId: string;
  guardianId: string;
  purpose: string;
  decision: ConsentDecision;
  recordedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  recordedBy: string;
};

export function recordConsent(input: Omit<ConsentRecord, "id" | "recordedAt"> & { recordedAt?: Date }): ConsentRecord {
  if (!input.centreId || !input.studentId || !input.guardianId || !input.purpose || !input.recordedBy) {
    throw new Error("Consent scope and actor are required");
  }
  return { ...input, id: randomUUID(), recordedAt: input.recordedAt ?? new Date() };
}

export function latestApplicableConsent(records: ConsentRecord[], input: { centreId: string; studentId: string; guardianId: string; purpose: string }, now = new Date()): ConsentRecord | undefined {
  return records
    .filter((record) => record.centreId === input.centreId && record.studentId === input.studentId && record.guardianId === input.guardianId && record.purpose === input.purpose && (!record.expiresAt || record.expiresAt > now))
    .sort((left, right) => right.recordedAt.getTime() - left.recordedAt.getTime())[0];
}