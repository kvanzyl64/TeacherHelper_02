import { PageState } from "../components/navigation/page-state";

export default function NotFound() {
  return (
    <main>
      <p>Teacher Helper</p>
      <PageState
        kind="not-found"
        title="That page is not available"
        description="The page may have moved, or the link may no longer be valid. No protected record details are shown here."
        action={{ href: "/", label: "Return to Teacher Helper" }}
      />
    </main>
  );
}