const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/settings/centre", label: "Centre settings" },
  { href: "/team/invite", label: "Invite team" },
] as const;

export function CentreNavigation() {
  return (
    <nav aria-label="Centre navigation">
      <ul style={{ display: "flex", gap: "1rem", listStyle: "none", padding: 0 }}>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href}>{link.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
