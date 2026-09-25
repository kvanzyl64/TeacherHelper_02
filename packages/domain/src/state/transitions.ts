export type StateGraph = Readonly<Record<string, readonly string[]>>;

export class InvalidTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`The state cannot change from ${from} to ${to}`);
    this.name = "InvalidTransitionError";
  }
}

export function transitionState(graph: StateGraph, from: string, to: string): string {
  if (!graph[from]?.includes(to)) throw new InvalidTransitionError(from, to);
  return to;
}

export const stateGraphs = {
  membership: { invited: ["active", "revoked", "expired"], active: ["revoked"], revoked: [], expired: [] },
  guardianVerification: { unconfirmed: ["code_pending", "revoked"], code_pending: ["confirmed", "revoked", "unconfirmed"], confirmed: ["revoked"], revoked: [] },
  session: { draft: ["submitted"], submitted: ["approved", "rejected"], approved: ["superseded"], rejected: ["draft"], superseded: [] },
  accessLink: { pending: ["active", "revoked"], active: ["expired", "revoked", "consumed"], consumed: [], expired: [], revoked: [] },
  notification: { queued: ["sending", "cancelled"], sending: ["delivered", "retrying", "failed"], retrying: ["sending", "failed"], delivered: [], failed: [], cancelled: [] },
  invoice: { draft: ["issued", "cancelled"], issued: ["partially_paid", "paid", "disputed", "failed", "cancelled"], partially_paid: ["paid", "disputed", "failed", "cancelled"], paid: ["disputed"], disputed: ["paid", "failed", "cancelled"], failed: ["issued", "cancelled"], cancelled: [] },
  export: { requested: ["processing", "failed"], processing: ["ready", "failed"], ready: ["expired", "deleted"], expired: ["deleted"], failed: ["requested"], deleted: [] },
} as const;