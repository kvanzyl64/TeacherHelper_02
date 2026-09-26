import { PageState } from "../../../components/navigation/page-state";

export default function PlatformAdminForbiddenPage() {
  return (
    <main>
      <PageState
        kind="denied"
        title="You do not have access to this area"
        description="This platform administration view is unavailable for your current role. No protected tenant details are shown."
        action={{ href: "/", label: "Return to Teacher Helper" }}
      />
    </main>
  );
}
