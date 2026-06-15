import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Robin Bonhoure",
  description: "Développeur front-end React / Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
