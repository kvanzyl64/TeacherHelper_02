export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 1024;
export const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;
export const RECOVERY_LIFETIME_SECONDS = 30 * 60;

export function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("Invalid email address");
  return normalized;
}

export function validatePassword(password: string): void {
  const length = Array.from(password).length;
  if (length < MIN_PASSWORD_LENGTH || length > MAX_PASSWORD_LENGTH) {
    throw new Error("Invalid password length");
  }
}
