import { randomUUID } from "node:crypto";
import { transitionState } from "../state/transitions";

export type TutorAssignmentStatus = "pending" | "active" | "paused" | "ended";
export type TutorAssignment = {
  id: string;
  centreId: string;
  studentId: string;
  tutorUserId: string;
  status: TutorAssignmentStatus;
  startsAt: Date;
  endsAt?: Date;
  assignedBy: string;
};

const assignmentGraph = { pending: ["active", "ended"], active: ["paused", "ended"], paused: ["active", "ended"], ended: [] } as const;

export function createTutorAssignment(input: Omit<TutorAssignment, "id" | "status"> & { status?: TutorAssignmentStatus }): TutorAssignment {
  return { ...input, id: randomUUID(), status: input.status ?? "pending" };
}

export function transitionTutorAssignment(assignment: TutorAssignment, status: TutorAssignmentStatus, now = new Date()): TutorAssignment {
  transitionState(assignmentGraph, assignment.status, status);
  return { ...assignment, status, endsAt: status === "ended" ? now : assignment.endsAt };
}