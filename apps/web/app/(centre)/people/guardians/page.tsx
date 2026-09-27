import { createPostgresPeopleRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function GuardiansPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const guardians = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresPeopleRepository(client).listGuardians(membership.centreId) });
  return (
    <main>
      <h1>Guardians</h1>
      <a href="/people/verification">Verify a guardian number</a>
      {guardians.length ? <ul>{guardians.map((guardian) => <li key={guardian.id}>{guardian.name} · {guardian.whatsappNumberStatus}</li>)}</ul> : <p>Guardian relationships and consent decisions stay centre-scoped.</p>}
    </main>
  );
}