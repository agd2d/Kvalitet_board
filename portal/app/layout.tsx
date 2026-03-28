import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hvidbjerg Service – Kundeportal",
  description: "Kundeportal for Hvidbjerg Service ApS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da" className="h-full">
      <body className="min-h-full bg-gray-50 antialiased font-sans">{children}</body>
    </html>
  );
}
