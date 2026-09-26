export type PageStateKind =
  | "loading"
  | "empty"
  | "unavailable"
  | "not-found"
  | "denied"
  | "expired"
  | "revoked"
  | "failed"
  | "complete";

type PageStateProps = {
  kind: PageStateKind;
  title?: string;
  description: string;
  action?: { href: string; label: string };
};

const defaultTitles: Record<PageStateKind, string> = {
  loading: "Loading",
  empty: "Nothing here yet",
  unavailable: "This is not available",
  "not-found": "Page not found",
  denied: "This page is unavailable",
  expired: "This link has expired",
  revoked: "This link is no longer available",
  failed: "Something went wrong",
  complete: "Complete",
};

export function PageState({ kind, title, description, action }: PageStateProps) {
  const isBusy = kind === "loading";

  return (
    <section className={`page-state page-state--${kind}`} aria-busy={isBusy} aria-live={isBusy ? "polite" : "off"}>
      <p className="page-state__label">{kind}</p>
      <h2>{title ?? defaultTitles[kind]}</h2>
      <p>{description}</p>
      {action ? <a className="page-state__action" href={action.href}>{action.label}</a> : null}
    </section>
  );
}