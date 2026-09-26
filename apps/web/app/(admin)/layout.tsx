import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { AdminNavigation } from "../../components/navigation/admin-navigation";
import { requirePlatformAdmin } from "../../lib/auth/route-guards";
import { getPlatformAdminSession } from "../../lib/auth/platform-admin-session";
import { logoutPlatformAdmin } from "../auth/login/actions";

export default async function PlatformAdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const session = await getPlatformAdminSession();
  if (!session) redirect("/auth/login" as Route);
  const identity = requirePlatformAdmin({ role: session.role, status: session.status });

  return (
    <section data-scope="platform-admin">
      <AdminNavigation role={identity.role} />
      <form action={logoutPlatformAdmin}>
        <button type="submit">Sign out</button>
      </form>
      <div>{children}</div>
    </section>
  );
}
