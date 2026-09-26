import type { ReactNode } from "react";
import { AuthenticatedNavigationProvider, CentreNavigation } from "../../components/navigation/centre-navigation";
import { WorkspaceShell } from "../../components/navigation/workspace-shell";

export default function TutorLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <section data-scope="tutor">
      <AuthenticatedNavigationProvider role="tutor" centreLabel="Assigned centre">
        <CentreNavigation />
        <WorkspaceShell areaLabel="Tutor workspace" parentHref="/students" parentLabel="my students" centreLabel="Assigned centre">
          {children}
        </WorkspaceShell>
      </AuthenticatedNavigationProvider>
    </section>
  );
}