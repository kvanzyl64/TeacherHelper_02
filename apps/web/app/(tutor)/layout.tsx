import type { ReactNode } from "react";

export default function TutorLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <section data-scope="tutor">{children}</section>;
}