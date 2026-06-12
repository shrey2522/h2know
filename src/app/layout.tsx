import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "H2Know — Drink Smarter",
  description: "Personal study-tracking dashboard for H2Know water bottles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
