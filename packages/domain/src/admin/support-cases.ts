import { randomUUID } from "node:crypto";

export type SupportCaseStatus = "open" | "in_review" | "resolved";
export type SupportCaseIssueType = "payment" | "access" | "data" | "retention" | "operations";
export type SupportCaseOwner = "platform_owner" | "support_readonly";

export type SupportCase = {
  caseId: string;
  centreId: string;
  issueType: SupportCaseIssueType;
  owner: SupportCaseOwner;
  status: SupportCaseStatus;
  summary: string;
};

export function createSupportCase(input: {
  caseId?: string;
  centreId: string;
  issueType: SupportCaseIssueType;
  owner: SupportCaseOwner;
  status: SupportCaseStatus;
  summary: string;
}): SupportCase {
  return {
    caseId: input.caseId ?? randomUUID(),
    centreId: input.centreId,
    issueType: input.issueType,
    owner: input.owner,
    status: input.status,
    summary: input.summary,
  };
}
