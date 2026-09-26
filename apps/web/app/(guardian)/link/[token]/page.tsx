import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { GuardianSessionView } from "../../../../features/guardian-link/session-view";

export default async function GuardianLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenState = String(token ?? "").toLowerCase();
  const unavailableKind = tokenState.includes("expired") ? "expired" : tokenState.includes("revoked") ? "revoked" : tokenState.includes("denied") ? "denied" : tokenState.includes("failed") ? "failed" : null;

  const session = {
    subject: "Maths progress update",
    topics: ["Fractions", "Multiplication review"],
    attendance: "present",
    notes: "Strong effort this week. Keep revising the conversion practice sheet.",
    homework: "Complete worksheet 3 before Friday.",
    nextFocus: "Decimal place value next session.",
  };

  if (unavailableKind) {
    return (
      <main className="guardian-page">
        <PageState
          kind={unavailableKind}
          title={unavailableKind === "expired" ? "This link has expired" : unavailableKind === "revoked" ? "This link is no longer available" : unavailableKind === "denied" ? "This link is unavailable" : "This link is unavailable"}
          description="This protected link is no longer available. Please ask the centre for a fresh update or try again later."
          action={{ href: "/", label: "Return home" }}
        />
      </main>
    );
  }

  return (
    <main className="guardian-page">
      <PageHeader title="Guardian update" description="This protected link is limited to the approved session for your learner." />
      <GuardianSessionView session={session} />
    </main>
  );
}