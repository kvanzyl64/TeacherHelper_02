import { saveCentreSettingsAction } from "./actions";

export default function CentreSettingsPage() {
  return (
    <main>
      <h1>Centre settings</h1>
      <p>Configure your centre profile, timezone, and notification defaults.</p>
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
