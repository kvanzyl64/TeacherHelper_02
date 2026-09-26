"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import { Icon, type IconName } from "./icon";

export type CentreNavigationLink = {
  href: string;
  label: string;
  icon: IconName;
  roles: readonly MembershipRole[];
};

export const centreNavigationLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["owner", "admin", "tutor"] },
  { href: "/onboarding", label: "Onboarding", icon: "plus", roles: ["owner", "admin"] },
  { href: "/people", label: "People", icon: "people", roles: ["owner", "admin"] },
  { href: "/students", label: "My students", icon: "student", roles: ["tutor"] },
  { href: "/sessions", label: "Sessions", icon: "sessions", roles: ["tutor"] },
  { href: "/team/invite", label: "Team", icon: "team", roles: ["owner", "admin"] },
  { href: "/settings/centre", label: "Settings", icon: "settings", roles: ["owner", "admin"] },
  { href: "/exports", label: "Exports", icon: "export", roles: ["owner"] },
  { href: "/operations/alerts", label: "Operations", icon: "alert", roles: ["owner"] },
] as const satisfies readonly CentreNavigationLink[];

export function getVisibleNavigationLinks(role: MembershipRole) {
  return centreNavigationLinks.filter((link) => link.roles.some((linkRole) => linkRole === role));
}

type NavigationContextValue = {
  role: MembershipRole;
  centreLabel: string;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function AuthenticatedNavigationProvider({
  role,
  centreLabel = "Current centre",
  children,
}: Omit<NavigationContextValue, "centreLabel"> & { centreLabel?: string; children: ReactNode }) {
  return <NavigationContext.Provider value={{ role, centreLabel }}>{children}</NavigationContext.Provider>;
}

export function useAuthenticatedNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("Authenticated navigation must be used inside its provider");
  return context;
}

function isCurrentLocation(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CentreNavigation({ role }: { role?: MembershipRole }) {
  const pathname = usePathname();
  const context = useContext(NavigationContext);
  const activeRole = role ?? context?.role ?? "owner";
  const centreLabel = context?.centreLabel ?? "Current centre";
  const links = getVisibleNavigationLinks(activeRole);

  return (
    <nav className="centre-navigation" aria-label={`${activeRole} workspace navigation`}>
      <p className="centre-navigation__scope">{centreLabel}</p>
      <ul className="centre-navigation__list">
        {links.map((link) => {
          const current = isCurrentLocation(pathname, link.href);
          return (
            <li key={link.href}>
              <a className="centre-navigation__link" href={link.href} aria-current={current ? "page" : undefined}>
                <Icon name={link.icon} size={17} />
                <span>{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
