import type { ReactNode } from "react";
import { AuthenticatedNavigationProvider, CentreNavigation } from "../../components/navigation/centre-navigation";
import { WorkspaceShell } from "../../components/navigation/workspace-shell";
import { requireCentrePermission } from "../../lib/auth/route-guards";

export default function CentreLayout({ children }: Readonly<{ children: ReactNode }>) {
  requireCentrePermission("owner", "centre:read");
  return (
    <section data-scope="centre">
      <AuthenticatedNavigationProvider role="owner">
        <CentreNavigation />
        <WorkspaceShell areaLabel="Centre workspace" parentHref="/dashboard" parentLabel="dashboard">
          {children}
        </WorkspaceShell>
      </AuthenticatedNavigationProvider>
    </section>
  );
}
