export default async function InvitationAcceptancePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <main>
      <h1>Accept invitation</h1>
      <p>Invitation token: {token.slice(0, 8)}...</p>
      <p>Sign in to accept this centre invitation.</p>
    </main>
  );
}