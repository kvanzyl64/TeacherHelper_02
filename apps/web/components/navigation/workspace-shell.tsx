import type { ReactNode } from "react";

type WorkspaceShellProps = {
  children: ReactNode;
  areaLabel: string;
  parentHref: string;
  parentLabel: string;
  centreLabel?: string;
};

export function WorkspaceShell({
  children,
  areaLabel,
  parentHref,
  parentLabel,
  centreLabel = "Current centre",
}: WorkspaceShellProps) {
  return (
    <section className="workspace-shell" data-centre={centreLabel}>
      <header className="workspace-shell__header">
        <div>
          <p className="workspace-shell__scope">{centreLabel}</p>
          <p className="workspace-shell__area" aria-current="page">{areaLabel}</p>
        </div>
        <a className="workspace-shell__parent" href={parentHref}>Back to {parentLabel}</a>
      </header>
      <div className="workspace-shell__content">{children}</div>
    </section>
  );
}