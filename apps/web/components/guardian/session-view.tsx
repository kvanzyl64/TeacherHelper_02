export type GuardianSessionViewProps = {
  session: {
    subject?: string;
    topics?: string[];
    attendance?: string;
    notes?: string;
    homework?: string;
    nextFocus?: string;
  };
};

export function GuardianSessionView({ session }: GuardianSessionViewProps) {
  return (
    <section aria-live="polite">
      <h2>{session.subject ?? "Session update"}</h2>
      {session.topics && session.topics.length > 0 ? (
        <ul>
          {session.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      ) : null}
      {session.attendance ? <p>Attendance: {session.attendance}</p> : null}
      {session.notes ? <p>{session.notes}</p> : null}
      {session.homework ? <p>Homework: {session.homework}</p> : null}
      {session.nextFocus ? <p>Next focus: {session.nextFocus}</p> : null}
    </section>
  );
}
