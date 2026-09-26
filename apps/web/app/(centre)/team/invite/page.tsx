import { inviteTeamMemberAction } from "./actions";
import { PageHeader } from "../../../../components/navigation/page-header";

export default function TeamInvitePage() {
  return (
    <main>
      <PageHeader title="Invite team members" description="Invite administrators and tutors to your centre workspace." />
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
