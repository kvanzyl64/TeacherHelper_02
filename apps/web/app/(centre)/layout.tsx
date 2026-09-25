import type { ReactNode } from "react";
import { CentreNavigation } from "../../components/navigation/centre-navigation";
import { requireCentrePermission } from "../../lib/auth/route-guards";

export default function CentreLayout({ children }: Readonly<{ children: ReactNode }>) {
  requireCentrePermission("owner", "centre:read");
  return (
    <section data-scope="centre">
      <CentreNavigation />
      {children}
    </section>
  );
}
