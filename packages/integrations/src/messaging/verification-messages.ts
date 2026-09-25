export type VerificationMessage = {
  templateKey: "guardian_number_verification";
  to: string;
  variables: { code: string; expiresInMinutes: number };
};

export function createVerificationMessage(input: { to: string; code: string; expiresInMinutes?: number }): VerificationMessage {
  return {
    templateKey: "guardian_number_verification",
    to: input.to,
    variables: { code: input.code, expiresInMinutes: input.expiresInMinutes ?? 10 },
  };
}