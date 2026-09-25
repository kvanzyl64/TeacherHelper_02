export type RecoveryAlertStatus = "ok" | "warning" | "critical";

export type RecoveryAlert = {
  id: string;
  centreId: string;
  status: RecoveryAlertStatus;
  lastKnownSuccessAt?: Date;
  failedAt?: Date;
  message: string;
};

export function createRecoveryAlert(input: {
  id: string;
  centreId: string;
  status?: RecoveryAlertStatus;
  lastKnownSuccessAt?: Date;
  failedAt?: Date;
  message: string;
}): RecoveryAlert {
  return {
    id: input.id,
    centreId: input.centreId,
    status: input.status ?? "warning",
    lastKnownSuccessAt: input.lastKnownSuccessAt,
    failedAt: input.failedAt,
    message: input.message,
  };
}

export function markRecoveryFailure(alert: RecoveryAlert, failedAt = new Date()): RecoveryAlert {
  return {
    ...alert,
    status: "critical",
    failedAt,
    message: alert.message || "Backup or recovery check failed",
  };
}
