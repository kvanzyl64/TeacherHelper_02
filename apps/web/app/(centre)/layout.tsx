import type { ReactNode } from "react";
import { AuthenticatedNavigationProvider, CentreNavigation } from "../../components/navigation/centre-navigation";
import { WorkspaceShell } from "../../components/navigation/workspace-shell";
import { requireCentrePermission } from "../../lib/auth/route-guards";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../lib/auth/dal";

export default async function CentreLayout({ children }: Readonly<{ children: ReactNode }>) {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
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
