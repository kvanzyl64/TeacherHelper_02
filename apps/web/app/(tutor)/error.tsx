"use client";

import { PageState } from "../../components/navigation/page-state";
import { genericPermissionMessage } from "../../lib/auth/route-guards";

export default function TutorError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <PageState kind="unavailable" title="Tutor area unavailable" description={genericPermissionMessage} action={{ href: "/students", label: "Return to my students" }} />
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}