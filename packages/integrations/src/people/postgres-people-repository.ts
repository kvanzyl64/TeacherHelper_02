import type { PeopleRepository, Student, Guardian, GuardianStudent } from "@teacher-helper/domain";

type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[]; rowCount: number | null }>;
};

export function createPostgresPeopleRepository(client: QueryClient): PeopleRepository & {
  listStudents(centreId: string): Promise<readonly Student[]>;
  listGuardians(centreId: string): Promise<readonly Guardian[]>;
} {
  return {
    async createStudent(centreId, input) {
      const result = await client.query<StudentRow>(
        `INSERT INTO app.students (centre_id, reference, name, date_of_birth, enrolment_status, academic_info, accommodations, goals, visibility_policy)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, centre_id, reference, name, date_of_birth, enrolment_status, academic_info, accommodations, goals, visibility_policy`,
        [centreId, input.reference, input.name, input.dateOfBirth ?? null, input.enrolmentStatus, input.academicInfo ?? null, input.accommodations ?? null, input.goals ?? null, input.visibilityPolicy ?? null],
      );
      return mapStudent(result.rows[0]);
    },

    async listStudents(centreId) {
      const result = await client.query<StudentRow>(
        `SELECT id, centre_id, reference, name, date_of_birth, enrolment_status, academic_info, accommodations, goals, visibility_policy
           FROM app.students WHERE centre_id = $1 ORDER BY name, reference`,
        [centreId],
      );
      return result.rows.map(mapStudent);
    },

    async listGuardians(centreId) {
      const result = await client.query<GuardianRow>(
        `SELECT id, centre_id, name, whatsapp_number, whatsapp_number_status, relationship_status
           FROM app.guardians WHERE centre_id = $1 ORDER BY name`,
        [centreId],
      );
      return result.rows.map(mapGuardian);
    },

    async createGuardian(centreId, input) {
      const result = await client.query<GuardianRow>(
        `INSERT INTO app.guardians (centre_id, name, whatsapp_number)
         VALUES ($1, $2, $3)
         RETURNING id, centre_id, name, whatsapp_number, whatsapp_number_status, relationship_status`,
        [centreId, input.name, input.whatsappNumber],
      );
      return mapGuardian(result.rows[0]);
    },

    async linkGuardianStudent(input) {
      const result = await client.query<GuardianStudentRow>(
        `INSERT INTO app.guardian_students (centre_id, guardian_id, student_id, relationship, visibility_policy, relationship_confirmed_at, relationship_confirmed_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, centre_id, guardian_id, student_id, relationship, visibility_policy, relationship_confirmed_at, relationship_confirmed_by, status`,
        [input.centreId, input.guardianId, input.studentId, input.relationship, input.visibilityPolicy ?? null, input.relationshipConfirmedAt ?? null, input.relationshipConfirmedBy ?? null],
      );
      return mapRelationship(result.rows[0]);
    },

    async getStudent(centreId, id) {
      const result = await client.query<StudentRow>("SELECT id, centre_id, reference, name, date_of_birth, enrolment_status, academic_info, accommodations, goals, visibility_policy FROM app.students WHERE centre_id = $1 AND id = $2", [centreId, id]);
      return result.rows[0] ? mapStudent(result.rows[0]) : undefined;
    },

    async getGuardian(centreId, id) {
      const result = await client.query<GuardianRow>("SELECT id, centre_id, name, whatsapp_number, whatsapp_number_status, relationship_status FROM app.guardians WHERE centre_id = $1 AND id = $2", [centreId, id]);
      return result.rows[0] ? mapGuardian(result.rows[0]) : undefined;
    },

    async getRelationship(centreId, guardianId, studentId) {
      const result = await client.query<GuardianStudentRow>("SELECT id, centre_id, guardian_id, student_id, relationship, visibility_policy, relationship_confirmed_at, relationship_confirmed_by, status FROM app.guardian_students WHERE centre_id = $1 AND guardian_id = $2 AND student_id = $3", [centreId, guardianId, studentId]);
      return result.rows[0] ? mapRelationship(result.rows[0]) : undefined;
    },

    async saveGuardian(guardian) {
      await client.query("UPDATE app.guardians SET name = $2, whatsapp_number = $3, whatsapp_number_status = $4, relationship_status = $5, updated_at = now() WHERE centre_id = $1 AND id = $6", [guardian.centreId, guardian.name, guardian.whatsappNumber, guardian.whatsappNumberStatus, guardian.relationshipStatus, guardian.id]);
      return guardian;
    },

    async saveRelationship(relationship) {
      await client.query("UPDATE app.guardian_students SET relationship = $2, visibility_policy = $3, status = $4 WHERE centre_id = $1 AND id = $5", [relationship.centreId, relationship.relationship, relationship.visibilityPolicy ?? null, relationship.status, relationship.id]);
      return relationship;
    },
  };
}

type StudentRow = { id: string; centre_id: string; reference: string; name: string; date_of_birth: string | null; enrolment_status: Student["enrolmentStatus"]; academic_info: string | null; accommodations: string | null; goals: string | null; visibility_policy: string | null };
type GuardianRow = { id: string; centre_id: string; name: string; whatsapp_number: string; whatsapp_number_status: Guardian["whatsappNumberStatus"]; relationship_status: Guardian["relationshipStatus"] };
type GuardianStudentRow = { id: string; centre_id: string; guardian_id: string; student_id: string; relationship: string; visibility_policy: string | null; relationship_confirmed_at: Date | null; relationship_confirmed_by: string | null; status: GuardianStudent["status"] };

function mapStudent(row: StudentRow): Student { return { id: row.id, centreId: row.centre_id, reference: row.reference, name: row.name, dateOfBirth: row.date_of_birth ?? undefined, enrolmentStatus: row.enrolment_status, academicInfo: row.academic_info ?? undefined, accommodations: row.accommodations ?? undefined, goals: row.goals ?? undefined, visibilityPolicy: row.visibility_policy ?? undefined }; }
function mapGuardian(row: GuardianRow): Guardian { return { id: row.id, centreId: row.centre_id, name: row.name, whatsappNumber: row.whatsapp_number, whatsappNumberStatus: row.whatsapp_number_status, relationshipStatus: row.relationship_status }; }
function mapRelationship(row: GuardianStudentRow): GuardianStudent { return { id: row.id, centreId: row.centre_id, guardianId: row.guardian_id, studentId: row.student_id, relationship: row.relationship, visibilityPolicy: row.visibility_policy ?? undefined, relationshipConfirmedAt: row.relationship_confirmed_at ?? undefined, relationshipConfirmedBy: row.relationship_confirmed_by ?? undefined, status: row.status }; }