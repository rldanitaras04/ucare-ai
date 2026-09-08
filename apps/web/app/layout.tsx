import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UCare AI - Clinic Management System",
  description: "Unified clinic management system with role-based access",
  icons: {
    icon: "/clinic_logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
