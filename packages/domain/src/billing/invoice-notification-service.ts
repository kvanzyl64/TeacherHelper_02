import { randomUUID } from "node:crypto";
import { createAccessLink, type AccessLink } from "../guardian-links/access-link-service";
import { createNotification, type NotificationRecord } from "../notifications/notification-service";

export function createInvoiceAccessLink(input: {
  centreId: string;
  guardianId: string;
  studentId: string;
  recordId: string;
  token: string;
  now?: Date;
}): AccessLink {
  return createAccessLink({
    centreId: input.centreId,
    guardianId: input.guardianId,
    studentId: input.studentId,
    recordType: "invoice",
    recordId: input.recordId,
    token: input.token,
    now: input.now,
  });
}

export function createInvoiceNotification(input: {
  centreId: string;
  guardianId: string;
  studentId: string;
  accessLinkId: string;
  templateKey: string;
  idempotencyKey?: string;
  now?: Date;
}): NotificationRecord {
  return createNotification({
    centreId: input.centreId,
    guardianId: input.guardianId,
    studentId: input.studentId,
    accessLinkId: input.accessLinkId,
    kind: "invoice",
    templateKey: input.templateKey,
    idempotencyKey: input.idempotencyKey ?? `invoice-${randomUUID()}`,
    now: input.now,
  });
}
