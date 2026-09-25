export type RetentionClass = "student_session" | "billing" | "audit";

export type RetentionCheck = {
  retentionClass: RetentionClass;
  createdAt: Date;
  now: Date;
  retentionPeriodDays: number;
};

export type RetentionEvaluation = {
  retentionClass: RetentionClass;
  requiresDeletion: boolean;
  ageInDays: number;
  retentionPeriodDays: number;
};

export type RetentionRecord = {
  id: string;
  centreId: string;
  retentionClass: RetentionClass;
  status: "active" | "deleted";
  deletedAt?: Date;
};

export function evaluateRetentionPolicy(input: RetentionCheck): RetentionEvaluation {
  const ageInDays = (input.now.getTime() - input.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return {
    retentionClass: input.retentionClass,
    ageInDays,
    retentionPeriodDays: input.retentionPeriodDays,
    requiresDeletion: ageInDays > input.retentionPeriodDays,
  };
}

export function softDeleteRetentionRecord(
  record: RetentionRecord,
  now = new Date(),
): RetentionRecord {
  return {
    ...record,
    status: "deleted",
    deletedAt: now,
  };
}
