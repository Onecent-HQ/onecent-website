import type { Metadata } from "next";
import "./globals.css";
import { CivicAuthProvider } from "@civic/auth/nextjs";
import { Analytics } from "@vercel/analytics/next";

const appName = "Supershares";
const description = "An exclusive network of investors shaping the future of on-chain finance. Explore curated portfolios and connect with aligned partners.";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || "https://www.supershares.io";

export const metadata: Metadata = {
  title: appName,
  authors: [{ name: appName, url: appUrl }],
  description: description,
  icons: {
    icon: [
      "/assets/logos/Logo_2 Background Removed.png",
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "512x512", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "96x96", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "48x48", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: [
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/assets/logos/Logo_2 Background Removed.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: appName,
    description: description,
    siteName: appName,
    url: appUrl,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${appUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: appName,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: appName,
    description: description,
    images: [
      {
        url: `${appUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: appName,
      },
    ],
  },
  metadataBase: new URL(appUrl || ""),
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
