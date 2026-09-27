import { saveCentreSettingsAction } from "./actions";
import { PageHeader } from "../../../../components/navigation/page-header";
import { createPostgresCentreSettingsRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function CentreSettingsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const settings = await withTenantTransaction({
    pool: getDatabasePool(),
    centreId: membership.centreId,
    userId: membership.userId,
    run: (client) => createPostgresCentreSettingsRepository(client).getByCentreId(membership.centreId),
  });
  return (
    <main>
      <PageHeader title="Centre settings" description="Configure your centre profile, timezone, and notification defaults." />
      <form action={saveCentreSettingsAction}>
        <label htmlFor="legalName">Legal name</label>
        <input id="legalName" name="legalName" defaultValue={settings?.legalName ?? ""} />
        <label htmlFor="timezone">Timezone</label>
        <input id="timezone" name="timezone" defaultValue={settings?.timezone ?? "Africa/Johannesburg"} />
        <label htmlFor="notificationEmail">Notification email</label>
        <input id="notificationEmail" name="notificationEmail" defaultValue={settings?.notificationEmail ?? ""} />
        <button type="submit">Save settings</button>
      </form>
    </main>
  );
}
