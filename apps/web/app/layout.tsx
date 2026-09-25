import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = { title: "Teacher Helper", description: "Tutoring centre operations" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en-ZA">
      <body>{children}</body>
    </html>
  );
}