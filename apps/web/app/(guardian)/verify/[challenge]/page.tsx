import "../../../../styles/guardian.css";
import { GuardianVerificationForm } from "../../../../components/guardian/verification-form";
import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { verifyGuardianCodeAction } from "./actions";

export default function GuardianVerificationPage({ params }: { params: { challenge: string } }) {
  const challengeState = String(params.challenge ?? "").toLowerCase();
  const challengeFailed = challengeState.includes("expired") || challengeState.includes("invalid") || challengeState.includes("revoked");

  return (
    <main className="guardian-page">
      {challengeFailed ? (
        <PageState
          kind="expired"
          title="This code is no longer valid"
          description="The verification link has expired or is no longer valid. Please request a fresh code from the centre or try again later."
          action={{ href: "/", label: "Return home" }}
        />
      ) : (
        <>
          <PageHeader title="Verify your WhatsApp number" description="Enter the one-time code sent to your confirmed guardian number." />
          <GuardianVerificationForm action={verifyGuardianCodeAction} />
        </>
      )}
    </main>
  );
}