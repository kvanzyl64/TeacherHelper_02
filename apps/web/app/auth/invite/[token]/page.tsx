import { acceptInvitationAction } from "./actions";

export default async function InvitationAcceptancePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const acceptInvitation = acceptInvitationAction.bind(null, token);
  return (
    <main>
      <h1>Accept invitation</h1>
      {error ? <p role="alert">This invitation is no longer available. Please ask the centre for a fresh invite.</p> : null}
      <p>Sign in and confirm to join the centre that invited you. Membership is created only for that centre.</p>
      <form action={acceptInvitation}>
        <button type="submit">Accept invitation</button>
      </form>
    </main>
  );
}