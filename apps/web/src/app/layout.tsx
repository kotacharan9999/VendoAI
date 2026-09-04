import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendo AI — Autonomous Procurement Intelligence",
  description: "Predict demand. Negotiate better. Protect every margin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
