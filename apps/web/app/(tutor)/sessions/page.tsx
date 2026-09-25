const sampleSessions = [
  { subject: "Maths", reviewStatus: "approved" },
  { subject: "Science", reviewStatus: "submitted" },
  { subject: "Reading", reviewStatus: "draft" },
];

export default function TutorSessionsPage() {
  return (
    <main className="guardian-page">
      <h1>Tutor sessions</h1>
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