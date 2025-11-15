import type { Metadata } from "next";
import "./globals.css";
import { CivicAuthProvider } from "@civic/auth/nextjs";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Supershares - Investor Pages",
  description: "Connect with verified investors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CivicAuthProvider>{children}</CivicAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
