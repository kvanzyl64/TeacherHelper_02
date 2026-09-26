import type { ReactNode } from "react";
import { AdminNavigation } from "../../components/navigation/admin-navigation";
import { requirePlatformAdmin } from "../../lib/auth/route-guards";

export default function PlatformAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const identity = requirePlatformAdmin({ role: "platform_owner", status: "active" });

  return (
    <section data-scope="platform-admin">
      <AdminNavigation role={identity.role} />
      <main>{children}</main>
    </section>
  );
}
