"use server";

export async function verifyGuardianCodeAction(formData: FormData): Promise<void> {
  const code = String(formData.get("code") ?? "");
  if (!/^\d{6}$/.test(code)) throw new Error("The verification code is invalid");
}