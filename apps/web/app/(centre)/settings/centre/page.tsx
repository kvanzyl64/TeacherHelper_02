import { saveCentreSettingsAction } from "./actions";
import { PageHeader } from "../../../../components/navigation/page-header";

export default function CentreSettingsPage() {
  return (
    <main>
      <PageHeader title="Centre settings" description="Configure your centre profile, timezone, and notification defaults." />
      <form action={saveCentreSettingsAction}>
        <label htmlFor="legalName">Legal name</label>
        <input id="legalName" name="legalName" defaultValue="Demo Centre (Pty) Ltd" />
        <label htmlFor="timezone">Timezone</label>
        <input id="timezone" name="timezone" defaultValue="Africa/Johannesburg" />
        <label htmlFor="notificationEmail">Notification email</label>
        <input id="notificationEmail" name="notificationEmail" defaultValue="ops@example.test" />
      </form>
    </main>
  );
}
