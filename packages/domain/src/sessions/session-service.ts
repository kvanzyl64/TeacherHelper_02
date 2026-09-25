import { randomUUID } from "node:crypto";

export type SessionReviewStatus = "draft" | "submitted" | "approved" | "rejected" | "superseded";
export type SessionAttendance = "present" | "absent" | "late" | "excused";
export type GuardianVisibleField = "subject" | "topics" | "attendance" | "notes" | "homework" | "nextFocus";

export type SessionVisibility = Partial<Record<GuardianVisibleField, boolean>>;

export type SessionRecord = {
  id: string;
  centreId: string;
  studentId: string;
  tutorUserId: string;
  occurredAt: Date;
  durationMinutes: number;
  subject: string;
  topics: string[];
  attendance: SessionAttendance;
  notes?: string;
  homework?: string;
  nextFocus?: string;
  reviewStatus: SessionReviewStatus;
  approvedAt?: Date;
  approvedBy?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  visibility: SessionVisibility;
  rejectionReason?: string;
};

export type SessionInput = {
  centreId: string;
  studentId: string;
  tutorUserId: string;
  occurredAt: Date;
  durationMinutes: number;
  subject: string;
  topics?: string[];
  attendance: SessionAttendance;
  notes?: string;
  homework?: string;
  nextFocus?: string;
  visibility?: SessionVisibility;
};

export function validateSessionInput(input: SessionInput): SessionInput {
  if (!input.centreId || !input.studentId || !input.tutorUserId) {
    throw new Error("The session identity is incomplete");
  }

  if (input.durationMinutes <= 0) {
    throw new Error("The session duration must be greater than zero");
  }

  if (!input.subject.trim()) {
    throw new Error("The session subject is required");
  }

  return {
    ...input,
    subject: input.subject.trim(),
    topics: (input.topics ?? []).map((topic) => topic.trim()).filter(Boolean),
    visibility: {
      subject: false,
      topics: false,
      attendance: false,
      notes: true,
      homework: true,
      nextFocus: true,
      ...input.visibility,
    },
  };
}

export function createSessionRecord(input: SessionInput): SessionRecord {
  const validInput = validateSessionInput(input);
  const now = new Date();

  return {
    id: randomUUID(),
    centreId: validInput.centreId,
    studentId: validInput.studentId,
    tutorUserId: validInput.tutorUserId,
    occurredAt: validInput.occurredAt,
    durationMinutes: validInput.durationMinutes,
    subject: validInput.subject,
    topics: validInput.topics ?? [],
    attendance: validInput.attendance,
    notes: validInput.notes?.trim() || undefined,
    homework: validInput.homework?.trim() || undefined,
    nextFocus: validInput.nextFocus?.trim() || undefined,
    reviewStatus: "draft",
    version: 1,
    createdAt: now,
    updatedAt: now,
    visibility: validInput.visibility ?? {},
  };
}

export function submitSession(session: SessionRecord): SessionRecord {
  if (session.reviewStatus !== "draft") {
    throw new Error("Only a draft session can be submitted for approval");
  }

  return {
    ...session,
    reviewStatus: "submitted",
    updatedAt: new Date(),
    version: session.version + 1,
  };
}

export function approveSession(session: SessionRecord, approvedBy = "centre-admin"): SessionRecord {
  if (session.reviewStatus !== "submitted") {
    throw new Error("Only a submitted session can be approved");
  }

  const now = new Date();
  return {
    ...session,
    reviewStatus: "approved",
    approvedAt: now,
    approvedBy,
    updatedAt: now,
    version: session.version + 1,
  };
}

export function rejectSession(session: SessionRecord, reason = "needs_review"): SessionRecord {
  if (session.reviewStatus !== "submitted" && session.reviewStatus !== "draft") {
    throw new Error("Only a draft or submitted session can be rejected");
  }

  return {
    ...session,
    reviewStatus: "rejected",
    rejectionReason: reason,
    updatedAt: new Date(),
    version: session.version + 1,
  };
}

export function supersedeSession(session: SessionRecord): SessionRecord {
  if (session.reviewStatus !== "approved") {
    throw new Error("Only an approved session can be superseded");
  }

  return {
    ...session,
    reviewStatus: "superseded",
    updatedAt: new Date(),
    version: session.version + 1,
  };
}

export function getGuardianVisibleFields(session: SessionRecord): Record<string, unknown> {
  if (session.reviewStatus !== "approved") {
    return {};
  }

  const fields: Record<string, unknown> = {};
  const threshold = session.visibility ?? {};

  if (threshold.subject) fields.subject = session.subject;
  if (threshold.topics) fields.topics = session.topics;
  if (threshold.attendance) fields.attendance = session.attendance;
  if (threshold.notes && session.notes) fields.notes = session.notes;
  if (threshold.homework && session.homework) fields.homework = session.homework;
  if (threshold.nextFocus && session.nextFocus) fields.nextFocus = session.nextFocus;

  return fields;
}
