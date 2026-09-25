export type ValidationIssue = { field: string; message: string };

export class ValidationError extends Error {
  constructor(public readonly issues: readonly ValidationIssue[]) {
    super("The submitted data is invalid");
    this.name = "ValidationError";
  }
}

export function requiredText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError([{ field, message: "A value is required" }]);
  }
  return value.trim();
}