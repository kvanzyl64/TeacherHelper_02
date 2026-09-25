import { GuardianSessionView } from "../../../../features/guardian-link/session-view";

export default function GuardianLinkPage() {
  const session = {
    subject: "Maths progress update",
    topics: ["Fractions", "Multiplication review"],
    attendance: "present",
    notes: "Strong effort this week. Keep revising the conversion practice sheet.",
    homework: "Complete worksheet 3 before Friday.",
    nextFocus: "Decimal place value next session.",
  };

  return (
    <main className="guardian-page">
      <h1>Guardian update</h1>
      <p>This protected link is limited to the approved session for your learner.</p>
      <GuardianSessionView session={session} />
    </main>
  );
}