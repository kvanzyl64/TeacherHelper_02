import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { GuardianSessionView } from "../../../../features/guardian-link/session-view";
import { createPostgresAccessLinkRepository, type GuardianLinkView } from "@teacher-helper/integrations";
import { hashOpaqueToken } from "@teacher-helper/domain";
import { getDatabasePool } from "../../../../lib/database";

export default async function GuardianLinkPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const digest = hashOpaqueToken(String(token ?? ""));

  let view: GuardianLinkView | null = null;
  try {
    const client = await getDatabasePool().connect();
    try {
      await client.query("BEGIN");
      view = await createPostgresAccessLinkRepository(client).openLink(digest);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch {
    view = null;
  }

  if (!view || !view.session) {
    return (
      <main className="guardian-page">
        <PageState
          kind="expired"
          title="This link is unavailable"
          description="This protected link is no longer available. Please ask the centre for a fresh update or try again later."
          action={{ href: "/", label: "Return home" }}
        />
      </main>
    );
  }

  return (
    <main className="guardian-page">
      <PageHeader title="Guardian update" description="This protected link is limited to the approved session for your learner." />
      <GuardianSessionView session={view.session} />
    </main>
  );
}