import type { GuardianStudent, Student } from "./people-repository";
import type { MembershipRole } from "../auth/tenant-context";

export function canViewStudent(input: { role: MembershipRole | "guardian"; centreId: string; student: Student; relationship?: GuardianStudent; userId?: string; assignedTutorIds?: string[] }): boolean {
  if (input.student.centreId !== input.centreId) return false;
  if (input.role === "owner" || input.role === "admin") return true;
  if (input.role === "guardian") return input.relationship?.status === "active" && input.relationship.centreId === input.centreId;
  return Boolean(input.userId && input.assignedTutorIds?.includes(input.userId));
}