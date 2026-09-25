import "../../../../styles/guardian.css";
import { GuardianVerificationForm } from "../../../../components/guardian/verification-form";
import { verifyGuardianCodeAction } from "./actions";

export default function GuardianVerificationPage() {
  return (
    <main className="guardian-page">
      <h1>Verify your WhatsApp number</h1>
      <p>Enter the one-time code sent to your confirmed guardian number.</p>
      <GuardianVerificationForm action={verifyGuardianCodeAction} />
    </main>
  );
}