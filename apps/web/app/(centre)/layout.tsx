import type { ReactNode } from "react";

export default function CentreLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <section data-scope="centre">{children}</section>;
}