import { inviteTeamMemberAction } from "./actions";

export default function TeamInvitePage() {
  return (
    <main>
      <h1>Invite team members</h1>
      <p>Invite administrators and tutors to your centre workspace.</p>
      <form action={inviteTeamMemberAction}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="role">Role</label>
        <select id="role" name="role" defaultValue="tutor">
          <option value="admin">Administrator</option>
          <option value="tutor">Tutor</option>
        </select>
      </form>
    </main>
  );
}
