import { randomUUID } from "node:crypto";

export type EnrolmentStatus = "enquiry" | "active" | "paused" | "withdrawn" | "archived";
export type WhatsappNumberStatus = "unconfirmed" | "code_pending" | "confirmed" | "revoked";
export type RelationshipStatus = "pending" | "active" | "revoked";

export type Student = {
  id: string;
  centreId: string;
  reference: string;
  name: string;
  dateOfBirth?: string;
  enrolmentStatus: EnrolmentStatus;
  academicInfo?: string;
  accommodations?: string;
  goals?: string;
  visibilityPolicy?: string;
};

export type Guardian = {
  id: string;
  centreId: string;
  name: string;
  whatsappNumber: string;
  whatsappNumberStatus: WhatsappNumberStatus;
  relationshipStatus: RelationshipStatus;
};

export type GuardianStudent = {
  id: string;
  centreId: string;
  guardianId: string;
  studentId: string;
  relationship: string;
  visibilityPolicy?: string;
  relationshipConfirmedAt?: Date;
  relationshipConfirmedBy?: string;
  status: RelationshipStatus;
};

export class DuplicatePeopleRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DuplicatePeopleRecordError";
  }
}

export class InvalidPeopleInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPeopleInputError";
  }
}

export function normalizeWhatsappNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    throw new InvalidPeopleInputError("A valid WhatsApp number is required");
  }
  return digits;
}

export function validateStudentInput(input: {
  reference: string;
  name: string;
  dateOfBirth?: string;
  enrolmentStatus?: EnrolmentStatus;
  academicInfo?: string;
  accommodations?: string;
  goals?: string;
  visibilityPolicy?: string;
}): Omit<Student, "id" | "centreId"> {
  const reference = input.reference.trim();
  const name = input.name.trim();
  if (!reference || !name) throw new InvalidPeopleInputError("Student reference and name are required");
  return { ...input, reference, name, enrolmentStatus: input.enrolmentStatus ?? "active" };
}

export function validateGuardianInput(input: {
  name: string;
  whatsappNumber: string;
}): Pick<Guardian, "name" | "whatsappNumber"> {
  const name = input.name.trim();
  if (!name) throw new InvalidPeopleInputError("Guardian name is required");
  return { name, whatsappNumber: normalizeWhatsappNumber(input.whatsappNumber) };
}

export type PeopleRepository = {
  createStudent(centreId: string, input: Omit<Student, "id" | "centreId">): Promise<Student>;
  createGuardian(centreId: string, input: Pick<Guardian, "name" | "whatsappNumber">): Promise<Guardian>;
  linkGuardianStudent(input: Omit<GuardianStudent, "id" | "status">): Promise<GuardianStudent>;
  getStudent(centreId: string, id: string): Promise<Student | undefined>;
  getGuardian(centreId: string, id: string): Promise<Guardian | undefined>;
  getRelationship(centreId: string, guardianId: string, studentId: string): Promise<GuardianStudent | undefined>;
  saveGuardian(guardian: Guardian): Promise<Guardian>;
  saveRelationship(relationship: GuardianStudent): Promise<GuardianStudent>;
};

export function createPeopleRepository(): PeopleRepository {
  const students: Student[] = [];
  const guardians: Guardian[] = [];
  const relationships: GuardianStudent[] = [];

  return {
    async createStudent(centreId, input) {
      if (students.some((student) => student.centreId === centreId && student.reference === input.reference)) {
        throw new DuplicatePeopleRecordError("The student reference is already in use");
      }
      const student = { ...input, id: randomUUID(), centreId };
      students.push(student);
      return student;
    },
    async createGuardian(centreId, input) {
      if (guardians.some((guardian) => guardian.centreId === centreId && guardian.whatsappNumber === input.whatsappNumber && guardian.whatsappNumberStatus !== "revoked")) {
        throw new DuplicatePeopleRecordError("The WhatsApp number is already in use");
      }
      const guardian: Guardian = {
        ...input,
        id: randomUUID(),
        centreId,
        whatsappNumberStatus: "unconfirmed",
        relationshipStatus: "pending",
      };
      guardians.push(guardian);
      return guardian;
    },
    async linkGuardianStudent(input) {
      if (input.centreId === "" || !students.some((student) => student.id === input.studentId && student.centreId === input.centreId) || !guardians.some((guardian) => guardian.id === input.guardianId && guardian.centreId === input.centreId)) {
        throw new Error("The people relationship is unavailable");
      }
      if (relationships.some((relationship) => relationship.centreId === input.centreId && relationship.guardianId === input.guardianId && relationship.studentId === input.studentId && relationship.status !== "revoked")) {
        throw new DuplicatePeopleRecordError("The guardian relationship is already active");
      }
      const relationship: GuardianStudent = { ...input, id: randomUUID(), status: "pending" };
      relationships.push(relationship);
      return relationship;
    },
    async getStudent(centreId, id) { return students.find((student) => student.centreId === centreId && student.id === id); },
    async getGuardian(centreId, id) { return guardians.find((guardian) => guardian.centreId === centreId && guardian.id === id); },
    async getRelationship(centreId, guardianId, studentId) {
      return relationships.find((relationship) => relationship.centreId === centreId && relationship.guardianId === guardianId && relationship.studentId === studentId);
    },
    async saveGuardian(guardian) {
      const index = guardians.findIndex((item) => item.id === guardian.id && item.centreId === guardian.centreId);
      if (index < 0) throw new Error("The guardian is unavailable");
      guardians[index] = guardian;
      return guardian;
    },
    async saveRelationship(relationship) {
      const index = relationships.findIndex((item) => item.id === relationship.id && item.centreId === relationship.centreId);
      if (index < 0) throw new Error("The relationship is unavailable");
      relationships[index] = relationship;
      return relationship;
    },
  };
}