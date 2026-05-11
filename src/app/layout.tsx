import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Regulated Intake Workbench",
  description: "A fixture-first review surface for messy regulated intake handoffs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
