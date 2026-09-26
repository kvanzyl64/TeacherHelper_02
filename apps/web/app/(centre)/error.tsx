"use client";

import { PageState } from "../../components/navigation/page-state";
import { genericPermissionMessage } from "../../lib/auth/route-guards";

export default function CentreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main>
      <PageState kind="unavailable" title="Centre area unavailable" description={genericPermissionMessage} action={{ href: "/dashboard", label: "Return to dashboard" }} />
      <button type="button" onClick={reset}>Try again</button>
    </main>
  );
}