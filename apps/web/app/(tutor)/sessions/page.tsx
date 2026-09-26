import { PageHeader } from "../../../components/navigation/page-header";

const sampleSessions = [
  { subject: "Maths", reviewStatus: "approved" },
  { subject: "Science", reviewStatus: "submitted" },
  { subject: "Reading", reviewStatus: "draft" },
];

export default function TutorSessionsPage() {
  return (
    <main className="guardian-page">
      <PageHeader title="Tutor sessions" description="Review sessions assigned to you and open their resources." />
      <ul>
        {sampleSessions.map((session) => (
          <li key={session.subject}>
            {session.subject} — {session.reviewStatus}
          </li>
        ))}
      </ul>
    </main>
  );
}