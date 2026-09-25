import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import type { Student } from "@teacher-helper/domain/src/people/people-repository";

export function visibleStudentsForRole(input: {
  role: MembershipRole | "guardian";
  centreId: string;
  students: Student[];
  userId?: string;
  assignedStudentIds?: string[];
}) {
  return input.students.filter((student) => {
    if (student.centreId !== input.centreId) return false;
    if (input.role === "owner" || input.role === "admin") return true;
    return input.role === "tutor" && input.assignedStudentIds?.includes(student.id) === true;
  });
}