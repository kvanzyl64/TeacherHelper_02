import { GuardianVerificationForm } from "../../../../components/guardian/verification-form";

export default function PeopleVerificationPage() {
  return (
    <main>
      <h1>Guardian verification</h1>
      <p>Confirm the relationship and send a one-time WhatsApp number challenge.</p>
      <GuardianVerificationForm>
        <label htmlFor="guardian">Guardian ID</label>
        <input id="guardian" name="guardian" required />
        <button type="submit">Request code</button>
      </GuardianVerificationForm>
    </main>
  );
}