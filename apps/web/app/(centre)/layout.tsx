import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { AuthenticatedNavigationProvider, CentreNavigation } from "../../components/navigation/centre-navigation";
import { WorkspaceShell } from "../../components/navigation/workspace-shell";
import { requireCentrePermission } from "../../lib/auth/route-guards";
import { AuthorizationError, getCurrentCentreMembership, getCurrentIdentity } from "../../lib/auth/dal";

export default async function CentreLayout({ children }: Readonly<{ children: ReactNode }>) {
  // A layout cannot be caught by its own error.tsx, so an unauthenticated visitor would otherwise
  // get a raw 500 instead of being sent to sign in.
  let membership: Awaited<ReturnType<typeof getCurrentCentreMembership>>;
  try {
    const identity = await getCurrentIdentity();
    membership = await getCurrentCentreMembership(identity);
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/auth/login" as Route);
    throw error;
  }
  requireCentrePermission(membership.role, "centre:read");
  return (
    <section data-scope="centre">
      <AuthenticatedNavigationProvider role={membership.role}>
        <CentreNavigation />
        <WorkspaceShell areaLabel="Centre workspace" parentHref="/dashboard" parentLabel="dashboard">
          {children}
        </WorkspaceShell>
      </AuthenticatedNavigationProvider>
    </section>
  );
}
