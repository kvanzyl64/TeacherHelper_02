import { describe, expect, it } from "vitest";
import {
  createPeopleRepository,
  DuplicatePeopleRecordError,
  validateGuardianInput,
  validateStudentInput,
} from "../../packages/domain/src/people/people-repository";
import { recordConsent } from "../../packages/domain/src/people/consent-service";

describe("people contract", () => {
  it("requires student identity fields and keeps references centre-scoped", async () => {
    const repository = createPeopleRepository();

    await expect(repository.createStudent("centre-a", validateStudentInput({ reference: "S-001", name: "Ava" }))).resolves.toMatchObject({
      centreId: "centre-a",
      reference: "S-001",
      enrolmentStatus: "active",
    });
    await expect(repository.createStudent("centre-b", validateStudentInput({ reference: "S-001", name: "Ben" }))).resolves.toMatchObject({
      centreId: "centre-b",
    });
    await expect(repository.createStudent("centre-a", validateStudentInput({ reference: "S-001", name: "Another" }))).rejects.toBeInstanceOf(
      DuplicatePeopleRecordError,
    );
  });

  it("normalizes guardian numbers and rejects duplicate active numbers within a centre", async () => {
    const repository = createPeopleRepository();
    const guardian = await repository.createGuardian(
      "centre-a",
      validateGuardianInput({ name: "Sam", whatsappNumber: "+27 82 123 4567" }),
    );

    expect(guardian.whatsappNumber).toBe("27821234567");
    expect(guardian.whatsappNumberStatus).toBe("unconfirmed");
    await expect(
      repository.createGuardian("centre-a", validateGuardianInput({ name: "Alex", whatsappNumber: "27821234567" })),
    ).rejects.toBeInstanceOf(DuplicatePeopleRecordError);
  });

  it("creates pending relationships and records explicit consent decisions", async () => {
    const repository = createPeopleRepository();
    const student = await repository.createStudent("centre-a", validateStudentInput({ reference: "S-001", name: "Ava" }));
    const guardian = await repository.createGuardian(
      "centre-a",
      validateGuardianInput({ name: "Sam", whatsappNumber: "27821234567" }),
    );
    const relationship = await repository.linkGuardianStudent({
      centreId: "centre-a",
      guardianId: guardian.id,
      studentId: student.id,
      relationship: "parent",
    });
    const consent = recordConsent({
      centreId: "centre-a",
      studentId: student.id,
      guardianId: guardian.id,
      purpose: "session_update",
      decision: "granted",
      recordedBy: "admin-1",
    });

    expect(relationship.status).toBe("pending");
    expect(consent.decision).toBe("granted");
  });
});