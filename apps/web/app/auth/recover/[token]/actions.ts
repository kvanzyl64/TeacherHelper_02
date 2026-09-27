"use server";

import { completePasswordRecoveryAction as completeRecovery } from "../actions";

export async function completePasswordRecoveryAction(
	token: string,
	formData: FormData,
): Promise<void> {
	await completeRecovery(token, formData);
}
