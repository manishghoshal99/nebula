import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#050609",
  colorScheme: "dark",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nebula · Robust Gas Classification Under Distribution Shift",
  description:
    "Interactive visualization of gas-sensor drift compensation: CORAL domain alignment for temporal drift and residualization for concentration shift, holding accuracy where baselines collapse.",
  keywords: [
    "gas sensor",
    "domain adaptation",
    "CORAL",
    "drift compensation",
    "machine learning",
    "nebula",
  ],
  openGraph: {
    title: "Nebula · Gas Classification Under Distribution Shift",
    description:
      "CORAL realigns temporal drift; residualization strips dose bias. Explore the method, results, and a live model.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nebula · Gas Classification Under Distribution Shift",
    description:
      "CORAL realigns temporal drift; residualization strips dose bias. Explore the method, results, and a live model.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
