"use server";

import { validateGuardianInput, validateStudentInput } from "../../../../../packages/domain/src/people/people-repository";

export async function validateStudentAction(formData: FormData): Promise<void> {
  validateStudentInput({ reference: String(formData.get("reference") ?? ""), name: String(formData.get("name") ?? "") });
}

export async function validateGuardianAction(formData: FormData): Promise<void> {
  validateGuardianInput({ name: String(formData.get("name") ?? ""), whatsappNumber: String(formData.get("whatsappNumber") ?? "") });
}