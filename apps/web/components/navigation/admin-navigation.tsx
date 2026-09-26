"use client";

import { usePathname } from "next/navigation";
import type { PlatformAdminRole } from "../../lib/auth/roles";

export type AdminNavigationLink = {
  href: string;
  label: string;
  roles: readonly PlatformAdminRole[];
};

export const adminNavigationLinks = [
  { href: "/admin", label: "Portfolio", roles: ["platform_owner", "support_readonly"] },
  { href: "/admin/billing", label: "Billing", roles: ["platform_owner", "support_readonly"] },
  { href: "/admin/alerts", label: "Alerts", roles: ["platform_owner", "support_readonly"] },
] as const satisfies readonly AdminNavigationLink[];

export function getVisibleAdminNavigationLinks(role: PlatformAdminRole) {
  return adminNavigationLinks.filter((link) => link.roles.includes(role));
}

export function AdminNavigation({ role }: { role: PlatformAdminRole }) {
  const pathname = usePathname();
  const links = getVisibleAdminNavigationLinks(role);

  return (
    <nav aria-label="Platform administration navigation">
      <ul>
        {links.map((link) => {
          const current = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <li key={link.href}>
              <a href={link.href} aria-current={current ? "page" : undefined}>
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
